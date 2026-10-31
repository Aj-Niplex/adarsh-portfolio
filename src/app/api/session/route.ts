import { NextResponse } from "next/server";
import { noStore, sameOrigin, sessionInfo } from "@/lib/authApi";
import { SESSION_COOKIE, readSession } from "@/lib/session";
import { callStore } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Who is signed in right now. Signing in itself happens in /api/auth/*.
export async function GET(request: Request) {
  const session = readSession(request);
  return NextResponse.json(sessionInfo(session?.email), { headers: noStore });
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request origin was rejected." }, { status: 403 });
  const session = readSession(request);
  const forget = new URL(request.url).searchParams.get("forget") === "1";
  let removed = false;
  if (session && forget) {
    // Removes the account, its codes and the mailing-list entry. Before the store knows the newer
    // action, only the mailing-list entry is removed.
    const result =
      (await callStore<{ removed?: boolean }>({ action: "forget_account", email: session.email })) ??
      (await callStore<{ removed?: boolean }>({ action: "forget", email: session.email }));
    removed = Boolean(result?.removed);
  }
  const response = NextResponse.json({ ...sessionInfo(undefined), removed }, { headers: noStore });
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
