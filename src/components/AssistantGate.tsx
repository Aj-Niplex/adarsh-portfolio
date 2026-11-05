"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useAgreed } from "@/lib/consentClient";

// The assistant lives on the second service. The page asks that service whether it is running and
// has its key, and only then loads the chat window. If the service is off, nothing is shown and
// none of the chat code is downloaded.
const AIWidget = dynamic(() => import("./AIWidget").then((m) => m.AIWidget), { ssr: false });

const KEY = "assistant-up";
const FRESH_MS = 60_000;

export function AssistantGate() {
  const [on, setOn] = useState(false);
  // The service is not contacted until the visitor has agreed to the Privacy Policy.
  const agreed = useAgreed();

  useEffect(() => {
    if (!agreed) return;
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
    // A failed request (offline, a slow network) is not an answer. The service is asked again a few times
    // and whenever the connection returns, so a bad moment at page load does not remove the chat.
    let tries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const ask = () => {
      clearTimeout(timer);
      fetch("/api/assistant", { cache: "no-store", signal: AbortSignal.timeout(6000) })
        .then((r) => {
          if (!r.ok) throw new Error("status " + r.status);
          return r.json();
        })
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
          if (cancelled) return;
          tries += 1;
          if (tries <= 3) timer = setTimeout(ask, tries * 4000);
        });
    };
    const again = () => {
      tries = 0;
      ask();
    };
    window.addEventListener("online", again);
    ask();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("online", again);
    };
  }, [agreed]);

  return on ? <AIWidget /> : null;
}
