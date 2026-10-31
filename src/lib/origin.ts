// Which sites may call the API routes from a browser.
//
// The public site forwards /api/* to a second service without changing the address bar, so the
// service sees the public site as the caller's Origin and its own address as the Host. A request
// is accepted when the Origin matches the Host (same address) or is listed in SITE_HOSTS.

import { SITE } from "./site";

function hostOf(value: string) {
  try {
    return new URL(value.includes("://") ? value : "https://" + value).host.toLowerCase();
  } catch {
    return "";
  }
}

const listed = new Set(
  [SITE.url, ...(process.env.SITE_HOSTS || "").split(",")]
    .map((v) => v.trim())
    .filter(Boolean)
    .map(hostOf)
    .filter(Boolean)
);

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
