import { NextResponse } from "next/server";
import { callViews, looksLikeBot } from "@/lib/views";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 60_000;
const MAX_HITS_PER_WINDOW = 5;
const hits = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return (forwarded ? forwarded.split(",")[0].trim() : "unknown").slice(0, 80);
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

const noStore = { "Cache-Control": "no-store" };

export async function GET() {
  const count = await callViews("get");
  return NextResponse.json({ count }, { headers: noStore });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ count: null }, { status: 403, headers: noStore });
  }

  // Bots and rapid repeats are read-only: they see the number but do not add to it.
  const now = Date.now();
  const key = clientKey(request);
  const entry = hits.get(key);
  let allowed = !looksLikeBot(request.headers.get("user-agent"));
  if (allowed) {
    if (!entry || entry.resetAt < now) {
      hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    } else if (entry.count >= MAX_HITS_PER_WINDOW) {
      allowed = false;
    } else {
      entry.count += 1;
    }
  }
  if (hits.size > 500) {
    for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k);
  }

  const count = await callViews(allowed ? "hit" : "get");
  return NextResponse.json({ count }, { headers: noStore });
}
