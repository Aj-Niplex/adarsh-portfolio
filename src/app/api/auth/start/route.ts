import { NextResponse } from "next/server";
import { cleanEmail, fail, noStore, readObject, sameOrigin } from "@/lib/authApi";
import { sendCodeFor } from "@/lib/otp";
import { emailLooksValid, signInAvailable } from "@/lib/session";

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

  const sent = await sendCodeFor(request, email);
  if (!sent.ok) {
    const headers: Record<string, string> = sent.retryAfter ? { "Retry-After": String(sent.retryAfter) } : {};
    return fail(sent.error, sent.status, sent.retryAfter ? { retryAfter: sent.retryAfter } : {}, headers);
  }
  return NextResponse.json({ ok: true, retryAfter: sent.retryAfter, minutes: sent.minutes }, { headers: noStore });
}
