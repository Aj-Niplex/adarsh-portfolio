// Emails a six-digit code. Shared by the account sign-up and the newsletter, so both prove the inbox the same way.
import { take } from "./limiter";
import { codeEmail, sendMail } from "./mailer";
import { CODE_MINUTES, clientIp, hashCode, hashId, newCode } from "./session";
import { callStore } from "./store";

export type CodeResult =
  | { ok: true; retryAfter: number; minutes: number }
  | { ok: false; status: number; error: string; retryAfter?: number };

export async function sendCodeFor(request: Request, email: string): Promise<CodeResult> {
  const byIp = await take("otp-ip:" + hashId(clientIp(request)), 10, 3600);
  const byEmail = await take("otp-mail:" + hashId(email), 5, 3600);
  if (!byIp.allowed || !byEmail.allowed) {
    const wait = Math.max(byIp.allowed ? 0 : byIp.retryAfter, byEmail.allowed ? 0 : byEmail.retryAfter);
    return { ok: false, status: 429, error: "Too many codes requested. Try again in " + Math.ceil(wait / 60) + " min.", retryAfter: wait };
  }

  const code = newCode();
  const issued = await callStore<{ ok?: boolean; retryAfter?: number; invalid?: boolean }>({
    action: "otp_issue",
    email,
    hash: hashCode(email, code),
    ttl: CODE_MINUTES * 60,
    cooldown: 45
  });
  if (!issued) return { ok: false, status: 503, error: "Sign-in is unavailable right now. Try again shortly." };
  if (issued.invalid) return { ok: false, status: 400, error: "That email address was not accepted." };
  if (!issued.ok) {
    const wait = Math.max(Number(issued.retryAfter) || 45, 1);
    return { ok: false, status: 429, error: "A code was sent a moment ago. You can ask for another in " + wait + "s.", retryAfter: wait };
  }

  const sent = await sendMail(codeEmail(email, code, CODE_MINUTES));
  if (!sent) return { ok: false, status: 502, error: "The email could not be sent. Please try again in a minute." };
  return { ok: true, retryAfter: 45, minutes: CODE_MINUTES };
}
