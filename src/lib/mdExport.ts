// Markdown versions of the site's pages, for AI assistants and anyone who wants plain text.
//
// Every page has one: add ".md" to its address, send "Accept: text/markdown", or read it under /md.
// The pages are built from the same data as the HTML ones, so the two always agree.

import { forks, projects, TIERS, type Project, type Tier } from "./projects";
import { FACTS, META_DESCRIPTION, PORTFOLIOS, SITE } from "./site";
import { getKm, KM_CHAPTERS, kmUrl } from "./km/pages";
import { mdUrl } from "./mdPath";
import { PRIVACY, PRIVACY_LEAD, PRIVACY_UPDATED } from "./privacy";
import type { Block, KmPage } from "./km/types";

const TIER_ORDER: Tier[] = ["core", "tools", "side"];
const abs = (path: string) => SITE.url + path;

export { mdUrl };

// ---------------------------------------------------------------- small helpers

/** A code block whose fence is longer than any run of backticks inside it. */
function fence(text: string, lang = "") {
  const runs = (text.match(/`+/g) || []).map((m) => m.length);
  const ticks = "`".repeat(Math.max(2, ...runs) + 1);
  return ticks + lang + "\n" + text.replace(/\n+$/, "") + "\n" + ticks;
}

function cell(value: string) {
  const at = value.indexOf("|/");
  const text = at >= 0 ? value.slice(0, at) : value;
  const link = at >= 0 ? value.slice(at + 1) : "";
  const safe = text.replace(/\|/g, "\\|").replace(/\n/g, "<br>");
  return link ? "[" + safe + "](" + abs(mdUrl(link)) + ")" : safe;
}

/** Links that point at this site become full addresses, so a page still makes sense on its own. */
function absolute(text: string) {
  return text.replace(/\]\((\/[^)\s]*)\)/g, (_m, path: string) => "](" + abs(path) + ")");
}

const kmMd = (path: string) => abs(mdUrl(kmUrl(path)));

function blockMd(b: Block): string {
  switch (b.t) {
    case "md":
      return absolute(b.text.trim());
    case "h":
      return "## " + b.text;
    case "p":
      return absolute(b.text);
    case "note":
      return b.text
        .split("\n")
        .map((l) => "> " + l)
        .join("\n");
    case "list":
      return b.items.map((i) => "- " + i.replace(/\n/g, " ")).join("\n");
    case "kv":
      return b.rows.map(([k, v]) => "- **" + k + "**: " + v.replace(/\n/g, " ")).join("\n");
    case "table": {
      const head = "| " + b.head.map((c) => c.replace(/\|/g, "\\|")).join(" | ") + " |";
      const rule = "| " + b.head.map(() => "---").join(" | ") + " |";
      return [head, rule, ...b.rows.map((r) => "| " + r.map(cell).join(" | ") + " |")].join("\n");
    }
    case "code":
      return (b.label ? "**" + b.label + "**\n\n" : "") + fence(b.text);
    case "steps":
      return b.items
        .map((s, n) => {
          const refs = (s.refs || [])
            .map((r) => {
              const at = r.indexOf("|");
              return at < 0 ? r : "[" + r.slice(0, at) + "](" + kmMd(r.slice(at + 1)) + ")";
            })
            .join(", ");
          return n + 1 + ". " + (s.title ? "**" + s.title + "**: " : "") + s.body.replace(/\n/g, " ") + (refs ? " (see " + refs + ")" : "");
        })
        .join("\n");
    case "convo": {
      const lines: string[] = [];
      for (const t of b.turns) {
        lines.push("**" + t.who + "**: " + t.text.replace(/\n/g, "\n> "));
        for (const e of t.extra || []) lines.push("> " + e.replace(/\n/g, "\n> "));
        lines.push("");
      }
      for (const n of b.notice || []) lines.push("> " + n);
      return lines.join("\n").trim();
    }
    case "mermaid":
      return fence(b.code, "mermaid");
    case "cards":
      return b.items.map((c) => "- [" + c.title + "](" + kmMd(c.path) + "): " + c.summary.replace(/\n/g, " ")).join("\n");
    case "entries":
      return b.items
        .map((e) => "### " + e.title + "\n\n" + e.body + (e.meta ? "\n\n" + e.meta.split("\n").map((m) => "- " + m).join("\n") : ""))
        .join("\n\n");
    case "links":
      return "**" + b.label + ":** " + b.items.map((l) => "[" + l.title + "](" + kmMd(l.path) + ")").join(", ");
    default:
      return "";
  }
}

// ---------------------------------------------------------------- pages

/** One Kaizen Manas documentation page. */
export function kmPageMarkdown(p: KmPage): string {
  const out: string[] = ["# " + p.title, ""];
  out.push("> Page: " + abs(kmUrl(p.path)) + " · Kaizen Manas (also called NiPlex-Harness) documentation · " + p.group);
  out.push("");
  if (p.lead || p.summary) out.push(p.lead || p.summary, "");
  if (p.image) out.push("*Picture: " + p.image.alt + (p.image.caption ? " — " + p.image.caption : "") + "*", "");
  for (const b of p.blocks) {
    const text = blockMd(b);
    if (text) out.push(text, "");
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

/** A project page. The Harness page also lists the documentation chapters. */
export function projectMarkdown(p: Project): string {
  const out: string[] = ["# " + p.name, ""];
  out.push("> " + p.tagline);
  out.push("");
  out.push("Page: " + abs("/projects/" + p.slug) + " · " + TIERS[p.tier].title + " · " + p.visibility + " · " + p.status, "");
  out.push(p.summary, "");
  if (p.stats.length) {
    out.push("## At a glance", "");
    for (const s of p.stats) out.push("- **" + s.label + "**: " + s.value);
    out.push("");
  }
  for (const g of p.groups) {
    out.push("## " + g.title, "");
    for (const i of g.items) out.push("- " + i);
    out.push("");
  }
  out.push("## " + p.stepsTitle, "");
  p.steps.forEach((s, i) => out.push(i + 1 + ". **" + s.title + "**: " + s.body));
  out.push("");
  if (p.reference) {
    out.push("## " + p.reference.title, "", "| Name | Purpose |", "| --- | --- |");
    for (const r of p.reference.rows) out.push("| " + r.name.replace(/\|/g, "\\|") + " | " + r.purpose.replace(/\|/g, "\\|") + " |");
    out.push("");
  }
  if (p.setup.length) {
    out.push("## Setup", "");
    for (const s of p.setup) out.push("- " + s);
    out.push("");
  }
  out.push("## Boundaries", "");
  for (const b of p.boundaries) out.push("- " + b);
  out.push("");
  if (p.slug === "niplex-harness") {
    out.push("## Documentation", "");
    out.push("Kaizen Manas has " + getKm().pages.length + " documentation pages, each also available as Markdown:", "");
    out.push(...kmListing("###"));
  }
  if (p.links.length) {
    out.push("## Links", "");
    for (const l of p.links) out.push("- [" + l.label + "](" + l.href + ")");
    out.push("");
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

export function projectsMarkdown(): string {
  const out: string[] = ["# Projects", "", "> Page: " + abs("/projects"), ""];
  for (const tier of TIER_ORDER) {
    out.push("## " + TIERS[tier].title, "", TIERS[tier].blurb, "");
    for (const p of projects.filter((x) => x.tier === tier)) {
      out.push("- [" + p.name + "](" + abs(mdUrl("/projects/" + p.slug)) + "): " + p.tagline + " " + p.status + ".");
    }
    if (tier === "side") for (const f of forks) out.push("- [" + f.name + "](" + f.href + "): Fork of " + f.from + ". " + f.note);
    out.push("");
  }
  return out.join("\n").trim() + "\n";
}

export function aboutMarkdown(): string {
  const out: string[] = ["# About " + SITE.name, "", "> Page: " + abs("/about"), ""];
  out.push(
    SITE.name + ", also known as " + SITE.alias + " (handle " + SITE.handle + ", brand " + SITE.brand + "), is an independent developer in " + SITE.region + " who builds AI agent systems and Model Context Protocol (MCP) servers. " + SITE.tagline + ".",
    ""
  );
  out.push("## Facts", "");
  for (const f of FACTS) out.push("- **" + f.label + "**: " + f.value);
  out.push("", "## Where to find the work", "", "- [GitHub](" + SITE.github + ")");
  for (const p of PORTFOLIOS) out.push("- [" + p.label + "](" + p.href + "): " + p.note);
  out.push("- [Obsidian Community profile](" + SITE.obsidian + ")", "");
  out.push("## Side projects and forks", "");
  for (const f of forks) out.push("- [" + f.name + "](" + f.href + "): Fork of " + f.from + ". " + f.note);
  out.push("");
  return out.join("\n").trim() + "\n";
}

/** The first page: the overview, then how to get the Markdown versions. */
export function homeMarkdown(): string {
  const out: string[] = ["# " + SITE.name + " (" + SITE.alias + ")", "", "> " + META_DESCRIPTION, "", "Page: " + abs("/"), ""];
  out.push(
    "Adarsh Jaiswal, also written AJ NiPlex or Aj-Niplex, is an independent developer in India. His main work is NiPlex-Harness (also called Kaizen Manas), a personal AI agent controlled from Discord or Telegram with approval buttons, and NiPlex-MCP, a private Model Context Protocol server. His Obsidian plugin, Niplex Research AI, is a side project and not his main work.",
    ""
  );
  out.push("## Facts", "");
  for (const f of FACTS) out.push("- **" + f.label + "**: " + f.value);
  out.push("");
  for (const tier of TIER_ORDER) {
    out.push("## " + TIERS[tier].title, "");
    for (const p of projects.filter((x) => x.tier === tier)) {
      out.push("- [" + p.name + "](" + abs(mdUrl("/projects/" + p.slug)) + "): " + p.tagline + " " + p.status + ".");
    }
    out.push("");
  }
  out.push("## More", "", "- [Index of every page in Markdown](" + abs("/md") + ")", "- [About](" + abs("/md/about") + ")", "- [All text in one file](" + abs("/llms-full.txt") + ")", "");
  return out.join("\n").trim() + "\n";
}

/** Every documentation page, grouped by chapter, with the pages no chapter lists at the end. */
function kmListing(level: string): string[] {
  const out: string[] = [];
  const km = getKm();
  const listed = new Set<string>();
  for (const c of KM_CHAPTERS) {
    const pages = c.paths.map((path) => km.byPath.get(path)).filter((x): x is KmPage => Boolean(x));
    if (!pages.length) continue;
    out.push(level + " " + c.title, "");
    for (const page of pages) {
      listed.add(page.path);
      out.push("- [" + page.title + "](" + kmMd(page.path) + "): " + page.summary);
    }
    out.push("");
  }
  const rest = km.pages.filter((p) => !listed.has(p.path));
  if (rest.length) {
    out.push(level + " More pages", "");
    for (const page of rest) out.push("- [" + page.title + "](" + kmMd(page.path) + "): " + page.summary);
    out.push("");
  }
  return out;
}

/** The table of contents: every Markdown page, and how to ask for them. */
export function indexMarkdown(): string {
  const out: string[] = ["# " + SITE.name + ": Markdown index", ""];
  out.push("> Every page of " + SITE.url + " is also available as Markdown, for AI assistants and for reading as plain text.", "");
  out.push("## How to get a page as Markdown", "");
  out.push("- Add `.md` to the page address, for example `" + abs("/about.md") + "`.");
  out.push("- Or read it under `/md`, for example `" + abs("/md/about") + "`.");
  out.push("- Or ask for the normal address with the header `Accept: text/markdown`.");
  out.push("- All of it as one plain-text file: " + abs("/llms-full.txt") + ". A short summary: " + abs("/llms.txt") + ".", "");
  out.push("## Pages", "");
  out.push(
    "- [Home](" + abs("/md/home") + ")",
    "- [About](" + abs("/md/about") + ")",
    "- [Projects](" + abs("/md/projects") + ")",
    "- [Sign up, newsletter, submissions and Markdown](" + abs("/md/signup") + ")",
    "- [Privacy Policy](" + abs("/md/privacy") + ")",
    "- [Every page in one file](" + abs("/md/full") + "): the pages below, one after another, each marked with a comment line.",
    ""
  );
  out.push("## Projects", "");
  for (const p of projects) out.push("- [" + p.name + "](" + abs(mdUrl("/projects/" + p.slug)) + "): " + p.tagline);
  out.push("");
  out.push("## Kaizen Manas documentation (" + getKm().pages.length + " pages)", "");
  out.push(...kmListing("###"));
  return out.join("\n").trim() + "\n";
}

/** The Privacy Policy, from the same text as the page. */
export function privacyMarkdown(): string {
  const out: string[] = ["# Privacy Policy", "", "> Page: " + abs("/privacy"), "", "Last updated " + PRIVACY_UPDATED + ".", "", PRIVACY_LEAD, ""];
  for (const section of PRIVACY) {
    out.push("## " + section.title, "");
    for (const block of section.blocks) {
      out.push(block.t === "p" ? absolute(block.text) : block.items.map((i) => "- " + absolute(i)).join("\n"), "");
    }
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

// ---------------------------------------------------------------- lookup for the route

// ---------------------------------------------------------------- the pages about the site itself

/** Sign-up, newsletter, unsubscribe, submissions and the Markdown versions. */
export function siteMarkdown(): string {
  const out: string[] = ["# Sign up, newsletter, unsubscribe, submissions and Markdown", "", "> Page: " + abs("/signup"), ""];
  out.push("## Sign up", "");
  out.push(
    "Sign up is at " + abs("/signup") + ". The visitor enters an email, ticks the box to agree to product and promotional emails, types the 6-digit code that is emailed, then picks a password. Signed-in visitors can ask the assistant 5 questions a minute instead of 2. If the page says the email service is not connected yet, leaving the email there still adds it to the list.",
    ""
  );
  out.push("## Newsletter", "");
  out.push(
    "The newsletter is at " + abs("/newsletter") + ", and there is a box at the bottom of every page. No account is needed. It is the same product updates and promotions list. A new address is confirmed with a 6-digit code once the email service is on.",
    ""
  );
  out.push("## Unsubscribe", "");
  out.push(
    "Anyone can type their address at " + abs("/unsubscribe") + " to be taken off the list at once, without an account or a code. It only stops the emails; an account, if there is one, stays.",
    ""
  );
  out.push("## Submit an idea or feedback", "");
  out.push(
    "Submissions are at " + abs("/submit") + ". Anyone can send an idea, a request or feedback with a title (up to 80 characters) and a description (up to 500). Links, email addresses and phone numbers are not accepted. The latest submissions are shown publicly on that page with their descriptions.",
    ""
  );
  out.push("## Markdown versions", "");
  out.push(
    "Every page of this site is also available as Markdown. Add `.md` to a page address (for example " + abs("/about.md") + "), or send the header `Accept: text/markdown` to the normal address, or open the index at " + abs("/md") + ". All the text in one file is at " + abs("/llms-full.txt") + ".",
    ""
  );
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

// ---------------------------------------------------------------- lookup for the route

export type MdPage = {
  /** Path under /md, without a leading slash ("" is the index). */
  path: string;
  /** The HTML page this one is a copy of. */
  canonical: string;
  body: () => string;
  title: string;
  kind: "project" | "about" | "links" | "docs";
  keywords: string[];
  /** Whether the page is part of /md/full. */
  full: boolean;
};

/** One page after another, each opened by a comment line the assistant service uses to split them. */
export function fullMarkdown(): string {
  const out: string[] = [
    "<!-- All pages of " + SITE.url + " in one Markdown file. Each page starts with a `page` comment line and ends with a `/page` comment line. -->",
    ""
  ];
  for (const page of mdPages().filter((p) => p.full)) {
    const meta = JSON.stringify({ id: page.path, title: page.title, url: page.canonical, kind: page.kind, keywords: page.keywords }).replace(/>/g, "\\u003e");
    out.push("<!--page " + meta + "-->", page.body().trim(), "<!--/page-->", "");
  }
  return out.join("\n");
}

/** Every Markdown page: its path under /md and a function that writes it. */
export function mdPages(): MdPage[] {
  const list: MdPage[] = [
    { path: "", canonical: "/md", body: indexMarkdown, title: "Markdown index", kind: "links", keywords: [], full: false },
    { path: "home", canonical: "/", body: homeMarkdown, title: "Home", kind: "about", keywords: ["home", "start", "welcome", "overview"], full: true },
    {
      path: "about",
      canonical: "/about",
      body: aboutMarkdown,
      title: "About " + SITE.name,
      kind: "about",
      keywords: ["about", "adarsh", "jaiswal", "aj", "niplex", "who", "developer", "india", "brand", "obsidian", "facts", "links", "github", "portfolio", "profile", "repo", "repository", "source", "contact", "find", "website"],
      full: true
    },
    {
      path: "projects",
      canonical: "/projects",
      body: projectsMarkdown,
      title: "Projects",
      kind: "about",
      keywords: ["projects", "work", "list", "overview", "everything", "all", "forks", "side projects"],
      full: true
    },
    {
      path: "signup",
      canonical: "/signup",
      body: siteMarkdown,
      title: "Sign up, newsletter, unsubscribe, submissions and Markdown",
      kind: "links",
      keywords: ["signup", "sign up", "newsletter", "subscribe", "unsubscribe", "opt out", "stop emails", "submit", "submission", "register", "promotion", "markdown", "md", "plain text", "raw", "llms"],
      full: true
    },
    // The newsletter, unsubscribe and submit pages are described on the same Markdown page, so each
    // address that follows the ".md" convention resolves to it.
    ...["newsletter", "unsubscribe", "submit"].map(
      (slug): MdPage => ({
        path: slug,
        canonical: "/" + slug,
        body: siteMarkdown,
        title: "Sign up, newsletter, unsubscribe, submissions and Markdown",
        kind: "links",
        keywords: [],
        full: false
      })
    ),
    {
      path: "privacy",
      canonical: "/privacy",
      body: privacyMarkdown,
      title: "Privacy Policy",
      kind: "links",
      keywords: ["privacy", "policy", "data", "cookie", "cookies", "log", "logged", "logging", "store", "stored", "kept", "delete", "remove", "gdpr", "personal", "ip", "location", "country", "consent", "agree", "questions", "retention", "tracking", "analytics"],
      full: true
    },
    { path: "full", canonical: "/md/full", body: fullMarkdown, title: "Every page in one file", kind: "links", keywords: [], full: false }
  ];
  for (const p of projects) {
    list.push({
      path: "projects/" + p.slug,
      canonical: "/projects/" + p.slug,
      body: () => projectMarkdown(p),
      title: p.name,
      kind: "project",
      keywords: [p.name, p.slug.replace(/-/g, " "), ...p.tags, p.appCategory, p.tier],
      full: true
    });
  }
  for (const page of getKm().pages) {
    list.push({
      path: kmUrl(page.path).slice(1),
      canonical: kmUrl(page.path),
      body: () => kmPageMarkdown(page),
      title: page.title + " (Kaizen Manas)",
      kind: "docs",
      keywords: [page.title, ...page.keywords, "kaizen manas", "manas", "niplex harness"],
      full: true
    });
  }
  return list;
}
