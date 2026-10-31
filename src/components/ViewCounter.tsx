"use client";

import { useEffect, useState } from "react";

// A browser is counted once. The flag lives in local storage (it survives closing the tab and
// redeploys) and the server also sets a cookie. Opening any page once with ?owner=1 marks this
// browser as the owner's, and it is never counted again.
const FLAG = "viewed-counted";
const OWNER = "viewed-owner";
const DAYS_30 = 30 * 24 * 60 * 60 * 1000;

export function ViewCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let alreadyCounted = false;
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get("owner") === "1") {
        localStorage.setItem(OWNER, "1");
        url.searchParams.delete("owner");
        window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
      }
      const seen = Number(localStorage.getItem(FLAG) || 0);
      alreadyCounted = localStorage.getItem(OWNER) === "1" || (seen > 0 && Date.now() - seen < DAYS_30);
    } catch {
      // Storage can be blocked. The cookie on the server side still stops repeat counting.
    }

    fetch("/api/views", { method: alreadyCounted ? "GET" : "POST", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data || typeof data.count !== "number") return;
        setCount(data.count);
        if (!alreadyCounted && (data.counted === true || data.already === true)) {
          try {
            localStorage.setItem(FLAG, String(Date.now()));
          } catch {
            // Ignore. The worst case is one extra count on the next page load.
          }
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  if (count === null) return null;

  return (
    <p className="view-counter" aria-label={count.toLocaleString("en-IN") + " visits"}>
      <span className="mono">{count.toLocaleString("en-IN")}</span> visits
    </p>
  );
}
