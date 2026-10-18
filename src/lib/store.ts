// Server-side client for the site store: the visit counter, chat limits and
// email sign-ups live in a database outside this site, behind one function.

const ENDPOINT = process.env.VIEWS_ENDPOINT;
const SECRET = process.env.VIEWS_SECRET;

export const storeConfigured = Boolean(ENDPOINT && SECRET);

export async function callStore<T>(body: Record<string, unknown>, timeoutMs = 4000): Promise<T | null> {
  if (!ENDPOINT || !SECRET) return null;
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", "x-views-secret": SECRET },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs)
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
