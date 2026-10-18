"use client";

import { useEffect, useId, useState } from "react";
import { renderCandidates } from "@/lib/mermaidRepair";

// Mermaid draws one diagram at a time; this queue keeps renders from overlapping.
let queue: Promise<unknown> = Promise.resolve();

function cssVar(name: string, fallback: string) {
  try {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  } catch {
    return fallback;
  }
}

/** Changes whenever the visitor switches style or Day / Dark, so diagrams redraw in the new colours. */
function useThemeKey() {
  const [key, setKey] = useState("");
  useEffect(() => {
    const read = () => setKey(document.documentElement.dataset.theme + "/" + document.documentElement.dataset.mode);
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-mode"] });
    return () => observer.disconnect();
  }, []);
  return key;
}

export function MermaidBlock({ code }: { code: string }) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const themeKey = useThemeKey();
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!themeKey) return;
    let cancelled = false;

    const run = async () => {
      let mermaid: (typeof import("mermaid"))["default"];
      try {
        mermaid = (await import("mermaid")).default;
      } catch {
        if (!cancelled) setFailed(true);
        return;
      }
      const text = cssVar("--text", "#eae4dc");
      const surface = cssVar("--surface-2", "#171313");
      const border = cssVar("--border", "#2a2121");
      const accent = cssVar("--accent", "#a82b1b");
      const muted = cssVar("--muted", "#9a8e88");
      const bg = cssVar("--bg", "#080707");
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "base",
        fontFamily: cssVar("--f-body", "sans-serif"),
        flowchart: { htmlLabels: false, curve: "basis", useMaxWidth: true },
        themeVariables: {
          background: bg,
          primaryColor: surface,
          primaryTextColor: text,
          primaryBorderColor: accent,
          secondaryColor: surface,
          tertiaryColor: bg,
          lineColor: muted,
          textColor: text,
          nodeBorder: accent,
          clusterBkg: bg,
          clusterBorder: border,
          edgeLabelBackground: bg
        }
      });

      let attempt = 0;
      for (const candidate of renderCandidates(code)) {
        attempt += 1;
        const id = "mmd" + rawId + attempt + Date.now().toString(36);
        try {
          // parse() throws on invalid syntax without leaving an error graphic on the page.
          await mermaid.parse(candidate);
          const result = await mermaid.render(id, candidate);
          if (!cancelled) {
            setSvg(result.svg);
            setFailed(false);
          }
          return;
        } catch {
          document.getElementById(id)?.remove();
          document.getElementById("d" + id)?.remove();
        }
      }
      if (!cancelled) setFailed(true);
    };

    queue = queue.then(run, run);
    return () => {
      cancelled = true;
    };
  }, [code, themeKey, rawId]);

  if (failed) {
    return (
      <div className="md-code">
        <div className="md-code-bar">
          <span>diagram source</span>
        </div>
        <pre tabIndex={0}><code>{code}</code></pre>
      </div>
    );
  }
  if (!svg) return <div className="md-diagram-wait">Drawing the diagram…</div>;
  return (
    <figure className="md-diagram" role="img" aria-label="Diagram from the answer">
      {/* Mermaid runs in strict mode, which sanitises labels before it returns the SVG. */}
      <div dangerouslySetInnerHTML={{ __html: svg }} />
      <details>
        <summary>Diagram source</summary>
        <pre tabIndex={0}><code>{code}</code></pre>
      </details>
    </figure>
  );
}
