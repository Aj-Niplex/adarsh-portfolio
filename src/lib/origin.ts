// Which sites may call the API routes from a browser.
//
// The public site forwards /api/* to a second service without changing the address bar, so the
// service sees the public site as the caller's Origin and its own address as the Host. A request
// is accepted when the Origin matches the Host (same address) or is listed in SITE_HOSTS.
// An entry may contain * to stand for one name part (letters, digits and dashes), so the public
// site's preview deployments can be allowed with one line, for example
// "my-site-*-my-team.vercel.app".

import { SITE } from "./site";

function hostOf(value: string) {
  try {
    return new URL(value.includes("://") ? value : "https://" + value).host.toLowerCase();
  } catch {
    return "";
  }
}

const entries = [SITE.url, ...(process.env.SITE_HOSTS || "").split(",")]
  .map((v) => v.trim().toLowerCase())
  .filter(Boolean)
  .map((v) => (v.includes("*") ? v.replace(/^https?:\/\//, "").replace(/\/.*$/, "") : hostOf(v)))
  .filter(Boolean);

const exact = new Set(entries.filter((e) => !e.includes("*")));
const patterns = entries
  .filter((e) => e.includes("*"))
  .map((e) => new RegExp("^" + e.split("*").map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join("[a-z0-9-]+") + "$"));

const listed = { has: (host: string) => exact.has(host) || patterns.some((re) => re.test(host)) };

/** True when a browser request comes from this service's own address or from a listed site. */
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  let host = "";
  try {
    host = new URL(origin).host.toLowerCase();
  } catch {
    return false;
  }
  if (host === (request.headers.get("host") || "").toLowerCase()) return true;
  return listed.has(host);
}
