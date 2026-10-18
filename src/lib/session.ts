import crypto from "node:crypto";
import { storeConfigured } from "./store";

const SECRET = process.env.CHAT_SIGNING_SECRET || "";

export const SESSION_COOKIE = "pf_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
export const signInAvailable = Boolean(SECRET) && storeConfigured;

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

export function signSession(email: string) {
  const payload = Buffer.from(JSON.stringify({ e: email, x: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE })).toString("base64url");
  const sig = hmac("session:" + payload).toString("base64url");
  return payload + "." + sig;
}

export function readSession(request: Request): { email: string } | null {
  if (!SECRET) return null;
  const header = request.headers.get("cookie") || "";
  const match = header.split(/;\s*/).find((part) => part.startsWith(SESSION_COOKIE + "="));
  if (!match) return null;
  const token = decodeURIComponent(match.slice(SESSION_COOKIE.length + 1));
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = hmac("session:" + payload);
  let given: Buffer;
  try {
    given = Buffer.from(sig, "base64url");
  } catch {
    return null;
  }
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { e?: unknown; x?: unknown };
    if (typeof data.e !== "string" || typeof data.x !== "number" || data.x < Date.now() / 1000) return null;
    return { email: data.e };
  } catch {
    return null;
  }
}
