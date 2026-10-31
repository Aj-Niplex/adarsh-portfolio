"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type ComponentProps } from "react";
import { kmFileName, kmImageSize, kmUnscramble, type KmMode } from "@/lib/kmImages";

/* ---- Picture style: "funny" (the default) or "simple", chosen by the address (#funny / #simple) ---- */

const STORE_KEY = "km-mode";

function readMode(): KmMode {
  try {
    const h = window.location.hash.replace("#", "");
    if (h === "funny" || h === "simple") return h;
  } catch {
    // Reading the address never fails in a browser; the guard is for odd embeds.
  }
  try {
    const saved = window.localStorage.getItem(STORE_KEY);
    if (saved === "funny" || saved === "simple") return saved;
  } catch {
    // Storage can be blocked. The default is used.
  }
  return "funny";
}

function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  window.addEventListener("km-mode", cb);
  return () => {
    window.removeEventListener("hashchange", cb);
    window.removeEventListener("km-mode", cb);
  };
}

export function useKmMode(): KmMode {
  return useSyncExternalStore(subscribe, readMode, () => "funny");
}

export function setKmMode(mode: KmMode) {
  try {
    window.localStorage.setItem(STORE_KEY, mode);
  } catch {
    // Not saved; the address still carries the choice.
  }
  try {
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search + "#" + mode);
  } catch {
    // Ignore.
  }
  window.dispatchEvent(new Event("km-mode"));
}

/** A link inside the documentation that keeps the visitor's picture style. */
export function KmLink({ href, ...rest }: ComponentProps<typeof Link>) {
  const mode = useKmMode();
  const target = typeof href === "string" && mode === "simple" && !href.includes("#") ? href + "#simple" : href;
  return <Link href={target} {...rest} />;
}

export function KmModeToggle() {
  const mode = useKmMode();
  return (
    <div className="km-mode" role="group" aria-label="Picture style">
      <span>Pictures</span>
      {(["funny", "simple"] as const).map((m) => (
        <button key={m} type="button" className={mode === m ? "on" : ""} aria-pressed={mode === m} onClick={() => setKmMode(m)}>
          {m === "funny" ? "Funny" : "Simple"}
        </button>
      ))}
    </div>
  );
}

/* ---- The picture itself ---- */

const bitmaps = new Map<string, Promise<ImageBitmap | null>>();

function loadBitmap(id: string, mode: KmMode): Promise<ImageBitmap | null> {
  const key = id + "|" + mode;
  let hit = bitmaps.get(key);
  if (!hit) {
    hit = fetch("/km/" + kmFileName(id, mode) + ".dat")
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error("missing"))))
      .then((buf) => createImageBitmap(new Blob([kmUnscramble(new Uint8Array(buf), id, mode) as BlobPart], { type: "image/webp" })))
      .catch(() => {
        bitmaps.delete(key);
        return null;
      });
    bitmaps.set(key, hit);
  }
  return hit;
}

export function KmImage({ id, alt, priority = false }: { id: string; alt: string; priority?: boolean }) {
  const mode = useKmMode();
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [near, setNear] = useState(priority);
  const [ready, setReady] = useState(false);
  const { w, h } = kmImageSize(id);

  useEffect(() => {
    if (near || !box.current) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    io.observe(box.current);
    return () => io.disconnect();
  }, [near]);

  useEffect(() => {
    if (!near) return;
    let stale = false;
    loadBitmap(id, mode).then((bmp) => {
      const c = canvas.current;
      if (stale || !bmp || !c) return;
      c.width = bmp.width;
      c.height = bmp.height;
      c.getContext("2d")?.drawImage(bmp, 0, 0);
      setReady(true);
    });
    return () => {
      stale = true;
    };
  }, [near, id, mode]);

  const stop = (e: { preventDefault: () => void }) => e.preventDefault();
  return (
    <div
      ref={box}
      className={"km-img" + (ready ? " ready" : "")}
      style={{ aspectRatio: w + " / " + h }}
      role="img"
      aria-label={alt}
      onContextMenu={stop}
      onDragStart={stop}
    >
      <canvas ref={canvas} width={w} height={h} aria-hidden="true" />
      <span className="km-img-shield" aria-hidden="true" />
    </div>
  );
}
