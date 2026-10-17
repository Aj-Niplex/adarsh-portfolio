"use client";

import { useEffect, useState } from "react";

const FLAG = "viewed-this-session";

export function ViewCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let alreadyCounted = false;
    try {
      alreadyCounted = sessionStorage.getItem(FLAG) === "1";
    } catch {
      // Storage can be blocked. Treat that as a first visit.
    }

    fetch("/api/views", { method: alreadyCounted ? "GET" : "POST", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data || typeof data.count !== "number") return;
        setCount(data.count);
        if (!alreadyCounted) {
          try {
            sessionStorage.setItem(FLAG, "1");
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
