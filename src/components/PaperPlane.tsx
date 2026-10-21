"use client";

const PLANE_PATH = "M6 62 C 40 62, 52 22, 92 30 S 130 18, 150 14";

/** A small paper plane that flies along a dashed trail while the code is on its way. */
export function PaperPlane() {
  const still = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  return (
    <svg className="plane" viewBox="0 0 160 80" width="160" height="80" aria-hidden="true">
      <path className="plane-trail" d={PLANE_PATH} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 7" />
      <g className="plane-body" transform={still ? "translate(150 14) rotate(-15)" : undefined}>
        <path d="M0 0 L-4 -9 L26 0 L-4 9 Z" fill="currentColor" />
        <path d="M-4 -9 L8 0 L-4 9 Z" fill="currentColor" opacity="0.55" />
        {!still && (
          <>
            <animateMotion dur="2.2s" repeatCount="indefinite" rotate="auto" path={PLANE_PATH} calcMode="spline" keyTimes="0;1" keySplines="0.45 0 0.55 1" />
            <animate attributeName="opacity" dur="2.2s" repeatCount="indefinite" values="0;1;1;0" keyTimes="0;0.12;0.88;1" />
          </>
        )}
      </g>
    </svg>
  );
}
