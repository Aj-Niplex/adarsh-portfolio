import { FACTS, PORTFOLIOS, SITE } from "./site";
import { forks, projects, TIERS } from "./projects";

// Every URL the assistant may show as a link. Anything else it writes is shown as plain text.

// The assistant answers from these pages and nothing else.
// Each doc is one page of the site, in plain text.

export type Doc = {
  id: string;
  title: string;
  url: string;
  kind: "project" | "about" | "links";
  text: string;
  keywords: string[];
};

function clip(text: string, max: number) {
  return text.length <= max ? text : text.slice(0, max - 1).trimEnd() + "…";
}

export function allowedLinks(): string[] {
  const urls = new Set<string>([
    "/",
    "/about",
    "/projects",
    "/llms.txt",
    SITE.github,
    SITE.profileRepo,
    SITE.portfolioRepo,
    SITE.pagesSite,
    SITE.obsidian,
    SITE.url
  ]);
  for (const p of projects) {
    urls.add("/projects/" + p.slug);
    for (const l of p.links) urls.add(l.href);
  }
  for (const f of forks) urls.add(f.href);
  const out = new Set<string>();
  for (const u of urls) {
    const clean = u.replace(/\/+$/, "") || "/";
    out.add(clean);
    // A page on this site may be written as a path or as a full address; accept both.
    if (clean.startsWith("/") && clean !== "/") out.add(SITE.url.replace(/\/+$/, "") + clean);
  }
  return Array.from(out);
}

let cache: Doc[] | null = null;

export function buildDocs(): Doc[] {
  if (cache) return cache;
  const docs: Doc[] = [];

  for (const p of projects) {
    const lines: string[] = [
      p.name + " (" + TIERS[p.tier].title + ", " + p.visibility + ", " + p.status + ")",
      p.tagline,
      p.summary
    ];
    for (const s of p.stats) lines.push(s.label + ": " + s.value);
    for (const g of p.groups) {
      lines.push(g.title + ":");
      for (const item of g.items) lines.push("- " + item);
    }
    lines.push(p.stepsTitle + ":");
    p.steps.forEach((s, i) => lines.push(i + 1 + ". " + s.title + ": " + s.body));
    if (p.reference) {
      lines.push(p.reference.title + ":");
      for (const r of p.reference.rows) lines.push("- " + r.name + ": " + r.purpose);
    }
    if (p.setup.length) {
      lines.push("Setup:");
      for (const s of p.setup) lines.push("- " + s);
    }
    lines.push("Boundaries:");
    for (const b of p.boundaries) lines.push("- " + b);
    docs.push({
      id: p.slug,
      title: p.name,
      url: "/projects/" + p.slug,
      kind: "project",
      text: clip(lines.join("\n"), 4200),
      keywords: [p.name, p.slug.replace(/-/g, " "), ...p.tags, p.appCategory, p.tier]
    });
  }

  docs.push({
    id: "about",
    title: "About Adarsh Jaiswal",
    url: "/about",
    kind: "about",
    text: [
      SITE.name + ", also known as " + SITE.alias + " (handle " + SITE.handle + ", brand " + SITE.brand + "), is an independent developer in " + SITE.region + " who builds AI agent systems and Model Context Protocol (MCP) servers. Tagline: " + SITE.tagline + ".",
      "Main work: NiPlex-Harness and NiPlex-MCP. The Obsidian plugin Niplex Research AI is a side project, not the main body of work.",
      "Facts:",
      ...FACTS.map((f) => "- " + f.label + ": " + f.value),
      "Side projects and forks: " + forks.map((f) => f.name + " (fork of " + f.from + ")").join(", ") + "."
    ].join("\n"),
    keywords: ["about", "adarsh", "jaiswal", "aj", "niplex", "who", "developer", "india", "brand", "obsidian", "facts"]
  });

  docs.push({
    id: "links",
    title: "Portfolios and links",
    url: "/about#portfolios",
    kind: "links",
    text: [
      "Where to find the work:",
      "- GitHub: " + SITE.github,
      ...PORTFOLIOS.map((p) => "- " + p.label + ": " + p.href + " (" + p.note + ")"),
      "- Obsidian community profile: " + SITE.obsidian,
      "- This site: " + SITE.url + " (plain-text version for AI assistants at " + SITE.url + "/llms.txt)"
    ].join("\n"),
    keywords: ["links", "github", "portfolio", "profile", "repo", "repository", "source", "contact", "find", "website"]
  });

  cache = docs;
  return docs;
}

const STOP = new Set(
  "a an and are as at be but by can could do does for from had has have how i if in into is it its me my of on or our so than that the their them then there these they this to us was we were what when where which who why will with would you your about tell explain please give show can does work works".split(" ")
);

function tokens(s: string): string[] {
  return (s.toLowerCase().match(/[a-z0-9][a-z0-9+#.-]*/g) || [])
    .map((w) => w.replace(/[.-]+$/, ""))
    .map((w) => (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w))
    .filter((w) => w.length > 1 && !STOP.has(w));
}

/** True when the question names a project or a topic the docs are about, not just a common word. */
export function mentionsProject(question: string): boolean {
  const q = new Set(tokens(question));
  if (q.size === 0) return false;
  for (const doc of buildDocs()) {
    const known = new Set([...tokens(doc.title), ...doc.keywords.flatMap((k) => tokens(k))]);
    for (const t of q) if (known.has(t)) return true;
  }
  return false;
}

export type Retrieval = { docs: Doc[]; terms: string[]; fallback: boolean; total: number };

export function retrieve(question: string, previous = "", limit = 3): Retrieval {
  const docs = buildDocs();
  const q = tokens(question);
  const prev = tokens(previous).filter((t) => !q.includes(t));
  const weighted = new Map<string, number>();
  for (const t of q) weighted.set(t, 1);
  for (const t of prev) weighted.set(t, 0.35);

  const scored = docs.map((doc) => {
    const title = tokens(doc.title).join(" ");
    const keys = doc.keywords.flatMap((k) => tokens(k)).join(" ");
    const body = tokens(doc.text);
    const counts = new Map<string, number>();
    for (const t of body) counts.set(t, (counts.get(t) || 0) + 1);
    let score = 0;
    const hit: string[] = [];
    for (const [term, w] of weighted) {
      let s = 0;
      if (title.includes(term)) s += 8;
      if (keys.includes(term)) s += 3;
      s += Math.min(counts.get(term) || 0, 5);
      if (s > 0) {
        score += s * w;
        if (w === 1) hit.push(term);
      }
    }
    return { doc, score, hit };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored.filter((s) => s.score > 0).slice(0, limit);
  if (best.length === 0) {
    const pick = ["about", "niplex-harness", "niplex-mcp"].map((id) => docs.find((d) => d.id === id)!).slice(0, limit);
    return { docs: pick, terms: [], fallback: true, total: docs.length };
  }
  const terms = Array.from(new Set(best.flatMap((b) => b.hit))).slice(0, 5);
  return { docs: best.map((b) => b.doc), terms, fallback: false, total: docs.length };
}
