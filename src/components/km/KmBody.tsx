import type { ReactNode } from "react";
import type { Block } from "@/lib/km/types";
import { KmLink } from "./KmImage";
import { MermaidBlock } from "@/components/MermaidBlock";
import { KM_BASE } from "@/lib/km/pages";

/** `code` and **bold** inside a line of text. */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    out.push(tok.startsWith("`") ? <code key={i++}>{tok.slice(1, -1)}</code> : <strong key={i++}>{tok.slice(2, -2)}</strong>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** The pages' own text files: ## headings, bullet and numbered lists, one table, code fences. */
function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  let k = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) buf.push(lines[i++]);
      i++;
      out.push(<pre className="km-code" key={k++}><code>{buf.join("\n")}</code></pre>);
      continue;
    }
    const h = line.match(/^(#{2,4})\s+(.*)$/);
    if (h) {
      out.push(h[1] === "##" ? <h2 key={k++}>{inline(h[2])}</h2> : <h3 key={k++}>{inline(h[2])}</h3>);
      i++;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s+/, ""));
      out.push(<ul className="list" key={k++}>{items.map((t, n) => <li key={n}>{inline(t)}</li>)}</ul>);
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+\.\s+/, ""));
      out.push(<ol className="km-ol" key={k++}>{items.map((t, n) => <li key={n}>{inline(t)}</li>)}</ol>);
      continue;
    }
    if (line.trim().startsWith("|")) {
      const tbl: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        if (!/^\s*\|[\s:|-]+\|\s*$/.test(lines[i])) tbl.push(lines[i].trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
        i++;
      }
      out.push(<TableBlock key={k++} head={tbl[0]} rows={tbl.slice(1)} />);
      continue;
    }
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{2,4}\s|\s*[-*]\s|\s*\d+\.\s|```|\|)/.test(lines[i])) buf.push(lines[i++]);
    out.push(<p key={k++}>{inline(buf.join(" "))}</p>);
  }
  return <div className="km-md">{out}</div>;
}

function Cell({ value }: { value: string }) {
  // "label|/path" is a link inside this section.
  const bar = value.lastIndexOf("|");
  if (bar > 0 && value.slice(bar + 1).startsWith("/")) return <KmLink href={value.slice(bar + 1)}>{value.slice(0, bar)}</KmLink>;
  return <>{inline(value)}</>;
}

function TableBlock({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="km-table-wrap">
      <table className="km-table">
        <thead>
          <tr>{head.map((c, i) => <th key={i}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j} data-label={head[j]}><Cell value={c} /></td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function KmBody({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.t) {
          case "md":
            return <Markdown key={i} text={b.text} />;
          case "h":
            return <h2 key={i} className="km-h">{b.text}</h2>;
          case "p":
            return <p key={i} className="km-p">{inline(b.text)}</p>;
          case "note":
            return <p key={i} className="km-note">{inline(b.text)}</p>;
          case "list":
            return <ul key={i} className="list">{b.items.map((t, n) => <li key={n}>{inline(t)}</li>)}</ul>;
          case "kv":
            return (
              <dl key={i} className="km-kv">
                {b.rows.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{inline(v)}</dd>
                  </div>
                ))}
              </dl>
            );
          case "table":
            return <TableBlock key={i} head={b.head} rows={b.rows} />;
          case "code":
            return (
              <figure key={i} className="km-codefig">
                {b.label && <figcaption>{b.label}</figcaption>}
                <pre className="km-code"><code>{b.text}</code></pre>
              </figure>
            );
          case "steps":
            return (
              <div className="steps" key={i}>
                {b.items.map((s, n) => (
                  <div className="step" key={n} id={s.anchor}>
                    <div>
                      {s.title && <b>{s.title}</b>}
                      <span>{inline(s.body)}</span>
                      {s.refs && s.refs.length > 0 && (
                        <span className="km-refs">
                          {s.refs.map((r) => {
                            const [t, p] = r.split("|");
                            return <KmLink key={p} href={KM_BASE + "/" + p}>{t}</KmLink>;
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          case "convo":
            return (
              <div className="km-convo" key={i}>
                {b.turns.map((t, n) => (
                  <div className={"km-turn " + (t.who === "You" ? "you" : t.who === "Tool" ? "tool" : "bot")} key={n}>
                    <b>{t.who}</b>
                    <p>{inline(t.text)}</p>
                    {(t.extra || []).map((e, x) => <small key={x}>{e}</small>)}
                  </div>
                ))}
                {b.notice && <p className="km-note">{b.notice.join(" ")}</p>}
              </div>
            );
          case "mermaid":
            return <div className="km-diagram" key={i}><MermaidBlock code={b.code} /></div>;
          case "cards":
            return (
              <div className="km-cards" key={i}>
                {b.items.map((c) => (
                  <KmLink key={c.path} href={KM_BASE + "/" + c.path} className="km-card">
                    <b>{c.title}</b>
                    <span>{c.summary}</span>
                  </KmLink>
                ))}
              </div>
            );
          case "entries":
            return (
              <div className="km-entries" key={i}>
                {b.items.map((e) => (
                  <article id={e.anchor} key={e.anchor} className="km-entry">
                    <h3><a href={"#" + e.anchor} aria-label="Link to this entry">{e.title}</a></h3>
                    <p>{inline(e.body)}</p>
                    {e.meta && <ul className="km-meta">{e.meta.split("\n").map((m, n) => <li key={n}>{inline(m)}</li>)}</ul>}
                  </article>
                ))}
              </div>
            );
          case "links":
            return (
              <p key={i} className="km-reflinks">
                <span>{b.label}:</span>
                {b.items.map((l) => <KmLink key={l.path} href={KM_BASE + "/" + l.path}>{l.title}</KmLink>)}
              </p>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
