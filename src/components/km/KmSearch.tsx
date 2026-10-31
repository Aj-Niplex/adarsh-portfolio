"use client";

import { useEffect, useRef, useState } from "react";
import { KmImage, KmLink } from "./KmImage";

type Entry = { p: string; t: string; s: string; k: string; x: string };

const BASE = "/projects/niplex-harness";
let indexPromise: Promise<Entry[]> | null = null;

function loadIndex() {
  if (!indexPromise) {
    indexPromise = fetch(BASE + "/search-index.json")
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => {
        indexPromise = null;
        return [] as Entry[];
      });
  }
  return indexPromise;
}

function search(index: Entry[], q: string): Entry[] {
  const words = q.toLowerCase().split(/[^a-z0-9_/+.-]+/).filter(Boolean);
  if (!words.length) return [];
  const scored: { e: Entry; score: number }[] = [];
  for (const e of index) {
    const title = e.t.toLowerCase();
    const keys = e.k.toLowerCase();
    const sum = e.s.toLowerCase();
    const text = e.x.toLowerCase();
    let score = 0;
    let ok = true;
    for (const w of words) {
      let s = 0;
      if (title.includes(w)) s += title.startsWith(w) ? 9 : 6;
      if (keys.includes(w)) s += 3;
      if (sum.includes(w)) s += 2;
      if (text.includes(w)) s += 1;
      if (!s) {
        ok = false;
        break;
      }
      score += s;
    }
    if (ok) scored.push({ e, score });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, 8).map((x) => x.e);
}

export function KmSearch() {
  const [q, setQ] = useState("");
  const [index, setIndex] = useState<Entry[] | null>(null);
  const [active, setActive] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || index) return;
    let live = true;
    loadIndex().then((i) => live && setIndex(i));
    return () => {
      live = false;
    };
  }, [active, index]);

  useEffect(() => {
    const away = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setActive(false);
    };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, []);

  const results = index && q.trim() ? search(index, q) : [];
  const loading = active && q.trim() && !index;
  const empty = index && q.trim() && results.length === 0;

  return (
    <div className="km-search" ref={box}>
      <label className="sr-only" htmlFor="km-q">Search the documentation</label>
      <input
        id="km-q"
        type="search"
        value={q}
        placeholder="Search the documentation"
        autoComplete="off"
        onFocus={() => setActive(true)}
        onChange={(e) => {
          setQ(e.target.value);
          setActive(true);
        }}
        onKeyDown={(e) => e.key === "Escape" && setActive(false)}
      />
      {active && q.trim() && (
        <div className="km-results" role="region" aria-live="polite">
          {loading && (
            <div className="km-state">
              <KmImage id="state-loading" alt="Manas knitting a small scarf while the search loads" />
              <p>Loading the search</p>
            </div>
          )}
          {empty && (
            <div className="km-state">
              <KmImage id="state-empty-search" alt="Manas looking into an empty box" />
              <p>Nothing found for &ldquo;{q.trim()}&rdquo;. Try a shorter word, such as a tool or setting name.</p>
            </div>
          )}
          {results.length > 0 && (
            <ul>
              {results.map((r) => (
                <li key={r.p}>
                  <KmLink href={BASE + "/" + r.p} onClick={() => setActive(false)}>
                    <b>{r.t}</b>
                    <span>{r.s}</span>
                  </KmLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
