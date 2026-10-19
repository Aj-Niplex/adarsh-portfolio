import { NextResponse } from "next/server";
import { cleanEmail, fail, noStore, readObject, sameOrigin } from "@/lib/authApi";
import { take } from "@/lib/limiter";
import { TICKET_COOKIE, TICKET_MAX_AGE, clientIp, cookieOptions, emailLooksValid, hashCode, hashId, signInAvailable, signTicket } from "@/lib/session";
import { callStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Step 2: check the code. A right code earns a short-lived ticket that only allows choosing a password.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Request origin was rejected.", 403);
  if (!signInAvailable) return fail("Sign-in is not available right now.", 503);

  const body = await readObject(request);
  if (!body) return fail("Enter the 6-digit code.", 400);
  const email = cleanEmail(body.email);
  const code = typeof body.code === "string" ? body.code.replace(/\s+/g, "") : "";
  if (!emailLooksValid(email) || !/^\d{6}$/.test(code)) return fail("Enter the 6-digit code from the email.", 400);

  const attempts = await take("otp-check:" + hashId(clientIp(request)), 30, 3600);
  if (!attempts.allowed) return fail("Too many attempts. Try again later.", 429, { retryAfter: attempts.retryAfter }, { "Retry-After": String(attempts.retryAfter) });

  const result = await callStore<{ ok?: boolean; reason?: string | null; attemptsLeft?: number | null }>({
    action: "otp_check",
    email,
    hash: hashCode(email, code),
    maxAttempts: 5
  });
  if (!result) return fail("Sign-in is unavailable right now. Try again shortly.", 503);

  if (!result.ok) {
    switch (result.reason) {
      case "wrong":
        return fail("That code is not right. " + (result.attemptsLeft ?? 0) + " tries left.", 400, { reason: "wrong", attemptsLeft: result.attemptsLeft ?? 0 });
      case "locked":
        return fail("Too many wrong codes. Ask for a new one.", 400, { reason: "locked" });
      case "expired":
        return fail("That code has expired. Ask for a new one.", 400, { reason: "expired" });
      default:
        return fail("There is no active code for this email. Ask for a new one.", 400, { reason: "none" });
    }
  }

  const account = await callStore<{ exists?: boolean; passwordHash?: string | null }>({ action: "account_get", email });
  const response = NextResponse.json({ ok: true, hasPassword: Boolean(account?.exists && account.passwordHash) }, { headers: noStore });
  response.cookies.set(TICKET_COOKIE, signTicket(email, body.consent === true), cookieOptions(TICKET_MAX_AGE, "/api/auth"));
  return response;
}
