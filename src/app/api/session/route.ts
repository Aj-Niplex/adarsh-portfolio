import { NextResponse } from "next/server";
import { FREE_PER_MINUTE, SIGNED_IN_PER_MINUTE, CONSENT_TEXT } from "@/lib/consent";
import { take } from "@/lib/limiter";
import { callStore } from "@/lib/store";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  clientIp,
  emailLooksValid,
  hashId,
  maskEmail,
  readSession,
  signInAvailable,
  signSession
} from "@/lib/session";
import type { SessionInfo } from "@/lib/chatTypes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

function info(email?: string): SessionInfo {
  return {
    available: signInAvailable,
    signedIn: Boolean(email),
    email: email ? maskEmail(email) : undefined,
    limit: email ? SIGNED_IN_PER_MINUTE : FREE_PER_MINUTE
  };
}

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

export async function GET(request: Request) {
  const session = readSession(request);
  return NextResponse.json(info(session?.email), { headers: noStore });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request origin was rejected." }, { status: 403 });
  if (!signInAvailable) return NextResponse.json({ error: "Sign-in is not available right now." }, { status: 503 });

  let body: { email?: unknown; consent?: unknown };
  try {
    const parsed = (await request.json()) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    body = parsed as { email?: unknown; consent?: unknown };
  } catch {
    return NextResponse.json({ error: "Send an email address." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!emailLooksValid(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (body.consent !== true) {
    return NextResponse.json({ error: "Tick the box to agree to product emails, then sign in." }, { status: 400 });
  }

  const attempts = await take("signin:" + hashId(clientIp(request)), 8, 3600);
  if (!attempts.allowed) {
    return NextResponse.json({ error: "Too many sign-in attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(attempts.retryAfter) } });
  }

  const saved = await callStore<{ ok?: boolean }>({ action: "signup", email, consent: true, consentText: CONSENT_TEXT });
  if (!saved) return NextResponse.json({ error: "Sign-in is unavailable right now. Try again shortly." }, { status: 503 });
  if (!saved.ok) return NextResponse.json({ error: "That email address was not accepted." }, { status: 400 });

  const response = NextResponse.json(info(email), { headers: noStore });
  response.cookies.set(SESSION_COOKIE, signSession(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE
  });
  return response;
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request origin was rejected." }, { status: 403 });
  const session = readSession(request);
  const forget = new URL(request.url).searchParams.get("forget") === "1";
  let removed = false;
  if (session && forget) {
    const result = await callStore<{ removed?: boolean }>({ action: "forget", email: session.email });
    removed = Boolean(result?.removed);
  }
  const response = NextResponse.json({ ...info(undefined), removed }, { headers: noStore });
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
