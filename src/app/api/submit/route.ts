import { NextResponse } from "next/server";
import { fail, noStore, readObject, sameOrigin } from "@/lib/authApi";
import { take } from "@/lib/limiter";
import { clientIp, hashId } from "@/lib/session";
import { callStore, storeConfigured } from "@/lib/store";
import { checkSubmission, toSubmission } from "@/lib/submissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The latest submissions. The Submit page reads them here, so the page itself holds no store access.
export async function GET() {
  const result = await callStore<{ items?: unknown[] }>({ action: "submissions", limit: 30 });
  if (!result || !Array.isArray(result.items)) return fail("The list could not be loaded right now.", 503);
  const items = result.items.map(toSubmission).filter((s) => s !== null);
  return NextResponse.json({ items }, { headers: noStore });
}

// A visitor sends an idea, a request or feedback. It appears on the Submit page straight away,
// so the text is checked here (no links, emails or phone numbers) and the sender is rate limited.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Request origin was rejected.", 403);

  const body = await readObject(request);
  if (!body) return fail("Fill in the form and try again.", 400);

  // A field real visitors never see. Bots fill it in, so they get a quiet "success" and nothing is saved.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true, item: null }, { headers: noStore });
  }

  const checked = checkSubmission(body);
  if (!checked.ok) return fail(checked.error, 400);
  if (!storeConfigured) return fail("Submissions are unavailable right now. Please try again later.", 503);

  const who = hashId(clientIp(request));
  const gates = [
    { key: "submit-burst:" + who, limit: 1, window: 30, text: "Wait a moment before sending another." },
    { key: "submit-hour:" + who, limit: 6, window: 3600, text: "That is enough for now. Try again in a while." },
    { key: "submit-day:" + who, limit: 20, window: 86400, text: "Daily limit reached. Try again tomorrow." }
  ];
  for (const gate of gates) {
    const turn = await take(gate.key, gate.limit, gate.window);
    if (!turn.allowed) return fail(gate.text, 429, { retryAfter: turn.retryAfter }, { "Retry-After": String(turn.retryAfter) });
  }

  const saved = await callStore<{ ok?: boolean; id?: number | null; reason?: string | null }>({ action: "submit", ...checked.value });
  if (!saved) return fail("Submissions are unavailable right now. Please try again later.", 503);
  if (!saved.ok) {
    if (saved.reason === "duplicate") return fail("You already sent exactly that.", 409);
    if (saved.reason === "busy") return fail("Too many submissions today. Please try again tomorrow.", 503);
    return fail("That was not accepted. Check the fields and try again.", 400);
  }

  const item = { id: saved.id ?? 0, ...checked.value, createdAt: new Date().toISOString() };
  return NextResponse.json({ ok: true, item }, { headers: noStore });
}
