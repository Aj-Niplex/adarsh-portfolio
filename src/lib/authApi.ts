// Small helpers shared by the sign-in routes.
import { NextResponse } from "next/server";
import { FREE_PER_MINUTE, SIGNED_IN_PER_MINUTE } from "./consent";
import { SESSION_COOKIE, SESSION_MAX_AGE, cookieOptions, maskEmail, signInAvailable, signSession } from "./session";
import type { SessionInfo } from "./chatTypes";

export const noStore = { "Cache-Control": "no-store" };

export function sessionInfo(email?: string): SessionInfo {
  return {
    available: signInAvailable,
    signedIn: Boolean(email),
    email: email ? maskEmail(email) : undefined,
    limit: email ? SIGNED_IN_PER_MINUTE : FREE_PER_MINUTE
  };
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function fail(message: string, status: number, extra: Record<string, unknown> = {}, headers: Record<string, string> = {}) {
  return NextResponse.json({ error: message, ...extra }, { status, headers: { ...noStore, ...headers } });
}

/** Reads a JSON object from the request body; anything else gives null. */
export async function readObject(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const parsed = (await request.json()) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function cleanEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

/** A signed-in response: sets the session cookie and returns what the page needs to show. */
export function signedIn(email: string, extra: Record<string, unknown> = {}) {
  const response = NextResponse.json({ ...sessionInfo(email), ...extra }, { headers: noStore });
  response.cookies.set(SESSION_COOKIE, signSession(email), cookieOptions(SESSION_MAX_AGE));
  return response;
}
