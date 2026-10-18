// Gemini often draws Mermaid with labels that Mermaid rejects.
// renderCandidates() returns the source as written first, then repaired forms.

const SHAPES: Array<[string, string]> = [
  ["(((", ")))"],
  ["((", "))"],
  ["([", "])"],
  ["[(", ")]"],
  ["[[", "]]"],
  ["{{", "}}"],
  ["[", "]"],
  ["{", "}"],
  ["(", ")"]
];

function cleanLabel(label: string) {
  return label
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/"/g, "'")
    .replace(/#/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Put double quotes around every node label so special characters are safe. */
export function quoteLabels(line: string): string {
  // Node id followed by an opening shape.
  const nodeRe = /([A-Za-z_][\w-]*)(\(\(\(|\(\(|\(\[|\[\(|\[\[|\{\{|\[|\{|\()/g;
  let result = "";
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = nodeRe.exec(line)) !== null) {
    const open = m[2];
    const shape = SHAPES.find(([o]) => o === open);
    if (!shape) continue;
    const close = shape[1];
    const start = m.index + m[0].length;
    if (line[start] === '"') {
      nodeRe.lastIndex = start;
      continue;
    }
    // The closing token is the last matching one before the next arrow or line end.
    const arrow = line.slice(start).search(/\s(?:-->|---|-\.->|==>|--[>ox]|<-->)/);
    const limit = arrow === -1 ? line.length : start + arrow;
    const closeIdx = line.lastIndexOf(close, limit);
    if (closeIdx < start) continue;
    const label = cleanLabel(line.slice(start, closeIdx));
    result += line.slice(last, m.index) + m[1] + open + '"' + label + '"' + close;
    last = closeIdx + close.length;
    nodeRe.lastIndex = last;
  }
  return result + line.slice(last);
}

function fixEdgeLabels(line: string) {
  // A -- text with (parens) --> B   =>   A -->|"text with parens"| B
  return line
    .replace(/(-->|---|==>)\s*\|([^|"]+)\|/g, (_all, arrow: string, text: string) => arrow + '|"' + cleanLabel(text) + '"|')
    .replace(/--\s+([^-"|>][^>|]*?)\s+-->/g, (_all, text: string) => '-->|"' + cleanLabel(text) + '"|');
}

export function repairFlowchart(code: string): string {
  const lines = code.replace(/\r\n?/g, "\n").split("\n");
  const fixed = lines.map((line, idx) => {
    const t = line.trim();
    if (idx === 0 || !t || t.startsWith("%%") || /^(subgraph|end|direction|classDef|class|style|linkStyle|click)\b/.test(t)) {
      if (/^subgraph\b/.test(t)) {
        const rest = t.replace(/^subgraph\s+/, "");
        if (rest && !/^[A-Za-z_][\w-]*\s*(\[|$)/.test(rest) && !rest.startsWith('"')) {
          return line.slice(0, line.indexOf("subgraph")) + 'subgraph "' + cleanLabel(rest) + '"';
        }
      }
      return line;
    }
    return fixEdgeLabels(quoteLabels(line));
  });
  return fixed.join("\n");
}

export function stripFence(code: string) {
  return code.replace(/^\s*```(?:mermaid)?\s*\n?/i, "").replace(/\n?```\s*$/, "").trim();
}

export function renderCandidates(source: string): string[] {
  const base = stripFence(source);
  const isFlow = /^\s*(graph|flowchart)\b/i.test(base);
  const list = [base];
  if (isFlow) {
    const repaired = repairFlowchart(base);
    if (repaired !== base) list.push(repaired);
    // Last resort: give plain ids to labels that still fail and drop edge labels.
    list.push(repaired.replace(/\|[^|\n]*\|/g, ""));
  }
  return Array.from(new Set(list));
}
