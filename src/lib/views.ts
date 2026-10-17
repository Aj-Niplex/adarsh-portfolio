// Visit counter. The number lives in a database outside this site, so it
// keeps counting from where it left off after every redeploy.

const ENDPOINT = process.env.VIEWS_ENDPOINT;
const SECRET = process.env.VIEWS_SECRET;

let lastKnown: number | null = null;

export const viewsConfigured = Boolean(ENDPOINT && SECRET);

export async function callViews(action: "get" | "hit"): Promise<number | null> {
  if (!ENDPOINT || !SECRET) return null;
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", "x-views-secret": SECRET },
      body: JSON.stringify({ action }),
      cache: "no-store",
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) return lastKnown;
    const data = (await res.json()) as { count?: unknown };
    if (typeof data.count === "number" && Number.isFinite(data.count)) {
      lastKnown = data.count;
      return lastKnown;
    }
    return lastKnown;
  } catch {
    // If the store is unreachable, show the last number we saw or nothing.
    return lastKnown;
  }
}

const BOT = /bot|crawl|spider|slurp|headless|preview|lighthouse|monitor|curl|wget|python|node-fetch|axios|go-http/i;

export function looksLikeBot(userAgent: string | null) {
  if (!userAgent) return true;
  return BOT.test(userAgent);
}
