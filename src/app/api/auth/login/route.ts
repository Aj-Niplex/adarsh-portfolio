import { cleanEmail, fail, readObject, sameOrigin, signedIn } from "@/lib/authApi";
import { take } from "@/lib/limiter";
import { verifyPassword } from "@/lib/password";
import { clientIp, emailLooksValid, hashId, signInAvailable } from "@/lib/session";
import { callStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WRONG = "That email and password do not match.";

// For visitors who already made a password: email + password, no code needed.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Request origin was rejected.", 403);
  if (!signInAvailable) return fail("Sign-in is not available right now.", 503);

  const body = await readObject(request);
  const email = cleanEmail(body?.email);
  const password = body && typeof body.password === "string" ? body.password : "";
  if (!emailLooksValid(email) || !password || password.length > 128) return fail(WRONG, 400);

  const byIp = await take("login-ip:" + hashId(clientIp(request)), 30, 3600);
  const byEmail = await take("login-mail:" + hashId(email), 8, 900);
  if (!byIp.allowed || !byEmail.allowed) {
    const wait = Math.max(byIp.allowed ? 0 : byIp.retryAfter, byEmail.allowed ? 0 : byEmail.retryAfter);
    return fail("Too many sign-in attempts. Try again in " + Math.ceil(wait / 60) + " min.", 429, { retryAfter: wait }, { "Retry-After": String(wait) });
  }

  const account = await callStore<{ exists?: boolean; passwordHash?: string | null }>({ action: "account_get", email });
  if (!account) return fail("Sign-in is unavailable right now. Try again shortly.", 503);

  const ok = await verifyPassword(password, account.exists ? account.passwordHash ?? null : null);
  if (!ok) return fail(WRONG, 401);

  void callStore({ action: "account_touch", email });
  return signedIn(email);
}
