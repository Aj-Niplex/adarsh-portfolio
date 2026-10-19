import crypto from "node:crypto";
import { mailConfigured } from "./mailer";
import { storeConfigured } from "./store";

const SECRET = process.env.CHAT_SIGNING_SECRET || "";

export const SESSION_COOKIE = "pf_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
// Sign-in needs all three: a signing secret, the store, and a way to email the code.
export const signInAvailable = Boolean(SECRET) && storeConfigured && mailConfigured;

function hmac(value: string) {
  return crypto.createHmac("sha256", SECRET || process.env.VIEWS_SECRET || "local-dev").update(value).digest();
}

/** Stable, non-reversible id for a visitor key (an IP address or an email). */
export function hashId(value: string) {
  return hmac("id:" + value).toString("hex").slice(0, 32);
}

export function emailLooksValid(email: string) {
  return email.length >= 5 && email.length <= 254 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return "signed in";
  return name.slice(0, 1) + "***@" + domain;
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded ? forwarded.split(",")[0].trim() : request.headers.get("x-real-ip") || "";
  return first.slice(0, 80) || "unknown";
}

function sign(kind: string, data: Record<string, unknown>, maxAgeSeconds: number) {
  const payload = Buffer.from(JSON.stringify({ ...data, x: Math.floor(Date.now() / 1000) + maxAgeSeconds })).toString("base64url");
  return payload + "." + hmac(kind + ":" + payload).toString("base64url");
}

function cookieValue(request: Request, name: string) {
  const header = request.headers.get("cookie") || "";
  const match = header.split(/;\s*/).find((part) => part.startsWith(name + "="));
  if (!match) return null;
  try {
    return decodeURIComponent(match.slice(name.length + 1));
  } catch {
    return null;
  }
}

function unsign(kind: string, token: string | null): Record<string, unknown> | null {
  if (!SECRET || !token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = hmac(kind + ":" + payload);
  let given: Buffer;
  try {
    given = Buffer.from(sig, "base64url");
  } catch {
    return null;
  }
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<string, unknown>;
    if (!data || typeof data !== "object" || typeof data.x !== "number" || data.x < Date.now() / 1000) return null;
    return data;
  } catch {
    return null;
  }
}

export function signSession(email: string) {
  return sign("session", { e: email }, SESSION_MAX_AGE);
}

export function readSession(request: Request): { email: string } | null {
  const data = unsign("session", cookieValue(request, SESSION_COOKIE));
  return data && typeof data.e === "string" ? { email: data.e } : null;
}

// Proof that this browser just entered the right emailed code. It only lets the visitor choose a password.
export const TICKET_COOKIE = "pf_verified";
export const TICKET_MAX_AGE = 60 * 15;

export function signTicket(email: string, consent: boolean) {
  return sign("ticket", { e: email, c: consent ? 1 : 0 }, TICKET_MAX_AGE);
}

export function readTicket(request: Request): { email: string; consent: boolean } | null {
  const data = unsign("ticket", cookieValue(request, TICKET_COOKIE));
  return data && typeof data.e === "string" ? { email: data.e, consent: data.c === 1 } : null;
}

export const CODE_MINUTES = 10;

export function newCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

/** Keyed hash of a code. The database only ever sees this, never the code. */
export function hashCode(email: string, code: string) {
  return hmac("otp:" + email + ":" + code).toString("hex");
}

export function cookieOptions(maxAge: number, path = "/") {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path,
    maxAge
  };
}
