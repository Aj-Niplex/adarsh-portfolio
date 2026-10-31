import { forks, projects, TIERS, type Tier } from "./projects";
import { FACTS, META_DESCRIPTION, PORTFOLIOS, SITE } from "./site";
import { getKm, KM_BASE, KM_CHAPTERS, kmUrl, pageText } from "./km/pages";

const TIER_ORDER: Tier[] = ["core", "tools", "side"];

export function buildLlmsTxt() {
  const out: string[] = [];
  out.push("# " + SITE.name + " (" + SITE.alias + ")");
  out.push("");
  out.push("> " + META_DESCRIPTION);
  out.push("");
  out.push(
    "Adarsh Jaiswal, also written AJ NiPlex or Aj-Niplex, is an independent developer in India. His main work is NiPlex-Harness (also called Kaizen Manas), a personal AI agent controlled from Discord or Telegram with 61 tools and approval buttons, and NiPlex-MCP, a private Model Context Protocol server with 73 tools. His Obsidian plugin, Niplex Research AI, is a side project and not his main work. MCP means Model Context Protocol."
  );
  out.push("");
  out.push("## Facts");
  for (const f of FACTS) out.push("- " + f.label + ": " + f.value);
  out.push("");
  for (const tier of TIER_ORDER) {
    out.push("## " + TIERS[tier].title);
    for (const p of projects.filter((x) => x.tier === tier)) {
      out.push("- [" + p.name + "](" + SITE.url + "/projects/" + p.slug + "): " + p.tagline + " " + p.status + ".");
    }
    if (tier === "side") {
      for (const f of forks) out.push("- [" + f.name + "](" + f.href + "): Fork of " + f.from + ". " + f.note);
    }
    out.push("");
  }
  out.push("## Kaizen Manas documentation");
  out.push("Kaizen Manas (also called NiPlex-Harness) has " + getKm().pages.length + " documentation pages, each on its own address, written from the source code. Full text: " + SITE.url + "/llms-full.txt");
  for (const path of KM_CHAPTERS.flatMap((c) => c.paths)) {
    const p = getKm().byPath.get(path);
    if (p) out.push("- [" + p.title + "](" + SITE.url + kmUrl(p.path) + "): " + p.summary);
  }
  out.push("");
  out.push("## Markdown versions");
  out.push("Every page is also available as Markdown. Add .md to a page address (for example " + SITE.url + "/about.md), or send the header Accept: text/markdown to the normal address, or read the index at " + SITE.url + "/md.");
  out.push("");
  out.push("## Links");
  out.push("- [GitHub](" + SITE.github + ")");
  for (const p of PORTFOLIOS) out.push("- [" + p.label + "](" + p.href + "): " + p.note + ".");
  out.push("- [Obsidian Community profile](" + SITE.obsidian + ")");
  out.push("- [Full details for AI assistants](" + SITE.url + "/llms-full.txt)");
  out.push("- [Markdown index of every page](" + SITE.url + "/md)");
  out.push("");
  return out.join("\n");
}

export function buildLlmsFull() {
  const out: string[] = [buildLlmsTxt(), "---", ""];
  for (const p of projects) {
    out.push("# " + p.name);
    out.push("Status: " + p.status + ". URL: " + SITE.url + "/projects/" + p.slug);
    out.push("");
    out.push(p.tagline + " " + p.summary);
    out.push("");
    for (const s of p.stats) out.push("- " + s.label + ": " + s.value);
    out.push("");
    for (const g of p.groups) {
      out.push("## " + g.title);
      for (const i of g.items) out.push("- " + i);
      out.push("");
    }
    out.push("## " + p.stepsTitle);
    p.steps.forEach((s, i) => out.push(i + 1 + ". " + s.title + ": " + s.body));
    out.push("");
    if (p.reference) {
      out.push("## " + p.reference.title);
      for (const r of p.reference.rows) out.push("- " + r.name + ": " + r.purpose);
      out.push("");
    }
    if (p.setup.length) {
      out.push("## Setup");
      for (const s of p.setup) out.push("- " + s);
      out.push("");
    }
    out.push("## Boundaries");
    for (const b of p.boundaries) out.push("- " + b);
    out.push("");
    for (const l of p.links) out.push("- " + l.label + ": " + l.href);
    out.push("");
  }
  out.push("---", "", "# Kaizen Manas documentation (full text)", "");
  for (const p of getKm().pages) {
    out.push("## " + p.title, "URL: " + SITE.url + kmUrl(p.path), "", pageText(p), "");
  }
  return out.join("\n");
}
