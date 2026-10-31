export type Block =
  | { t: "md"; text: string }
  | { t: "h"; text: string }
  | { t: "p"; text: string }
  | { t: "list"; items: string[] }
  | { t: "kv"; rows: [string, string][] }
  | { t: "table"; head: string[]; rows: string[][] }
  | { t: "code"; text: string; label?: string }
  | { t: "steps"; items: { title?: string; body: string; anchor?: string; refs?: string[] }[] }
  | { t: "convo"; turns: { who: string; text: string; extra?: string[] }[]; notice?: string[] }
  | { t: "mermaid"; code: string }
  | { t: "cards"; items: { title: string; summary: string; path: string; tag?: string }[] }
  | { t: "entries"; items: { anchor: string; title: string; body: string; meta?: string }[] }
  | { t: "note"; text: string }
  | { t: "refs"; label: string; ids: string[] }
  | { t: "links"; label: string; items: { title: string; path: string }[] };

export type KmImageRef = { id: string; alt: string; caption: string };

export type KmPage = {
  path: string; // under the Harness page, e.g. "safety/sandbox"; "" is not used
  title: string;
  summary: string;
  lead?: string;
  group: string; // chapter name for the side menu
  blocks: Block[];
  image?: KmImageRef;
  since?: string;
  updated?: string;
  seeAlsoIds: string[];
  keywords: string[];
};
