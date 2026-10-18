// Visit counter. The number lives in the site store, so it keeps counting from
// where it left off after every redeploy.
import { callStore } from "./store";

let lastKnown: number | null = null;

export async function callViews(action: "get" | "hit"): Promise<number | null> {
  const data = await callStore<{ count?: unknown }>({ action });
  if (data && typeof data.count === "number" && Number.isFinite(data.count)) {
    lastKnown = data.count;
  }
  // If the store is unreachable, show the last number we saw, or nothing.
  return lastKnown;
}

const BOT = /bot|crawl|spider|slurp|headless|preview|lighthouse|monitor|curl|wget|python|node-fetch|axios|go-http/i;

export function looksLikeBot(userAgent: string | null) {
  if (!userAgent) return true;
  return BOT.test(userAgent);
}
