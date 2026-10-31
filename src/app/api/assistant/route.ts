import { NextResponse } from "next/server";
import { signInAvailable } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The public site asks this before it shows the assistant. It answers only when this service is
// running and the assistant has its key, so the button never appears for something that cannot reply.
export function GET() {
  const assistant = Boolean(process.env.GEMINI_API_KEY);
  return NextResponse.json(
    { up: true, assistant, signIn: signInAvailable },
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=60" } }
  );
}
