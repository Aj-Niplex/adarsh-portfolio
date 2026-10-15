import { NextResponse } from "next/server";
import { publicPortfolioContext } from "@/lib/projects";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
const requestCounts = new Map<string, { count: number; resetAt: number }>();

type IncomingMessage = { role: "user" | "assistant"; content: string };

function getClientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return ip.slice(0, 80);
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function rateLimited(key: string) {
  const now = Date.now();
  const prior = requestCounts.get(key);
  if (!prior || prior.resetAt <= now) {
    requestCounts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  prior.count += 1;
  return prior.count > MAX_REQUESTS_PER_WINDOW;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Request origin was rejected." }, { status: 403 });
  }

  const clientKey = getClientKey(request);
  if (rateLimited(clientKey)) {
    return NextResponse.json({ error: "Too many messages too quickly. Wait a minute and try again." }, { status: 429 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "The AI assistant is not connected yet. Add GEMINI_API_KEY in Vercel's server-side environment settings, then redeploy." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json() as { messages?: unknown };
    if (!Array.isArray(body.messages)) {
      return NextResponse.json({ error: "Send a messages array." }, { status: 400 });
    }

    const incoming = body.messages.slice(-12) as IncomingMessage[];
    if (incoming.length === 0) {
      return NextResponse.json({ error: "Write a message first." }, { status: 400 });
    }

    let totalChars = 0;
    const messages = incoming.map((item) => {
      if (!item || (item.role !== "user" && item.role !== "assistant") || typeof item.content !== "string") {
        throw new Error("Invalid message format.");
      }
      const content = item.content.trim().slice(0, 3000);
      totalChars += content.length;
      return { role: item.role === "assistant" ? "model" : "user", parts: [{ text: content }] };
    });

    if (totalChars > 12_000) {
      return NextResponse.json({ error: "That conversation is too long. Start a fresh chat and try again." }, { status: 413 });
    }

    const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: "You are the public portfolio assistant for Adarsh Jaiswal (NiPlex). Answer visitors about the published portfolio using the context below. Keep answers useful, friendly, and concise. Be honest when a capability is still in development. Never invent project metrics, releases, or links. Do not disclose or speculate about private repositories, personal vaults, source code, credentials, user data, or internal implementation details. Tell visitors not to share secrets or sensitive data.\\n\\nPublic context: " + publicPortfolioContext
          }]
        },
        contents: messages,
        generationConfig: { temperature: 0.65, maxOutputTokens: 700 }
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      console.error("Gemini request failed with status", response.status);
      if (response.status === 429) {
        return NextResponse.json({ error: "Gemini's current rate limit was reached. Try again in a little while." }, { status: 429 });
      }
      return NextResponse.json({ error: "Gemini couldn't answer just now. Please try again shortly." }, { status: 502 });
    }

    const data = await response.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const reply = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
    if (!reply) {
      return NextResponse.json({ error: "Gemini returned an empty response. Try rephrasing that." }, { status: 502 });
    }

    return NextResponse.json({ reply: reply.slice(0, 5000) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request.";
    return NextResponse.json(
      { error: message === "Invalid message format." ? message : "The chat request couldn't be processed." },
      { status: message === "Invalid message format." ? 400 : 500 }
    );
  }
}
