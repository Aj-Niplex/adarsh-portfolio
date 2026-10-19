import { CONSENT_TEXT } from "@/lib/consent";
import { fail, readObject, sameOrigin, signedIn } from "@/lib/authApi";
import { take } from "@/lib/limiter";
import { hashPassword, passwordProblem } from "@/lib/password";
import { TICKET_COOKIE, clientIp, hashId, readTicket, signInAvailable } from "@/lib/session";
import { callStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Step 3: with a verified email, choose a password. This creates the account (or replaces a forgotten password).
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Request origin was rejected.", 403);
  if (!signInAvailable) return fail("Sign-in is not available right now.", 503);

  const ticket = readTicket(request);
  if (!ticket) return fail("Your email check timed out. Start again to get a new code.", 401, { reason: "ticket" });

  const body = await readObject(request);
  const password = body && typeof body.password === "string" ? body.password : "";
  const problem = passwordProblem(password, ticket.email);
  if (problem) return fail(problem, 400);

  const attempts = await take("pw-set:" + hashId(clientIp(request)), 20, 3600);
  if (!attempts.allowed) return fail("Too many attempts. Try again later.", 429, { retryAfter: attempts.retryAfter }, { "Retry-After": String(attempts.retryAfter) });

  const saved = await callStore<{ ok?: boolean }>({
    action: "account_save",
    email: ticket.email,
    passwordHash: await hashPassword(password),
    consent: ticket.consent,
    consentText: ticket.consent ? CONSENT_TEXT : undefined
  });
  if (!saved) return fail("Sign-in is unavailable right now. Try again shortly.", 503);
  if (!saved.ok) return fail("That email address was not accepted.", 400);

  const response = signedIn(ticket.email, { created: true });
  response.cookies.set(TICKET_COOKIE, "", { httpOnly: true, path: "/api/auth", maxAge: 0 });
  return response;
}
