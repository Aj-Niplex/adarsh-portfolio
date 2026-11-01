import { NextResponse, type NextRequest } from "next/server";

// Calls to /api/* are forwarded to the API service (see next.config.ts). On the way, Vercel swaps the
// visitor's address and location for its own, so they are written into x-pf-* headers here, together
// with a key (EDGE_KEY) that only this site and the API service know. The API trusts those headers
// only when the key matches. Anything a visitor sends under the same names is removed first.

const KEY = process.env.EDGE_KEY || "";

const FORWARDING = Boolean(process.env.API_ORIGIN);

export function proxy(request: NextRequest) {
  // Without an API service to forward to, calls are answered here and nothing needs to be added.
  if (!FORWARDING) return NextResponse.next();
  const headers = new Headers(request.headers);
  for (const name of Array.from(headers.keys())) {
    if (name.startsWith("x-pf-")) headers.delete(name);
  }
  if (KEY) {
    const from = request.headers;
    const forwarded = (from.get("x-forwarded-for") || "").split(",")[0].trim();
    headers.set("x-pf-key", KEY);
    headers.set("x-pf-ip", forwarded || from.get("x-real-ip") || "");
    headers.set("x-pf-country", from.get("x-vercel-ip-country") || "");
    headers.set("x-pf-region", from.get("x-vercel-ip-country-region") || "");
    headers.set("x-pf-city", from.get("x-vercel-ip-city") || "");
  }
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: "/api/:path*" };
