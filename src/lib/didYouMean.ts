// Suggests the page a visitor probably meant when they edited the address (/abt instead of /about).

function distance(a: string, b: string) {
  if (a === b) return 0;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(previous[j] + 1, row[j - 1] + 1, previous[j - 1] + cost);
    }
    previous = row;
  }
  return previous[b.length];
}

function clean(path: string) {
  const bare = (path.split(/[?#]/)[0] || "/").toLowerCase().replace(/\/+$/, "");
  return bare || "/";
}

/** The closest real page for a mistyped address, or null when nothing is close enough to be a fair guess. */
export function didYouMean(path: string, routes: readonly string[]): string | null {
  const wanted = clean(path);
  if (wanted === "/") return null;
  let best: string | null = null;
  let bestDistance = Infinity;
  for (const route of routes) {
    if (route === "/") continue;
    const d = distance(wanted, route.toLowerCase());
    if (d < bestDistance) {
      best = route;
      bestDistance = d;
    }
  }
  if (!best) return null;
  // Allow about one typo per three characters, never more than three.
  const allowed = Math.min(3, Math.max(2, Math.floor(best.length / 3)));
  return bestDistance <= allowed ? best : null;
}
