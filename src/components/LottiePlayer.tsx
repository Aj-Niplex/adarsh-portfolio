"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { LOTTIE, LOTTIE_WASM, type LottieName } from "@/lib/lottie";

type Props = {
  name: LottieName;
  /** Read by screen readers. Pass an empty string for a purely decorative animation. */
  label: string;
  /** Pixel size of the square the animation is drawn in. */
  size: number;
  loop?: boolean;
  /** Shown while the animation loads, and instead of it if it cannot load or motion is reduced. */
  fallback: ReactNode;
  /** Wait until the browser is idle after the page has loaded before fetching anything. */
  defer?: boolean;
};

function motionReduced() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function dataSaver() {
  const connection = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
  return Boolean(connection?.saveData);
}

export function LottiePlayer({ name, label, size, loop = true, fallback, defer = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (motionReduced() || dataSaver()) {
      setFailed(true);
      return;
    }
    let cancelled = false;
    let player: { destroy: () => void } | null = null;
    let idle: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const start = async () => {
      try {
        const { DotLottie } = await import("@lottiefiles/dotlottie-web");
        if (cancelled || !canvasRef.current) return;
        // The player's engine is served from this site, so no other host is needed to run it.
        DotLottie.setWasmUrl(LOTTIE_WASM);
        const instance = new DotLottie({
          canvas: canvasRef.current,
          src: LOTTIE[name],
          loop,
          autoplay: true,
          renderConfig: { autoResize: true, devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2), freezeOnOffscreen: true }
        });
        player = instance;
        instance.addEventListener("load", () => !cancelled && setReady(true));
        instance.addEventListener("loadError", () => !cancelled && setFailed(true));
        instance.addEventListener("renderError", () => !cancelled && setFailed(true));
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    if (defer) {
      const kick = () => {
        if ("requestIdleCallback" in window) idle = window.requestIdleCallback(() => void start(), { timeout: 4000 });
        else timer = setTimeout(() => void start(), 1500);
      };
      if (document.readyState === "complete") kick();
      else window.addEventListener("load", kick, { once: true });
    } else {
      void start();
    }

    return () => {
      cancelled = true;
      if (idle !== undefined && "cancelIdleCallback" in window) window.cancelIdleCallback(idle);
      if (timer) clearTimeout(timer);
      try {
        player?.destroy();
      } catch {
        /* the player may already be gone */
      }
    };
  }, [name, loop, defer]);

  if (failed) return <span className="lottie-fallback" style={{ width: size, height: size }}>{fallback}</span>;

  return (
    <span
      className={"lottie" + (ready ? " is-ready" : "")}
      style={{ width: size, height: size }}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      {!ready && <span className="lottie-fallback" style={{ width: size, height: size }}>{fallback}</span>}
      <canvas ref={canvasRef} className="lottie-canvas" />
    </span>
  );
}
