"use client";

import { Fragment, useMemo, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { isMermaidSource, parseMarkdown, safeHref, type Block, type Inline } from "@/lib/markdown";
import { MermaidBlock } from "./MermaidBlock";

type Props = {
  text: string;
  streaming?: boolean;
  /** Decides whether a link the model wrote may be shown as a link. */
  allowLink: (href: string) => boolean;
};

function Inlines({ nodes, allowLink }: { nodes: Inline[]; allowLink: Props["allowLink"] }): ReactNode {
  return (
    <>
      {nodes.map((n, i) => {
        switch (n.t) {
          case "text":
            return <Fragment key={i}>{n.v}</Fragment>;
          case "br":
            return <br key={i} />;
          case "code":
            return <code key={i}>{n.v}</code>;
          case "strong":
            return <strong key={i}><Inlines nodes={n.c} allowLink={allowLink} /></strong>;
          case "em":
            return <em key={i}><Inlines nodes={n.c} allowLink={allowLink} /></em>;
          case "del":
            return <del key={i}><Inlines nodes={n.c} allowLink={allowLink} /></del>;
          case "link": {
            const href = safeHref(n.href);
            // Links the model made up (for example a docs site that does not exist) are shown as plain text.
            if (!href || !allowLink(href)) return <Fragment key={i}><Inlines nodes={n.c} allowLink={allowLink} /></Fragment>;
            const external = /^https?:/i.test(href);
            return (
              <a key={i} href={href} {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}>
                <Inlines nodes={n.c} allowLink={allowLink} />
              </a>
            );
          }
        }
      })}
    </>
  );
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard can be blocked; nothing to do */
    }
  }
  return (
    <div className="md-code">
      <div className="md-code-bar">
        <span>{lang || "text"}</span>
        <button type="button" onClick={copy} aria-label="Copy code">
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre tabIndex={0}><code>{code}</code></pre>
    </div>
  );
}

function Blocks({ blocks, allowLink, streaming }: { blocks: Block[]; allowLink: Props["allowLink"]; streaming: boolean }): ReactNode {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.t) {
          case "p":
            return <p key={i}><Inlines nodes={b.c} allowLink={allowLink} /></p>;
          case "h": {
            const Tag = (b.level <= 2 ? "h4" : "h5") as "h4" | "h5";
            return <Tag key={i} className="md-h"><Inlines nodes={b.c} allowLink={allowLink} /></Tag>;
          }
          case "hr":
            return <hr key={i} />;
          case "quote":
            return <blockquote key={i}><Blocks blocks={b.c} allowLink={allowLink} streaming={streaming} /></blockquote>;
          case "list": {
            const Tag = b.ordered ? "ol" : "ul";
            return (
              <Tag key={i} {...(b.ordered && b.start !== 1 ? { start: b.start } : {})}>
                {b.items.map((item, j) => (
                  <li key={j}>
                    <Inlines nodes={item.c} allowLink={allowLink} />
                    {item.children.length > 0 && <Blocks blocks={item.children} allowLink={allowLink} streaming={streaming} />}
                  </li>
                ))}
              </Tag>
            );
          }
          case "table":
            return (
              <div className="md-table-wrap" key={i} tabIndex={0}>
                <table>
                  <thead>
                    <tr>
                      {b.head.map((h, j) => (
                        <th key={j} style={b.align[j] ? { textAlign: b.align[j]! } : undefined}><Inlines nodes={h} allowLink={allowLink} /></th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, r) => (
                      <tr key={r}>
                        {row.map((cell, j) => (
                          <td key={j} style={b.align[j] ? { textAlign: b.align[j]! } : undefined}><Inlines nodes={cell} allowLink={allowLink} /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "code":
            if (isMermaidSource(b.lang, b.v)) {
              if (!b.closed) return <div className="md-diagram-wait" key={i}>Drawing the diagram…</div>;
              return <MermaidBlock key={i} code={b.v} />;
            }
            return <CodeBlock key={i} lang={b.lang} code={b.v} />;
        }
      })}
    </>
  );
}

export function Markdown({ text, streaming = false, allowLink }: Props) {
  const blocks = useMemo(() => parseMarkdown(text, streaming), [text, streaming]);
  return (
    <div className="md">
      <Blocks blocks={blocks} allowLink={allowLink} streaming={streaming} />
    </div>
  );
}
