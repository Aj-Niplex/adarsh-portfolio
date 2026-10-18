import { NextResponse } from "next/server";
import { MAX_QUESTION_CHARS, buildSystemPrompt } from "@/lib/chatPrompt";
import type { ChatEvent } from "@/lib/chatTypes";
import { FREE_PER_MINUTE, SIGNED_IN_PER_MINUTE } from "@/lib/consent";
import { allowedLinks, buildDocs, mentionsProject, retrieve } from "@/lib/docs";
import { classify } from "@/lib/intent";
import { take, takeMemory } from "@/lib/limiter";
import { clientIp, hashId, readSession, signInAvailable } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BASE = (process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com").replace(/\/$/, "");
const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
// If the first model is rate-limited, retired or down, the next one answers instead.
const MODELS = Array.from(new Set([PRIMARY_MODEL, "gemini-3.8-flash", "gemini-2.5-flash"]));
const DAILY_CAP = Number(process.env.CHAT_DAILY_CAP || 400);

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

// A model that has not produced any text after this long is skipped for the next one.
const FIRST_TEXT_MS = 14_000;

function generationConfig(model: string) {
  const config: Record<string, unknown> = { temperature: 0.4, topP: 0.9, maxOutputTokens: 1500 };
  // The 2.5 models think before they answer by default, which only adds waiting time here.
  if (model.startsWith("gemini-2.5")) config.thinkingConfig = { thinkingBudget: 0 };
  return config;
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

/**
 * Streams the answer from the first model that responds. A model that errors, is retired or stays
 * silent for FIRST_TEXT_MS is skipped. Once text has started it is never switched mid-answer.
 */
async function* answerStream(
  apiKey: string,
  system: string,
  contents: unknown,
  parent: AbortSignal,
  onSwitch: (next: string) => void
): AsyncGenerator<string> {
  let lastError = "empty";
  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[i];
    const attempt = new AbortController();
    const forward = () => attempt.abort();
    parent.addEventListener("abort", forward, { once: true });
    let slow = false;
    const watchdog = setTimeout(() => {
      slow = true;
      attempt.abort();
    }, FIRST_TEXT_MS);
    let started = false;
    try {
      const response = await fetch(BASE + "/v1beta/models/" + model + ":streamGenerateContent?alt=sse", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents,
          generationConfig: generationConfig(model)
        }),
        cache: "no-store",
        signal: attempt.signal
      });
      if (!response.ok || !response.body) {
        lastError = "gemini_" + response.status;
        await response.body?.cancel().catch(() => {});
      } else {
        for await (const text of readGemini(response.body)) {
          if (!started) {
            started = true;
            clearTimeout(watchdog);
          }
          yield text;
        }
        if (started) return;
        lastError = "empty";
      }
    } catch (error) {
      if (started) throw error;
      if (parent.aborted) throw new Error("slow");
      const code = error instanceof Error ? error.message : "error";
      if (code === "blocked" || code.startsWith("finish_")) throw error;
      lastError = slow ? "slow" : code;
    } finally {
      clearTimeout(watchdog);
      parent.removeEventListener("abort", forward);
    }
    if (i < MODELS.length - 1) onSwitch(MODELS[i + 1]);
  }
  throw new Error(lastError);
}

/** Sends a fixed reply in a few pieces so it types out like any other answer. */
function instantReply(text: string, limit: number, signedIn: boolean) {
  const words = text.split(" ");
  const pieces: string[] = [];
  for (let i = 0; i < words.length; i += 6) pieces.push(words.slice(i, i + 6).join(" ") + (i + 6 < words.length ? " " : ""));
  const events: ChatEvent[] = [
    ...pieces.map((piece): ChatEvent => ({ type: "token", text: piece })),
    { type: "done", usage: { limit, remaining: null, signedIn } }
  ];
  return new Response(events.map((e) => JSON.stringify(e) + "\n").join(""), {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform"
    }
  });
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
  if (!body || typeof body !== "object" || !Array.isArray(body.messages) || body.messages.length === 0) {
    return fail("Write a message first.", 400);
  }

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

  const session = readSession(request);
  const limit = session ? SIGNED_IN_PER_MINUTE : FREE_PER_MINUTE;

  // A greeting or a request that has nothing to do with the projects needs no docs and no model.
  // It is answered at once, uses none of the visitor's questions, and has its own loose guard.
  const intent = classify(question, mentionsProject(question));
  if (intent.kind !== "question") {
    const quick = takeMemory("quick:" + hashId(clientIp(request)), 20, 60);
    if (!quick.allowed) {
      return fail("Slow down a little.", 429, { code: "rate_limited", retryAfter: quick.retryAfter, limit, signedIn: Boolean(session), canSignIn: false });
    }
    return instantReply(intent.reply, limit, Boolean(session));
  }

  // Limits: 2 a minute without signing in, 5 a minute with an email.
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
      const send = (event: ChatEvent) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        } catch {
          /* the visitor closed the chat; nothing left to write to */
        }
      };
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

        let total = 0;
        const reply = answerStream(apiKey, system, contents, abort.signal, () =>
          send({ type: "step", id: "write", label: "Writing the answer", detail: "The first AI model is slow, switching to a backup", status: "running" })
        );
        for await (const text of reply) {
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
        if (code === "slow") message = "The AI service is slow right now. Please try again in a moment.";
        if (code === "blocked" || code.startsWith("finish_")) message = "I can't answer that one. Ask me about the projects instead.";
        if (code === "empty") message = "I didn't get an answer back. Try rephrasing your question.";
        send({ type: "error", message });
      } finally {
        clearTimeout(timer);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
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
