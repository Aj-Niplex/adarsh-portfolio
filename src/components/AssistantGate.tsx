"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// The assistant lives on the second service. The page asks that service whether it is running and
// has its key, and only then loads the chat window. If the service is off, nothing is shown and
// none of the chat code is downloaded.
const AIWidget = dynamic(() => import("./AIWidget").then((m) => m.AIWidget), { ssr: false });

const KEY = "assistant-up";
const FRESH_MS = 60_000;

export function AssistantGate() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY) || "null") as { up: boolean; at: number } | null;
      if (saved && Date.now() - saved.at < FRESH_MS) {
        setOn(saved.up);
        return;
      }
    } catch {
      // Storage can be blocked; ask the service each time then.
    }
    fetch("/api/assistant", { cache: "no-store", signal: AbortSignal.timeout(4000) })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { up?: boolean; assistant?: boolean } | null) => {
        const up = Boolean(data && data.up === true && data.assistant === true);
        try {
          sessionStorage.setItem(KEY, JSON.stringify({ up, at: Date.now() }));
        } catch {
          // Ignore.
        }
        if (!cancelled) setOn(up);
      })
      .catch(() => {
        if (!cancelled) setOn(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return on ? <AIWidget /> : null;
}
