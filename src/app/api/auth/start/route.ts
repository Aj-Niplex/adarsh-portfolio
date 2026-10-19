import { NextResponse } from "next/server";
import { cleanEmail, fail, noStore, readObject, sameOrigin } from "@/lib/authApi";
import { take } from "@/lib/limiter";
import { codeEmail, sendMail } from "@/lib/mailer";
import { CODE_MINUTES, clientIp, emailLooksValid, hashCode, hashId, newCode, signInAvailable } from "@/lib/session";
import { callStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Step 1: email the visitor a six-digit code. The answer is the same whether or not the address
// already has an account, so this cannot be used to find out who is registered.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Request origin was rejected.", 403);
  if (!signInAvailable) return fail("Sign-in is not available right now.", 503);

  const body = await readObject(request);
  if (!body) return fail("Enter your email address.", 400);
  const email = cleanEmail(body.email);
  if (!emailLooksValid(email)) return fail("Enter a valid email address.", 400);
  if (body.consent !== true) return fail("Tick the box to agree to product emails, then ask for a code.", 400);

  const byIp = await take("otp-ip:" + hashId(clientIp(request)), 10, 3600);
  const byEmail = await take("otp-mail:" + hashId(email), 5, 3600);
  if (!byIp.allowed || !byEmail.allowed) {
    const wait = Math.max(byIp.allowed ? 0 : byIp.retryAfter, byEmail.allowed ? 0 : byEmail.retryAfter);
    return fail("Too many codes requested. Try again in " + Math.ceil(wait / 60) + " min.", 429, { retryAfter: wait }, { "Retry-After": String(wait) });
  }

  const code = newCode();
  const issued = await callStore<{ ok?: boolean; retryAfter?: number; invalid?: boolean }>({
    action: "otp_issue",
    email,
    hash: hashCode(email, code),
    ttl: CODE_MINUTES * 60,
    cooldown: 45
  });
  if (!issued) return fail("Sign-in is unavailable right now. Try again shortly.", 503);
  if (issued.invalid) return fail("That email address was not accepted.", 400);
  if (!issued.ok) {
    const wait = Math.max(Number(issued.retryAfter) || 45, 1);
    return fail("A code was sent a moment ago. You can ask for another in " + wait + "s.", 429, { retryAfter: wait }, { "Retry-After": String(wait) });
  }

  const sent = await sendMail(codeEmail(email, code, CODE_MINUTES));
  if (!sent) return fail("The email could not be sent. Please try again in a minute.", 502);

  return NextResponse.json({ ok: true, retryAfter: 45, minutes: CODE_MINUTES }, { headers: noStore });
}
