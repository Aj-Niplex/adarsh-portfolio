import { NextResponse } from "next/server";
import { cleanEmail, fail, noStore, readObject, sameOrigin } from "@/lib/authApi";
import { take } from "@/lib/limiter";
import { clientIp, emailLooksValid, hashId } from "@/lib/session";
import { callStore, storeConfigured } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Takes an address off the product updates and promotions list. It only touches that list, never an account,
// so typing someone else's address can do no more than stop emails to it. The answer is the same whether or
// not the address was on the list, so the page cannot be used to find out who is subscribed.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Request origin was rejected.", 403);

  const body = await readObject(request);
  if (!body) return fail("Enter your email address.", 400);

  // A field real visitors never see. Bots fill it in, so they get a quiet "success" and nothing happens.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true }, { headers: noStore });
  }

  const email = cleanEmail(body.email);
  if (!emailLooksValid(email)) return fail("Enter a valid email address.", 400);
  if (!storeConfigured) return fail("This is unavailable right now. Please try again later.", 503);

  const byIp = await take("unsub-ip:" + hashId(clientIp(request)), 10, 3600);
  const byEmail = await take("unsub-mail:" + hashId(email), 5, 86400);
  if (!byIp.allowed || !byEmail.allowed) {
    const wait = Math.max(byIp.allowed ? 0 : byIp.retryAfter, byEmail.allowed ? 0 : byEmail.retryAfter);
    return fail("Too many attempts. Try again in " + Math.max(Math.ceil(wait / 60), 1) + " min.", 429, { retryAfter: wait }, { "Retry-After": String(wait) });
  }

  const result = await callStore<{ removed?: boolean }>({ action: "forget", email });
  if (!result) return fail("This is unavailable right now. Please try again later.", 503);
  return NextResponse.json({ ok: true }, { headers: noStore });
}
