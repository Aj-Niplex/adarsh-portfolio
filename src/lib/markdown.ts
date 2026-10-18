// A small, safe markdown parser for chat answers.
// It never produces HTML. It returns a tree that React renders as elements.
// It also repairs the quirks that Gemini output and partial streaming produce.

export type Inline =
  | { t: "text"; v: string }
  | { t: "code"; v: string }
  | { t: "strong"; c: Inline[] }
  | { t: "em"; c: Inline[] }
  | { t: "del"; c: Inline[] }
  | { t: "link"; href: string; c: Inline[] }
  | { t: "br" };

export type ListItem = { c: Inline[]; children: Block[] };

export type Block =
  | { t: "p"; c: Inline[] }
  | { t: "h"; level: 1 | 2 | 3 | 4; c: Inline[] }
  | { t: "list"; ordered: boolean; start: number; items: ListItem[] }
  | { t: "quote"; c: Block[] }
  | { t: "code"; lang: string; v: string; closed: boolean }
  | { t: "table"; head: Inline[][]; align: Array<"left" | "right" | "center" | null>; rows: Inline[][][] }
  | { t: "hr" };

const HTML_TAGS =
  "a|abbr|b|blockquote|br|center|code|dd|del|details|div|dl|dt|em|figure|font|h[1-6]|hr|i|ins|kbd|li|mark|ol|p|pre|s|small|span|strike|strong|sub|summary|sup|table|tbody|td|tfoot|th|thead|tr|u|ul";
const HTML_TAG_RE = new RegExp("</?(?:" + HTML_TAGS + ")(?:\\s[^<>]*)?/?>", "gi");
const FENCE_RE = /^\s*(`{3,}|~{3,})\s*([\w+#.-]*)/;
const BULLET_RE = /^(\s*)([-*+•◦▪●])\s+(.*)$/;
const ORDERED_RE = /^(\s*)(\d{1,3})[.)]\s+(.*)$/;

/** Clean up model output before parsing. Code fences are left untouched. */
export function normalizeModelText(raw: string, streaming = false): string {
  let text = raw.replace(/\r\n?/g, "\n");

  // Double-escaped newlines show up as the two characters \ and n.
  const realBreaks = (text.match(/\n/g) || []).length;
  if (text.includes("\\n") && realBreaks < 2) text = text.replace(/\\n/g, "\n");

  const out: string[] = [];
  let inFence = false;
  let fenceChar = "";
  for (const original of text.split("\n")) {
    const fence = FENCE_RE.exec(original);
    if (fence) {
      if (!inFence) {
        inFence = true;
        fenceChar = fence[1][0];
        // "```python some extra words" -> "```python"
        out.push(fence[1] + fence[2]);
      } else if (fence[1][0] === fenceChar && original.trim().replace(/[`~]/g, "") === "") {
        inFence = false;
        out.push(original.trim());
      } else {
        out.push(original);
      }
      continue;
    }
    if (inFence) {
      out.push(original);
      continue;
    }
    let line = original;
    line = line.replace(/<br\s*\/?>/gi, "\n").replace(HTML_TAG_RE, "");
    line = line.replace(/^(\s*)[•◦▪●]\s+/, "$1- ");
    out.push(line);
  }
  text = out.join("\n");

  if (streaming && !inFence) text = closeDanglingMarkers(text);
  return text;
}

function countOf(s: string, token: string) {
  let n = 0;
  let idx = s.indexOf(token);
  while (idx !== -1) {
    n++;
    idx = s.indexOf(token, idx + token.length);
  }
  return n;
}

/**
 * While tokens are still arriving, the last line may hold a half-typed marker.
 * Drop a marker that was just typed and close one that is still open, so the
 * text never flashes raw asterisks.
 */
function closeDanglingMarkers(text: string): string {
  const cut = text.lastIndexOf("\n") + 1;
  const head = text.slice(0, cut);
  let line = text.slice(cut);
  if (!line.trim()) return text;

  const bulletLead = /^(\s*)([-*+])\s+/.exec(line);
  const lead = bulletLead ? bulletLead[0] : "";
  let body = line.slice(lead.length);

  const trailing = /(\*\*|~~|`|\*)$/.exec(body);
  if (trailing) {
    const token = trailing[1];
    const odd =
      token === "*"
        ? countOf(body.replace(/\*\*/g, ""), "*") % 2 === 1
        : countOf(body, token) % 2 === 1;
    if (odd) body = body.slice(0, -token.length);
  }

  if (countOf(body, "**") % 2 === 1) body += "**";
  if (countOf(body, "~~") % 2 === 1) body += "~~";
  if (countOf(body, "`") % 2 === 1) body += "`";
  if (countOf(body.replace(/\*\*/g, ""), "*") % 2 === 1) body += "*";

  line = lead + body;
  return head + line;
}

export function isMermaidSource(lang: string, code: string) {
  if (lang.toLowerCase() === "mermaid") return true;
  if (lang) return false;
  return /^\s*(graph|flowchart|sequenceDiagram|stateDiagram|classDiagram|erDiagram|gantt|journey|mindmap|timeline)\b/.test(code);
}

function isSeparatorRow(line: string) {
  if (!line.includes("-")) return false;
  return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line) && (line.includes("|") || /^\s*:?-{2,}:?\s*$/.test(line) === false);
}

function splitRow(line: string): string[] {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|") && !s.endsWith("\\|")) s = s.slice(0, -1);
  const cells: string[] = [];
  let cur = "";
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "\\" && s[i + 1] === "|") {
      cur += "|";
      i++;
    } else if (s[i] === "|") {
      cells.push(cur.trim());
      cur = "";
    } else {
      cur += s[i];
    }
  }
  cells.push(cur.trim());
  return cells;
}

function startsBlock(line: string) {
  return (
    FENCE_RE.test(line) ||
    /^#{1,6}\s+\S/.test(line) ||
    /^\s*>\s?/.test(line) ||
    BULLET_RE.test(line) ||
    ORDERED_RE.test(line) ||
    /^\s*([-*_])(\s*\1){2,}\s*$/.test(line)
  );
}

type Flat = { indent: number; ordered: boolean; num: number; text: string };

function buildList(flat: Flat[]): Block[] {
  const root: Block[] = [];
  type Frame = { indent: number; ordered: boolean; block: Extract<Block, { t: "list" }>; container: Block[] };
  const stack: Frame[] = [];
  const open = (indent: number, ordered: boolean, num: number, container: Block[]) => {
    const block: Extract<Block, { t: "list" }> = { t: "list", ordered, start: num, items: [] };
    container.push(block);
    const frame = { indent, ordered, block, container };
    stack.push(frame);
    return frame;
  };

  for (const item of flat) {
    let frame = stack[stack.length - 1];
    if (!frame) {
      frame = open(item.indent, item.ordered, item.num, root);
    } else if (item.indent > frame.indent + 0 && frame.block.items.length > 0 && item.indent >= frame.indent + 2) {
      const parent = frame.block.items[frame.block.items.length - 1];
      frame = open(item.indent, item.ordered, item.num, parent.children);
    } else {
      while (stack.length > 1 && item.indent < stack[stack.length - 1].indent - 1) stack.pop();
      frame = stack[stack.length - 1];
      if (frame.ordered !== item.ordered) {
        stack.pop();
        frame = open(frame.indent, item.ordered, item.num, frame.container);
      }
    }
    frame.block.items.push({ c: parseInline(item.text), children: [] });
  }
  return root;
}

export function parseBlocks(text: string): Block[] {
  const lines = text.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }

    const fence = FENCE_RE.exec(line);
    if (fence) {
      const mark = fence[1];
      const lang = fence[2] || "";
      const body: string[] = [];
      i++;
      let closed = false;
      while (i < lines.length) {
        const t = lines[i].trim();
        if (t.startsWith(mark[0].repeat(mark.length)) && t.replace(/[`~]/g, "") === "") {
          closed = true;
          i++;
          break;
        }
        body.push(lines[i]);
        i++;
      }
      blocks.push({ t: "code", lang, v: body.join("\n"), closed });
      continue;
    }

    const heading = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (heading) {
      const level = Math.min(heading[1].length, 4) as 1 | 2 | 3 | 4;
      blocks.push({ t: "h", level, c: parseInline(heading[2]) });
      i++;
      continue;
    }

    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      blocks.push({ t: "hr" });
      i++;
      continue;
    }

    if (line.includes("|") && i + 1 < lines.length && isSeparatorRow(lines[i + 1])) {
      const head = splitRow(line);
      const sep = splitRow(lines[i + 1]);
      const align = head.map((_, idx) => {
        const s = sep[idx] || "";
        const l = s.startsWith(":");
        const r = s.endsWith(":");
        return l && r ? "center" : r ? "right" : l ? "left" : null;
      }) as Array<"left" | "right" | "center" | null>;
      i += 2;
      const rows: Inline[][][] = [];
      while (i < lines.length && lines[i].trim() && lines[i].includes("|")) {
        const cells = splitRow(lines[i]);
        rows.push(head.map((_, idx) => parseInline(cells[idx] || "")));
        i++;
      }
      blocks.push({ t: "table", head: head.map((h) => parseInline(h)), align, rows });
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const inner: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        inner.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      blocks.push({ t: "quote", c: parseBlocks(inner.join("\n")) });
      continue;
    }

    if (BULLET_RE.test(line) || ORDERED_RE.test(line)) {
      const flat: Flat[] = [];
      while (i < lines.length) {
        const cur = lines[i];
        const b = BULLET_RE.exec(cur);
        const o = ORDERED_RE.exec(cur);
        if (b || o) {
          const m = (b || o)!;
          flat.push({
            indent: m[1].replace(/\t/g, "    ").length,
            ordered: Boolean(o && !b),
            num: o && !b ? Number(o[2]) : 1,
            text: m[3]
          });
          i++;
          continue;
        }
        if (!cur.trim()) {
          // Blank lines only continue the list if another item follows.
          let j = i + 1;
          while (j < lines.length && !lines[j].trim()) j++;
          if (j < lines.length && (BULLET_RE.test(lines[j]) || ORDERED_RE.test(lines[j]))) {
            i = j;
            continue;
          }
          break;
        }
        const last = flat[flat.length - 1];
        const indent = cur.length - cur.trimStart().length;
        if (last && indent > last.indent && !startsBlock(cur)) {
          last.text += "\n" + cur.trim();
          i++;
          continue;
        }
        break;
      }
      blocks.push(...buildList(flat));
      continue;
    }

    // Paragraph
    const para: string[] = [line.trim()];
    i++;
    while (i < lines.length && lines[i].trim() && !startsBlock(lines[i])) {
      if (lines[i].includes("|") && i + 1 < lines.length && isSeparatorRow(lines[i + 1])) break;
      para.push(lines[i].trim());
      i++;
    }
    blocks.push({ t: "p", c: parseInline(para.join("\n")) });
  }
  return blocks;
}

const ESCAPABLE = /[\\`*_{}[\]()#+\-.!|~>$]/;

function findCodeEnd(src: string, from: number, ticks: number) {
  const marker = "`".repeat(ticks);
  let idx = src.indexOf(marker, from);
  while (idx !== -1) {
    if (src[idx + ticks] !== "`" && src[idx - 1] !== "`") return idx;
    idx = src.indexOf(marker, idx + 1);
  }
  return -1;
}

function findCloser(src: string, marker: string, from: number) {
  let idx = src.indexOf(marker, from);
  while (idx !== -1) {
    const before = src[idx - 1];
    const after = src[idx + marker.length];
    const contentOk = idx > from && !/\s/.test(before || "");
    const notBigger = marker.length === 2 ? true : after !== marker && before !== marker;
    if (contentOk && notBigger) return idx;
    idx = src.indexOf(marker, idx + 1);
  }
  return -1;
}

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let buf = "";
  const flush = () => {
    if (buf) {
      out.push({ t: "text", v: buf });
      buf = "";
    }
  };
  let i = 0;

  while (i < src.length) {
    const ch = src[i];

    if (ch === "\\" && i + 1 < src.length && ESCAPABLE.test(src[i + 1])) {
      buf += src[i + 1];
      i += 2;
      continue;
    }

    if (ch === "\n") {
      flush();
      out.push({ t: "br" });
      i++;
      continue;
    }

    if (ch === "`") {
      let ticks = 1;
      while (src[i + ticks] === "`") ticks++;
      const end = findCodeEnd(src, i + ticks, ticks);
      if (end !== -1) {
        flush();
        out.push({ t: "code", v: src.slice(i + ticks, end).replace(/^ ([\s\S]*) $/, "$1") });
        i = end + ticks;
        continue;
      }
      buf += "`".repeat(ticks);
      i += ticks;
      continue;
    }

    if ((src.startsWith("**", i) || src.startsWith("__", i)) && !/\s/.test(src[i + 2] || " ")) {
      const marker = src.slice(i, i + 2);
      const wordBefore = /\w/.test(src[i - 1] || "");
      if (!(marker === "__" && wordBefore)) {
        const end = findCloser(src, marker, i + 2);
        if (end !== -1) {
          flush();
          out.push({ t: "strong", c: parseInline(src.slice(i + 2, end)) });
          i = end + 2;
          continue;
        }
      }
    }

    if (src.startsWith("~~", i) && !/\s/.test(src[i + 2] || " ")) {
      const end = findCloser(src, "~~", i + 2);
      if (end !== -1) {
        flush();
        out.push({ t: "del", c: parseInline(src.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }

    if ((ch === "*" || ch === "_") && src[i + 1] !== ch && !/\s/.test(src[i + 1] || " ")) {
      const wordBefore = /\w/.test(src[i - 1] || "");
      if (!(ch === "_" && wordBefore)) {
        let end = findCloser(src, ch, i + 1);
        if (ch === "_") {
          while (end !== -1 && /\w/.test(src[end + 1] || "")) end = findCloser(src, ch, end + 1);
        }
        if (end !== -1) {
          flush();
          out.push({ t: "em", c: parseInline(src.slice(i + 1, end)) });
          i = end + 1;
          continue;
        }
      }
    }

    if (ch === "[") {
      const close = src.indexOf("](", i + 1);
      if (close !== -1) {
        const end = src.indexOf(")", close + 2);
        if (end !== -1) {
          const label = src.slice(i + 1, close);
          const href = src.slice(close + 2, end).trim().split(/\s+/)[0];
          if (label && !label.includes("\n")) {
            flush();
            out.push({ t: "link", href, c: parseInline(label) });
            i = end + 1;
            continue;
          }
        }
      }
    }

    if ((ch === "h" || ch === "H") && /^https?:\/\//i.test(src.slice(i, i + 8))) {
      const m = /^https?:\/\/[^\s<>()[\]"']+/i.exec(src.slice(i));
      if (m) {
        const url = m[0].replace(/[.,;:!?]+$/, "");
        flush();
        out.push({ t: "link", href: url, c: [{ t: "text", v: url }] });
        i += url.length;
        continue;
      }
    }

    buf += ch;
    i++;
  }
  flush();
  return out;
}

/** Only these link targets are ever rendered as links. */
export function safeHref(href: string): string | null {
  const h = href.trim();
  if (/^https?:\/\//i.test(h)) return h;
  if (/^mailto:/i.test(h)) return h;
  if (/^\/(?!\/)/.test(h)) return h;
  if (/^#/.test(h)) return h;
  return null;
}

export function parseMarkdown(raw: string, streaming = false): Block[] {
  return parseBlocks(normalizeModelText(raw, streaming));
}
