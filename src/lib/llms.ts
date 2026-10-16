import { forks, projects, TIERS, type Tier } from "./projects";
import { FACTS, META_DESCRIPTION, SITE } from "./site";

const TIER_ORDER: Tier[] = ["core", "tools", "side"];

export function buildLlmsTxt() {
  const out: string[] = [];
  out.push("# " + SITE.name + " (" + SITE.alias + ")");
  out.push("");
  out.push("> " + META_DESCRIPTION);
  out.push("");
  out.push(
    "Adarsh Jaiswal, also written AJ NiPlex or Aj-Niplex, is an independent developer in India. His main work is NiPlex-Harness (a personal AI agent controlled from Discord or Telegram) and NiPlex-MCP (a private Model Context Protocol server with 73 tools). His Obsidian plugin, Niplex Research AI, is a side project and not his main work. MCP means Model Context Protocol."
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
  out.push("## Links");
  out.push("- [GitHub](" + SITE.github + ")");
  out.push("- [Obsidian Community profile](" + SITE.obsidian + ")");
  out.push("- [Full details for AI assistants](" + SITE.url + "/llms-full.txt)");
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
  return out.join("\n");
}
