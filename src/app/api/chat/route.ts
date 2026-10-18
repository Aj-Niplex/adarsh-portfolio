import { NextResponse } from "next/server";
import { MAX_QUESTION_CHARS, buildSystemPrompt } from "@/lib/chatPrompt";
import type { ChatEvent } from "@/lib/chatTypes";
import { FREE_PER_MINUTE, SIGNED_IN_PER_MINUTE } from "@/lib/consent";
import { allowedLinks, buildDocs, retrieve } from "@/lib/docs";
import { take } from "@/lib/limiter";
import { clientIp, hashId, readSession, signInAvailable } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BASE = (process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com").replace(/\/$/, "");
const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
// If the first model is rate-limited or down, the next one answers instead.
const MODELS = Array.from(new Set([PRIMARY_MODEL, "gemini-2.5-flash"]));
const DAILY_CAP = Number(process.env.CHAT_DAILY_CAP || 400);
const RETRY_STATUS = new Set([404, 429, 500, 502, 503, 504]);

type IncomingMessage = { role: "user" | "assistant"; content: string };

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function fail(error: string, status: number, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error, ...extra }, { status, headers: { "Cache-Control": "no-store" } });
}

/** Opens the streaming request on the first model that accepts it. */
async function openGeminiStream(apiKey: string, payload: unknown, signal: AbortSignal) {
  let lastStatus = 0;
  for (const model of MODELS) {
    const response = await fetch(BASE + "/v1beta/models/" + model + ":streamGenerateContent?alt=sse", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal
    });
    if (response.ok && response.body) return response;
    lastStatus = response.status;
    await response.body?.cancel().catch(() => {});
    if (!RETRY_STATUS.has(response.status)) break;
  }
  const error = new Error("gemini_" + lastStatus);
  throw error;
}

type GeminiChunk = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> }; finishReason?: string }>;
  promptFeedback?: { blockReason?: string };
};

/** Reads Server-Sent Events from Gemini and yields the text pieces. */
async function* readGemini(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finish = "";
  let blocked = false;

  const parse = (rawEvent: string) => {
    const data = rawEvent
      .split(/\r?\n/)
      .filter((l) => l.startsWith("data:"))
      .map((l) => l.slice(5).trimStart())
      .join("");
    if (!data || data === "[DONE]") return "";
    let chunk: GeminiChunk;
    try {
      chunk = JSON.parse(data) as GeminiChunk;
    } catch {
      return "";
    }
    if (chunk.promptFeedback?.blockReason) blocked = true;
    const candidate = chunk.candidates?.[0];
    if (candidate?.finishReason) finish = candidate.finishReason;
    return (candidate?.content?.parts || [])
      .filter((p) => typeof p.text === "string" && !p.thought)
      .map((p) => p.text as string)
      .join("");
  };

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    // stream:true keeps a multi-byte character together when it is split across chunks.
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop() || "";
    for (const ev of events) {
      const text = parse(ev);
      if (text) yield text;
    }
  }
  buffer += decoder.decode();
  if (buffer.trim()) {
    const text = parse(buffer);
    if (text) yield text;
  }
  if (blocked) throw new Error("blocked");
  if (finish && finish !== "STOP" && finish !== "MAX_TOKENS") throw new Error("finish_" + finish);
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Request origin was rejected.", 403);

  const length = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(length) && length > 32_000) return fail("That message payload is too large.", 413);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return fail("The assistant is not connected yet. Add GEMINI_API_KEY in the server-side environment settings, then redeploy.", 503);
  }

  let body: { messages?: unknown };
  try {
    const raw = await request.text();
    if (raw.length > 32_000) return fail("That message payload is too large.", 413);
    body = JSON.parse(raw) as { messages?: unknown };
  } catch {
    return fail("Request body must be valid JSON.", 400);
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) return fail("Write a message first.", 400);

  const incoming = body.messages.slice(-7) as IncomingMessage[];
  for (const m of incoming) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") {
      return fail("Invalid message format.", 400);
    }
  }
  const last = incoming[incoming.length - 1];
  if (last.role !== "user" || !last.content.trim()) return fail("Write a message first.", 400);

  const question = last.content.trim().slice(0, MAX_QUESTION_CHARS);
  const history = incoming.slice(0, -1);
  const previousUser = [...history].reverse().find((m) => m.role === "user")?.content.slice(0, MAX_QUESTION_CHARS) || "";

  // Limits: 2 a minute without signing in, 5 a minute with an email.
  const session = readSession(request);
  const limit = session ? SIGNED_IN_PER_MINUTE : FREE_PER_MINUTE;
  const byIp = await take("ip:" + hashId(clientIp(request)), limit, 60);
  let usage = byIp;
  if (byIp.allowed && session) {
    const byEmail = await take("em:" + hashId(session.email), SIGNED_IN_PER_MINUTE, 60);
    if (!byEmail.allowed) usage = byEmail;
    else if (byEmail.remaining < byIp.remaining) usage = byEmail;
  }
  if (!usage.allowed) {
    return fail(
      "You have used your " + limit + " questions for this minute.",
      429,
      { code: "rate_limited", retryAfter: usage.retryAfter, limit, signedIn: Boolean(session), canSignIn: !session && signInAvailable }
    );
  }
  const daily = await take("global:day", DAILY_CAP, 86400);
  if (!daily.allowed) {
    return fail("The assistant has reached its daily limit. Please come back tomorrow.", 429, { code: "daily_cap", retryAfter: daily.retryAfter, limit });
  }

  // Read the docs: pick the pages closest to the question.
  const found = retrieve(question, previousUser);
  const system = buildSystemPrompt(found.docs);
  const contents = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content.trim().slice(0, 1500) }]
    })),
    { role: "user", parts: [{ text: question }] }
  ];

  const encoder = new TextEncoder();
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 50_000);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatEvent) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      try {
        send({
          type: "step",
          id: "understand",
          label: "Reading your question",
          detail: found.terms.length ? "Key terms: " + found.terms.join(", ") : "No specific terms, so I start from the overview",
          status: "done"
        });
        send({
          type: "step",
          id: "search",
          label: "Searching the site docs",
          detail: found.docs.length + " of " + buildDocs().length + " pages match: " + found.docs.map((d) => d.title).join(", "),
          status: "done"
        });
        for (const doc of found.docs) {
          send({ type: "step", id: "read:" + doc.id, label: "Reading " + doc.title, detail: doc.url, status: "done" });
        }
        send({ type: "sources", items: found.docs.map((d) => ({ title: d.title, url: d.url })), links: allowedLinks() });
        send({ type: "step", id: "write", label: "Writing the answer", status: "running" });

        const upstream = await openGeminiStream(
          apiKey,
          {
            systemInstruction: { parts: [{ text: system }] },
            contents,
            generationConfig: { temperature: 0.4, topP: 0.9, maxOutputTokens: 1500 }
          },
          abort.signal
        );

        let total = 0;
        for await (const text of readGemini(upstream.body as ReadableStream<Uint8Array>)) {
          total += text.length;
          if (total > 7000) break;
          send({ type: "token", text });
        }
        if (total === 0) throw new Error("empty");

        send({ type: "step", id: "write", label: "Writing the answer", status: "done" });
        send({ type: "done", usage: { limit, remaining: usage.remaining, signedIn: Boolean(session) } });
      } catch (error) {
        const code = error instanceof Error ? error.message : "";
        console.error("chat stream failed:", code);
        let message = "The assistant couldn't answer just now. Please try again in a moment.";
        if (code === "gemini_429") message = "The AI service is busy right now. Try again in a little while.";
        if (code === "blocked" || code.startsWith("finish_")) message = "I can't answer that one. Ask me about the projects instead.";
        if (code === "empty") message = "I didn't get an answer back. Try rephrasing your question.";
        send({ type: "error", message });
      } finally {
        clearTimeout(timer);
        controller.close();
      }
    },
    cancel() {
      abort.abort();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no"
    }
  });
}
