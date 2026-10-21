import { NextResponse } from "next/server";
import { cleanEmail, fail, noStore, readObject, sameOrigin } from "@/lib/authApi";
import { CONSENT_TEXT } from "@/lib/consent";
import { take } from "@/lib/limiter";
import { sendCodeFor } from "@/lib/otp";
import { clientIp, emailLooksValid, hashId, signInAvailable } from "@/lib/session";
import { callStore, storeConfigured } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Newsletter sign-up. The address is saved together with the wording the visitor agreed to.
// When emailing is available a six-digit code follows so the address is confirmed;
// until then it stays unconfirmed and nothing is ever sent to it.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Request origin was rejected.", 403);

  const body = await readObject(request);
  if (!body) return fail("Enter your email address.", 400);

  // A field real visitors never see. Bots fill it in, so they get a quiet "success" and nothing is saved.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true, stage: "saved" }, { headers: noStore });
  }

  const email = cleanEmail(body.email);
  if (!emailLooksValid(email)) return fail("Enter a valid email address.", 400);
  if (body.consent !== true) return fail("Tick the box to agree to the emails first.", 400);
  if (!storeConfigured) return fail("The newsletter is unavailable right now. Please try again later.", 503);

  const byIp = await take("news-ip:" + hashId(clientIp(request)), 8, 3600);
  const byEmail = await take("news-mail:" + hashId(email), 4, 86400);
  if (!byIp.allowed || !byEmail.allowed) {
    const wait = Math.max(byIp.allowed ? 0 : byIp.retryAfter, byEmail.allowed ? 0 : byEmail.retryAfter);
    return fail("Too many attempts. Try again in " + Math.max(Math.ceil(wait / 60), 1) + " min.", 429, { retryAfter: wait }, { "Retry-After": String(wait) });
  }

  const saved = await callStore<{ ok?: boolean }>({ action: "signup", email, consent: true, consentText: CONSENT_TEXT });
  if (!saved) return fail("The newsletter is unavailable right now. Please try again later.", 503);
  if (!saved.ok) return fail("That email address was not accepted.", 400);

  if (!signInAvailable) return NextResponse.json({ ok: true, stage: "saved" }, { headers: noStore });

  const sent = await sendCodeFor(request, email);
  if (sent.ok) return NextResponse.json({ ok: true, stage: "code", retryAfter: sent.retryAfter, minutes: sent.minutes }, { headers: noStore });
  // A code that is already on its way still lets the visitor finish; any other failure leaves the address saved.
  if (sent.status === 429 && sent.retryAfter && /sent a moment ago/i.test(sent.error)) {
    return NextResponse.json({ ok: true, stage: "code", retryAfter: sent.retryAfter }, { headers: noStore });
  }
  return NextResponse.json({ ok: true, stage: "saved", note: "The confirmation email could not be sent just now." }, { headers: noStore });
}
