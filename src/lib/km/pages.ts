import { readJson, readMd, readText, kmMeta } from "./content";
import type { Block, KmImageRef, KmPage } from "./types";

// The Kaizen Manas documentation. Every page is built from the data files in content/km, which were
// read from the source repository at one commit. Nothing here is written from memory.

export const KM_BASE = "/projects/niplex-harness";

type Item = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/^\//, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const yn = (v: unknown) => (v === true ? "Yes" : v === false ? "No" : v == null ? "" : String(v));
const str = (v: unknown) => (v == null ? "" : Array.isArray(v) ? v.join(", ") : String(v));
const rows = (r: [string, unknown][]): [string, string][] =>
  r.map(([k, v]) => [k, typeof v === "boolean" ? yn(v) : str(v)] as [string, string]).filter(([, v]) => v !== "");

/* ---- Chapters shown in the side menu ---- */
export const KM_CHAPTERS: { title: string; paths: string[] }[] = [
  { title: "Start here", paths: ["about"] },
  { title: "How it works", paths: ["architecture"] },
  { title: "Tools", paths: ["tools"] },
  { title: "Safety", paths: ["safety"] },
  { title: "Memory and skills", paths: ["memory", "skills"] },
  { title: "Models", paths: ["providers", "routing"] },
  { title: "Chat", paths: ["chat", "commands"] },
  { title: "Code and jobs", paths: ["terminal", "automation"] },
  { title: "Run it yourself", paths: ["deploy", "troubleshooting", "quality"] },
  { title: "Project", paths: ["changelog", "roadmap", "decisions", "compare", "use-cases", "examples", "faq", "glossary"] }
];

const chapterOf = (top: string) => KM_CHAPTERS.find((c) => c.paths.includes(top))?.title || "Project";

/* ---- Pictures, each tied to the one page whose content it shows ---- */
const IMAGES: Record<string, KmImageRef> = {
  "about/name-and-history": { id: "manas-sheet", alt: "Manas the felt axolotl from the front, the side and the back, with three face expressions", caption: "Manas, from every side" },
  safety: { id: "safety-approval-gate", alt: "Manas pausing at a small gate with a button, waiting for a person to approve", caption: "Risky things wait for a button" },
  "safety/approval-gate": { id: "safety-approval-gate", alt: "Manas pausing at a small gate with a button, waiting for a person to approve", caption: "Risky things wait for a button" },
  "safety/sandbox": { id: "safety-sandbox", alt: "Manas looking at a small laptop kept safely inside a glass jar", caption: "Code runs inside a limited box" },
  "safety/secret-vault": { id: "safety-secret-vault", alt: "Manas holding a small key next to a round vault door", caption: "Secrets stay in the vault" },
  "safety/content-screening": { id: "safety-content-screening", alt: "Manas inspecting papers with a magnifying glass", caption: "Pages and skills are checked first" },
  "safety/allow-list": { id: "safety-allow-list", alt: "Manas as a doorkeeper with a clipboard, letting approved visitors in", caption: "Only listed people get in" },
  "safety/file-protection": { id: "safety-file-protection", alt: "Manas beside a filing cabinet with a padlock", caption: "Some files cannot be changed by the agent" },
  memory: { id: "memory-notes", alt: "Manas with a small notebook and a drawer of index cards", caption: "Notes it can save and find again" },
  "memory/vault": { id: "tools-files-vault", alt: "Manas filing folders on a shelf", caption: "Notes live as plain files" },
  "tools/files": { id: "tools-files-vault", alt: "Manas filing folders on a shelf", caption: "Files and the vault" },
  "tools/web": { id: "tools-web", alt: "Manas holding a thread connected to a small globe", caption: "Search and read the web" },
  providers: { id: "providers-switchboard", alt: "Manas plugging a cable into a switchboard with several coloured connections", caption: "One agent, several providers" },
  routing: { id: "providers-switchboard", alt: "Manas plugging a cable into a switchboard with several coloured connections", caption: "Picking a model for each message" },
  commands: { id: "commands-buttons", alt: "Manas pressing one of eight small buttons on a control desk", caption: "Slash commands" },
  "chat/discord": { id: "chat-platforms", alt: "Manas holding two speech bubbles with the Discord and Telegram marks", caption: "Discord and Telegram" },
  "chat/telegram": { id: "chat-platforms", alt: "Manas holding two speech bubbles with the Discord and Telegram marks", caption: "Discord and Telegram" },
  "chat/progress-updates": { id: "chat-progress", alt: "Manas on the third of five stepping stones", caption: "Progress, one step at a time" },
  terminal: { id: "terminal-desk", alt: "Manas working at a small laptop in a terminal", caption: "The terminal and shell" },
  "terminal/code-execution": { id: "safety-sandbox", alt: "Manas looking at a small laptop kept safely inside a glass jar", caption: "Run code inside the sandbox" },
  automation: { id: "automation-clock", alt: "Manas next to a large pocket watch with small gears", caption: "Jobs that run on a timer" },
  "automation/github-tools": { id: "integrations-platforms", alt: "Manas connecting small tiles for outside services", caption: "Outside services" },
  deploy: { id: "deploy-hilltop", alt: "Manas carrying a crate up a hill to a small cabin with a lit window", caption: "Getting it running" },
  "deploy/auto-deploy": { id: "runtime-self-repair", alt: "Manas with a wrench helping a sleepy lamp wake up", caption: "Restarts and rolls back by itself" },
  troubleshooting: { id: "troubleshooting", alt: "Manas using a flashlight and screwdriver to fix a small cog", caption: "When something does not work" },
  quality: { id: "quality-checks", alt: "Manas checking a row of gears that each have a tick", caption: "Tests and checks" },
  roadmap: { id: "roadmap-telescope", alt: "Manas looking through a telescope at a winding path ahead", caption: "What is planned" },
  faq: { id: "faq", alt: "Manas thinking about a few questions", caption: "Common questions" },
  glossary: { id: "glossary-jars", alt: "Manas picking a small labelled jar from a shelf", caption: "Terms, one at a time" },
  compare: { id: "compare-scales", alt: "Manas behind a balanced scale", caption: "How it compares" }
};

const USE_CASE_IMAGES: Record<string, KmImageRef> = {
  "usecase.03": { id: "use-notes", alt: "Manas tending a small shelf of notebooks with a plant", caption: "Notes" },
  "usecase.04": { id: "use-researcher", alt: "Manas with a magnifier and many notes pinned to a corkboard", caption: "Looking things up" },
  "usecase.05": { id: "use-student", alt: "Manas at a small desk with flashcards and a desk lamp", caption: "Reading and learning" },
  "usecase.06": { id: "use-home-lab", alt: "Manas beside a small cabinet with blinking lights", caption: "Looking after the host" },
  "usecase.07": { id: "use-developer", alt: "Manas next to a laptop and a small branching diagram", caption: "Working on code" },
  "usecase.08": { id: "use-team", alt: "Manas at a small round table with three plain round friends", caption: "Handing work over" }
};

/* ---- Registry ---- */
export type KmBuilt = {
  pages: KmPage[];
  byPath: Map<string, KmPage>;
  idPath: Map<string, string>; // item id -> path (with #anchor when it lives inside a page)
  children: Map<string, KmPage[]>;
};

let built: KmBuilt | null = null;

export function getKm(): KmBuilt {
  if (built) return built;
  const pages: KmPage[] = [];
  const idPath = new Map<string, string>();

  const top = (p: string) => p.split("/")[0];
  function add(p: Omit<KmPage, "group" | "seeAlsoIds" | "keywords" | "blocks"> & Partial<Pick<KmPage, "seeAlsoIds" | "keywords" | "blocks">>, id?: string) {
    const page: KmPage = {
      group: chapterOf(top(p.path)),
      blocks: [],
      seeAlsoIds: [],
      keywords: [],
      ...p
    };
    page.image = p.image || IMAGES[p.path];
    pages.push(page);
    if (id) idPath.set(id, p.path);
    return page;
  }
  const anchorId = (id: string) => id.replace(/[^a-z0-9_-]+/gi, "-");
  const reg = (id: string, path: string, withAnchor = true) => idPath.set(id, withAnchor ? path + "#" + anchorId(id) : path);

  function mdPage(file: string, path: string, extra?: { title?: string; blocks?: Block[]; image?: KmImageRef }) {
    const { meta, body } = readMd(file);
    return add(
      {
        path,
        title: extra?.title || String(meta.title),
        summary: String(meta.summary || ""),
        lead: meta.answer_first ? String(meta.answer_first) : undefined,
        since: meta.since ? String(meta.since) : undefined,
        updated: meta.updated ? String(meta.updated) : undefined,
        seeAlsoIds: (meta.see_also as string[]) || [],
        keywords: (meta.search_terms as string[]) || [],
        blocks: [{ t: "md", text: body }, ...(extra?.blocks || [])],
        image: extra?.image
      },
      String(meta.id)
    );
  }

  /* 01 About */
  mdPage("01-overview/overview.md", "about", { title: "About Kaizen Manas" });
  mdPage("01-overview/positioning.md", "about/positioning");
  mdPage("01-overview/audience.md", "about/audience");
  mdPage("01-overview/name-and-history.md", "about/name-and-history");
  {
    const items = readJson<Item[]>("01-overview/principles.json");
    items.forEach((x) => reg(x.id, "about/principles"));
    add({
      path: "about/principles",
      title: "Design principles",
      summary: "The ten rules the design follows, and why.",
      lead: "Kaizen Manas follows ten design principles. Each one says what the rule is and why it exists.",
      blocks: [{ t: "entries", items: items.map((x) => ({ anchor: anchorId(x.id), title: x.title, body: x.summary + (x.why ? " Why: " + x.why : "") })) }],
      keywords: ["principles", "design", "why"]
    });
  }

  /* 02 Architecture */
  {
    const page = mdPage("02-architecture/architecture.md", "architecture", { title: "Architecture" });
    page.blocks.push({ t: "h", text: "How a message moves" }, { t: "mermaid", code: readText("02-architecture/data-flow.mmd") });
  }
  mdPage("02-architecture/concurrency.md", "architecture/concurrency");
  mdPage("02-architecture/state-and-storage.md", "architecture/storage");
  {
    const steps = readJson<Item[]>("02-architecture/message-lifecycle.json").sort((a, b) => a.order - b.order);
    steps.forEach((s) => reg(s.id, "architecture/message-lifecycle"));
    add({
      path: "architecture/message-lifecycle",
      title: "Life of a message",
      summary: "The " + steps.length + " steps from a chat message arriving to the reply going out.",
      lead: "A message passes through " + steps.length + " steps: it is received, checked against the allow-list, queued in order, sent to a model, run through tool rounds with approval where needed, screened and answered.",
      blocks: [
        {
          t: "steps",
          items: steps.map((s) => ({
            title: s.title,
            anchor: anchorId(s.id),
            body: s.body + (s.can_fail_how ? " It can fail when: " + s.can_fail_how : ""),
            refs: s.touches || []
          }))
        }
      ],
      keywords: ["lifecycle", "message", "steps", "flow"]
    });
  }
  {
    const comps = readJson<Item[]>("02-architecture/components.json");
    comps.forEach((c) => reg(c.id, "architecture/components/" + slug(c.id.replace("component.", "")), false));
    add({
      path: "architecture/components",
      title: "Components",
      summary: comps.length + " modules and what each one does.",
      lead: "Kaizen Manas is one Python process made of " + comps.length + " modules. Each page says what a module takes in, what it gives out and what it depends on.",
      keywords: ["components", "modules", "parts"]
    });
    for (const c of comps) {
      add({
        path: "architecture/components/" + slug(c.id.replace("component.", "")),
        title: c.title,
        summary: c.summary,
        lead: c.summary,
        since: c.since,
        seeAlsoIds: c.see_also || [],
        keywords: c.search_terms || [],
        blocks: [
          { t: "kv", rows: rows([["Takes in", c.inputs], ["Gives out", c.outputs], ["Owns this state", c.owns_state]]) },
          { t: "refs", label: "Depends on", ids: c.depends_on || [] }
        ]
      });
    }
  }
  {
    const cfg = readJson<Item[]>("02-architecture/config-reference.json");
    cfg.forEach((c) => reg(c.id, "architecture/settings/" + slug(c.name), false));
    add({
      path: "architecture/settings",
      title: "Settings reference",
      summary: cfg.length + " settings: where each one lives, its default and what a wrong value does.",
      lead: "Kaizen Manas reads " + cfg.length + " settings, mostly from a .env file. Each page gives the default, the allowed values, when to change it and what happens if the value is wrong.",
      keywords: ["settings", "config", "env", "configuration"]
    });
    for (const c of cfg) {
      add({
        path: "architecture/settings/" + slug(c.name),
        title: c.name,
        summary: c.summary || c.meaning,
        lead: c.meaning,
        since: c.since,
        seeAlsoIds: c.see_also || [],
        keywords: [c.name, ...(c.search_terms || [])],
        blocks: [
          {
            t: "kv",
            rows: rows([
              ["Where", c.where],
              ["Type", c.type],
              ["Default", c.default],
              ["Allowed values", c.allowed],
              ["Only the owner can set it", c.owner_only],
              ["When to change it", c.when_to_change],
              ["Safe example", c.safe_example],
              ["If the value is wrong", c.effect_of_wrong_value]
            ])
          }
        ]
      });
    }
  }

  /* 03 Tools */
  {
    const groups = readJson<Item[]>("03-tools/groups.json");
    const page = mdPage("03-tools/tool-groups.md", "tools", { title: "Tools" });
    page.blocks.push({
      t: "note",
      text: "Every tool has its own page with its parameters, an example, its risk and how it can fail. The full list is on the all-tools page."
    });
    const csv = readText("03-tools/tool-index.csv").trim().split("\n").slice(1).map((l) => l.split(","));
    const toolFiles = [...groups.map((g) => g.id.replace("group.", "")), "always-on"];
    const allRows: string[][] = [];
    for (const g of toolFiles) {
      const gid = g;
      const group = groups.find((x) => x.id === "group." + gid);
      const tools = readJson<Item[]>("03-tools/tools/" + gid + ".json");
      if (group) {
        reg(group.id, "tools/" + gid, false);
        add({
          path: "tools/" + gid,
          title: group.title + " tools",
          summary: group.summary,
          lead: group.summary,
          since: group.since,
          seeAlsoIds: group.see_also || [],
          keywords: [group.title, ...(group.search_terms || [])],
          blocks: [
            {
              t: "kv",
              rows: rows([
                ["On or off by default", group.default_state],
                ["Who can switch it", group.who_can_switch],
                ["Why it is a group", group.why_it_is_a_group],
                ["Number of tools", tools.length]
              ])
            },
            { t: "h", text: "Typical uses" },
            { t: "list", items: group.typical_uses || [] },
            { t: "h", text: "Risks" },
            { t: "p", text: group.risks || "" }
          ]
        });
      } else {
        add({
          path: "tools/always-on",
          title: "Always-on tools",
          summary: "Five tools that belong to no group and cannot be switched off.",
          lead: "Five tools are always on. They sit outside the 13 groups, so the agent always has them.",
          keywords: ["always on", "core tools"]
        });
      }
      for (const t of tools) {
        const tp = "tools/" + gid + "/" + slug(t.name);
        reg(t.id, tp, false);
        const params = (t.parameters || []) as Item[];
        const fails = (t.failure_modes || []) as Item[];
        const blocks: Block[] = [
          { t: "p", text: t.description },
          {
            t: "kv",
            rows: rows([
              ["Tool name", t.name],
              ["Group", group ? group.title : "Always on"],
              ["Risk", t.risk],
              ["Needs approval", t.needs_approval],
              ["Approval rule", t.approval_rule],
              ["Allowed in scheduled jobs", t.allowed_in_scheduled_jobs],
              ["Default", t.default_state]
            ])
          }
        ];
        if (params.length) {
          blocks.push({ t: "h", text: "Parameters" });
          blocks.push({
            t: "table",
            head: ["Name", "Type", "Required", "Default", "Meaning", "Limits"],
            rows: params.map((p) => [p.name, str(p.type), yn(p.required), str(p.default), str(p.meaning), str(p.limits)])
          });
        }
        if (t.returns) blocks.push({ t: "h", text: "Returns" }, { t: "p", text: t.returns });
        if (t.example) {
          blocks.push({ t: "h", text: "Example (made up for this page)" });
          blocks.push({ t: "code", label: "Call", text: JSON.stringify(t.example.call ?? {}, null, 2) });
          if (t.example.result != null) blocks.push({ t: "code", label: "Result", text: typeof t.example.result === "string" ? t.example.result : JSON.stringify(t.example.result, null, 2) });
        }
        if ((t.side_effects || []).length) blocks.push({ t: "h", text: "Side effects" }, { t: "list", items: t.side_effects });
        if (fails.length) {
          blocks.push({ t: "h", text: "How it can fail" });
          blocks.push({ t: "table", head: ["When", "What the agent sees"], rows: fails.map((f) => [str(f.when), str(f.what_the_agent_sees)]) });
        }
        add({
          path: tp,
          title: t.name,
          summary: t.summary,
          lead: t.summary,
          since: t.since,
          seeAlsoIds: t.see_also || [],
          keywords: [t.name, t.title, ...(t.search_terms || [])],
          blocks
        });
        allRows.push([t.name, t.title, group ? group.title : "Always on", str(t.risk), str(t.needs_approval), "/projects/niplex-harness/" + tp]);
      }
    }
    void csv;
    add({
      path: "tools/all",
      title: "All tools",
      summary: allRows.length + " tools in one table, with risk and approval.",
      lead: "All " + allRows.length + " tools, with the group each belongs to, how risky it is and whether it needs approval.",
      keywords: ["all tools", "tool list", "tool index"],
      blocks: [{ t: "table", head: ["Tool", "What it does", "Group", "Risk", "Needs approval"], rows: allRows.map((r) => [r[0] + "|" + r[5], r[1], r[2], r[3], r[4]]) }]
    });
  }

  /* 04 Safety */
  mdPage("04-safety/safety-model.md", "safety", { title: "Safety model" });
  {
    const gate = readJson<Item[]>("04-safety/approval-gate.json");
    gate.forEach((x) => reg(x.id, "safety/approval-gate"));
    mdPage("04-safety/approval-gate.md", "safety/approval-gate", {
      blocks: [
        { t: "h", text: "Decision table" },
        {
          t: "table",
          head: ["Action", "Example", "Decision", "Buttons", "Remembered for", "Survives restart", "Notes"],
          rows: gate.map((g) => [g.action_kind, str(g.example), str(g.decision), str(g.buttons), str(g.remembered_for), yn(g.survives_restart), str(g.notes)])
        }
      ]
    });
  }
  mdPage("04-safety/allow-list.md", "safety/allow-list");
  mdPage("04-safety/content-screening.md", "safety/content-screening");
  mdPage("04-safety/file-protection.md", "safety/file-protection");
  {
    const lim = readJson<Item[]>("04-safety/sandbox-limits.json");
    lim.forEach((x) => reg(x.id, "safety/sandbox"));
    mdPage("04-safety/sandbox.md", "safety/sandbox", {
      blocks: [
        { t: "h", text: "Limits" },
        {
          t: "table",
          head: ["Limit", "Value", "Enforced by", "Applies to", "Owner can change", "Setting"],
          rows: lim.map((l) => [l.limit, str(l.value) + (l.unit ? " " + l.unit : ""), str(l.enforced_by), str(l.applies_to), yn(l.can_owner_change), str(l.setting_name)])
        }
      ]
    });
  }
  mdPage("04-safety/secret-vault.md", "safety/secret-vault");
  mdPage("04-safety/threat-model.md", "safety/threat-model");

  /* 05 Memory and skills */
  {
    const types = readJson<Item[]>("05-memory-and-skills/memory-types.json");
    types.forEach((x) => reg(x.id, "memory"));
    mdPage("05-memory-and-skills/memory.md", "memory", {
      title: "Memory",
      blocks: [
        { t: "h", text: "Kinds of memory" },
        {
          t: "entries",
          items: types.map((m) => ({
            anchor: anchorId(m.id),
            title: m.title,
            body: m.summary,
            meta: rows([
              ["Scope", m.scope],
              ["Stored as", m.stored_as],
              ["How it is searched", m.how_it_is_searched],
              ["Size limits", m.size_limits],
              ["Needs a key", m.needs_key],
              ["If it is missing", m.fallback]
            ])
              .map(([k, v]) => k + ": " + v)
              .join("\n")
          }))
        }
      ]
    });
  }
  mdPage("05-memory-and-skills/vault-obsidian.md", "memory/vault");
  {
    const skills = readJson<Item[]>("05-memory-and-skills/skills-catalog.json");
    skills.forEach((x) => reg(x.id, "skills"));
    mdPage("05-memory-and-skills/skills.md", "skills", {
      title: "Skills",
      blocks: [
        { t: "h", text: "Built-in skills" },
        {
          t: "entries",
          items: skills.map((s) => ({
            anchor: anchorId(s.id),
            title: s.title,
            body: s.summary,
            meta: rows([["Folder", s.folder], ["Used when", s.when_the_agent_uses_it], ["Steps", (s.steps || []).join("; ")]])
              .map(([k, v]) => k + ": " + v)
              .join("\n")
          }))
        }
      ]
    });
  }
  mdPage("05-memory-and-skills/skill-format.md", "skills/format");

  /* 06 Providers and models */
  {
    const prov = readJson<Item[]>("06-providers-and-models/providers.json");
    add({
      path: "providers",
      title: "Providers",
      summary: prov.length + " ways to connect a model.",
      lead: "Kaizen Manas does not host a model. You bring your own key and pick one of " + prov.length + " providers in /setup: " + prov.map((p) => p.title).join(", ") + ".",
      keywords: ["providers", "models", "api key", "gemini", "openai", "openrouter", "agnes", "anthropic"]
    });
    for (const p of prov) {
      reg(p.id, "providers/" + slug(p.id.replace("provider.", "")), false);
      add({
        path: "providers/" + slug(p.id.replace("provider.", "")),
        title: p.title,
        summary: p.summary,
        lead: p.summary,
        since: p.since,
        seeAlsoIds: p.see_also || [],
        keywords: [p.title, ...(p.search_terms || [])],
        blocks: [
          {
            t: "kv",
            rows: rows([
              ["Sign-in", p.auth],
              ["Kind of endpoint", p.endpoint_kind],
              ["Where the model list comes from", p.model_list_source],
              ["Tool calls", p.supports?.tools],
              ["Streaming", p.supports?.streaming],
              ["Embeddings", p.supports?.embeddings],
              ["Tested", p.tested],
              ["Tested on", p.tested_on]
            ])
          },
          { t: "h", text: "Set up" },
          { t: "list", items: p.setup_steps || [] },
          ...((p.known_quirks || []).length ? ([{ t: "h", text: "Things to know" }, { t: "list", items: p.known_quirks }] as Block[]) : [])
        ]
      });
    }
  }
  {
    const tiers = readJson<Item[]>("06-providers-and-models/routing-tiers.json");
    tiers.forEach((x) => reg(x.id, "routing"));
    mdPage("06-providers-and-models/model-routing.md", "routing", {
      title: "Model routing",
      blocks: [
        { t: "h", text: "Tiers" },
        {
          t: "entries",
          items: tiers.map((x) => ({
            anchor: anchorId(x.id),
            title: x.title,
            body: x.purpose,
            meta: rows([
              ["Fallbacks", x.fallbacks],
              ["How a message is sent here", x.how_escalation_is_decided],
              ["Commands that change it", x.commands_that_change_it],
              ["When it is not set", x.default_when_unset]
            ])
              .map(([k, v]) => k + ": " + v)
              .join("\n")
          }))
        }
      ]
    });
  }
  mdPage("06-providers-and-models/fallbacks.md", "routing/fallbacks");

  /* 07 Chat and commands */
  add({
    path: "chat",
    title: "Chat apps",
    summary: "How Kaizen Manas talks through Discord and Telegram.",
    lead: "Kaizen Manas runs on Discord or Telegram, one at a time. These pages cover each app, how progress shows up in the chat and the button styles the bot can send.",
    keywords: ["chat", "discord", "telegram", "gateway"]
  });
  mdPage("07-chat-and-commands/discord.md", "chat/discord");
  mdPage("07-chat-and-commands/telegram.md", "chat/telegram");
  mdPage("07-chat-and-commands/progress-updates.md", "chat/progress-updates");
  mdPage("07-chat-and-commands/ui-gallery.md", "chat/ui-gallery");
  {
    const cmds = readJson<Item[]>("07-chat-and-commands/commands.json");
    add({
      path: "commands",
      title: "Commands",
      summary: cmds.length + " chat commands.",
      lead: "Kaizen Manas has " + cmds.length + " chat commands. /start works on Telegram only; the rest work on both apps.",
      keywords: ["commands", "slash", "setup", "help", "reset", "allow", "routing", "model", "escalate", "ui"],
      blocks: [{ t: "table", head: ["Command", "What it does", "Apps"], rows: cmds.map((c) => [c.name + "|" + KM_BASE + "/commands/" + slug(c.name), c.summary, str(c.platforms)]) }]
    });
    for (const c of cmds) {
      const cp = "commands/" + slug(c.name);
      reg(c.id, cp, false);
      const ex = c.example || {};
      add({
        path: cp,
        title: c.name,
        summary: c.summary,
        lead: c.summary,
        since: c.since,
        seeAlsoIds: [...(c.see_also || []), ...(c.related_tools || [])],
        keywords: [c.name, ...(c.search_terms || [])],
        blocks: [
          {
            t: "kv",
            rows: rows([
              ["Works on", c.platforms],
              ["Arguments", (c.args || []).length ? c.args : "None"],
              ["Changes", c.what_it_changes],
              ["Does not change", c.what_it_does_not_change],
              ["Who can run it", c.who_can_run_it]
            ])
          },
          ...(ex.user ? ([{ t: "h", text: "Example (made up for this page)" }, { t: "convo", turns: [{ who: "You", text: ex.user }, { who: "Manas", text: ex.bot || "" }] }] as Block[]) : [])
        ]
      });
    }
  }

  /* 08 Terminal and code */
  mdPage("08-terminal-and-code/terminal.md", "terminal", { title: "Terminal and shell" });
  mdPage("08-terminal-and-code/code-execution.md", "terminal/code-execution");
  mdPage("08-terminal-and-code/packages.md", "terminal/packages");

  /* 09 Automation */
  mdPage("09-automation/scheduled-jobs.md", "automation", { title: "Scheduled jobs" });
  mdPage("09-automation/goals-and-todo.md", "automation/goals-and-todo");
  mdPage("09-automation/notifications.md", "automation/notifications");
  mdPage("09-automation/voice.md", "automation/voice");
  mdPage("09-automation/github-tools.md", "automation/github-tools");

  /* 10 Deploy and run */
  mdPage("10-deploy-and-run/quickstart.md", "deploy", { title: "Quickstart" });
  mdPage("10-deploy-and-run/requirements.md", "deploy/requirements");
  {
    const hosts = readJson<Item[]>("10-deploy-and-run/hosting-options.json");
    hosts.forEach((x) => reg(x.id, "deploy/hosting"));
    add({
      path: "deploy/hosting",
      title: "Hosting options",
      summary: "Where Kaizen Manas can run, and what was and was not checked.",
      lead: "Kaizen Manas needs a host that can keep a Python process running. These are the options written down so far, with what is confirmed and what is not.",
      keywords: ["hosting", "host", "free host", "hidencloud", "server"],
      blocks: [
        {
          t: "entries",
          items: hosts.map((h) => ({
            anchor: anchorId(h.id),
            title: h.title,
            body: h.summary,
            meta: rows([
              ["Kind", h.kind],
              ["What works", h.what_works],
              ["What does not", h.what_does_not],
              ["Memory limit", h.memory_limit],
              ["Sleeps when idle", h.sleeps_when_idle],
              ["Keeps files after restart", h.persistent_disk],
              ["How to keep it awake", h.how_to_keep_it_awake],
              ["Set up", (h.setup_steps || []).join("; ")],
              ["Tested", h.tested],
              ["Tested on", h.tested_on]
            ])
              .map(([k, v]) => k + ": " + v)
              .join("\n")
          }))
        }
      ]
    });
  }
  mdPage("10-deploy-and-run/auto-deploy-supervisor.md", "deploy/auto-deploy");
  mdPage("10-deploy-and-run/backup-and-restore.md", "deploy/backup-and-restore");
  mdPage("10-deploy-and-run/phone-control-panel.md", "deploy/phone-control-panel");
  mdPage("10-deploy-and-run/updating.md", "deploy/updating");
  {
    const tr = readJson<Item[]>("10-deploy-and-run/troubleshooting.json");
    add({
      path: "troubleshooting",
      title: "Troubleshooting",
      summary: tr.length + " problems, with what to check and how to fix them.",
      lead: "Something not working? Find the symptom below. Each page lists likely causes, what to check and the fix.",
      keywords: ["troubleshooting", "problem", "error", "fix", "not working"]
    });
    for (const t of tr) {
      const tp = "troubleshooting/" + slug(t.symptom || t.title).slice(0, 60).replace(/-$/, "");
      reg(t.id, tp, false);
      add({
        path: tp,
        title: t.symptom || t.title,
        summary: t.summary,
        lead: t.fix ? "Fix: " + t.fix : t.summary,
        since: t.since,
        seeAlsoIds: t.see_also || [],
        keywords: [t.symptom, ...(t.search_terms || [])].filter(Boolean),
        blocks: [
          { t: "h", text: "Likely causes" },
          { t: "list", items: t.likely_causes || [] },
          { t: "h", text: "Check" },
          { t: "list", items: t.checks || [] },
          ...(t.when_to_ask_for_help ? ([{ t: "h", text: "When to ask for help" }, { t: "p", text: t.when_to_ask_for_help }] as Block[]) : [])
        ]
      });
    }
  }

  /* 11 Quality */
  {
    const ts = readJson<Item[]>("11-quality/test-summary.json")[0];
    reg(ts.id, "quality");
    const page = mdPage("11-quality/testing.md", "quality", { title: "Testing and quality" });
    page.blocks.push(
      { t: "h", text: "Test summary" },
      {
        t: "table",
        head: ["Area", "Tests", "Covers"],
        rows: (ts.areas || []).map((a: Item) => [a.area, str(a.count), str(a.what_it_covers)])
      },
      {
        t: "kv",
        rows: rows([
          ["Python versions", ts.python_versions],
          ["How to run", ts.how_to_run],
          ["Automatic checks on GitHub", ts.ci_runs_now],
          ["Note", ts.ci_note],
          ["Extra checks", ts.extra_checks]
        ])
      }
    );
  }
  mdPage("11-quality/performance.md", "quality/performance");
  mdPage("11-quality/security-review.md", "quality/security-review");
  {
    const ki = readJson<Item[]>("11-quality/known-issues.json");
    ki.forEach((x) => reg(x.id, "quality/known-issues"));
    add({
      path: "quality/known-issues",
      title: "Known issues",
      summary: ki.length + " known issues and limits, stated plainly.",
      lead: "These are the known issues and limits as of the commit this documentation was checked against. Some are bugs, some are design limits.",
      keywords: ["known issues", "bugs", "limits", "limitations"],
      blocks: [
        {
          t: "entries",
          items: ki.map((k) => ({
            anchor: anchorId(k.id),
            title: k.title,
            body: k.summary,
            meta: rows([["Affects", k.affects], ["Workaround", k.workaround], ["State", k.issue_status]])
              .map(([a, b]) => a + ": " + b)
              .join("\n")
          }))
        }
      ]
    });
  }

  /* 12 Project */
  {
    const ch = readJson<Item[]>("12-project/changelog.json");
    ch.forEach((x) => reg(x.id, "changelog"));
    add({
      path: "changelog",
      title: "Changelog",
      summary: "What changed, newest first.",
      lead: "What changed in Kaizen Manas, newest first. No release has been tagged yet, so entries are grouped by date.",
      keywords: ["changelog", "changes", "history", "updates", "what's new"],
      blocks: [
        {
          t: "entries",
          items: ch.map((c) => ({
            anchor: anchorId(c.id),
            title: c.date_or_version + ": " + c.title,
            body: c.summary,
            meta: (c.items || []).map((i: Item) => i.type + ": " + i.text).join("\n")
          }))
        }
      ]
    });
  }
  {
    const rm = readJson<Item[]>("12-project/roadmap.json");
    rm.forEach((x) => reg(x.id, "roadmap"));
    add({
      path: "roadmap",
      title: "Roadmap",
      summary: "What is planned, and the honest risk for each item.",
      lead: "These items are planned, not built. Each one says why it matters and what could go wrong. Nothing here has a date.",
      keywords: ["roadmap", "planned", "future", "next"],
      blocks: [
        {
          t: "entries",
          items: rm.map((r) => ({
            anchor: anchorId(r.id),
            title: r.title,
            body: r.summary,
            meta: rows([["Why it matters", r.why_it_matters], ["Depends on", r.depends_on], ["Honest risk", r.honest_risk]])
              .map(([a, b]) => a + ": " + b)
              .join("\n")
          }))
        }
      ]
    });
  }
  {
    const dec = readJson<Item[]>("12-project/decisions.json");
    add({
      path: "decisions",
      title: "Design decisions",
      summary: dec.length + " decisions, with the options that were not chosen.",
      lead: "The choices that shaped Kaizen Manas, what else was considered, and what each choice cost.",
      keywords: ["decisions", "why", "design choices"]
    });
    for (const d of dec) {
      const dp = "decisions/" + slug(d.title).slice(0, 60).replace(/-$/, "");
      reg(d.id, dp, false);
      add({
        path: dp,
        title: d.title,
        summary: d.summary,
        lead: d.decision,
        since: d.date,
        seeAlsoIds: d.see_also || [],
        keywords: d.search_terms || [],
        blocks: [
          { t: "kv", rows: rows([["Decided on", d.date], ["Context", d.context], ["Consequence", d.consequence]]) },
          { t: "h", text: "Other options considered" },
          { t: "list", items: d.alternatives_considered || [] }
        ]
      });
    }
  }
  {
    const cmp = readJson<Item[]>("12-project/comparisons.json");
    add({
      path: "compare",
      title: "Compared with other agents",
      summary: "How Kaizen Manas differs from " + cmp.length + " other tools, and where they are better.",
      lead: "Short, fair comparisons. Each one says where Kaizen Manas differs, where the other tool is better and who should pick which. They describe other products from public information and may be out of date.",
      keywords: ["compare", "comparison", "alternatives", "versus", "vs"]
    });
    for (const c of cmp) {
      const cp = "compare/" + slug(c.other);
      reg(c.id, cp, false);
      add({
        path: cp,
        title: "Kaizen Manas and " + c.other,
        summary: c.one_line,
        lead: c.one_line,
        seeAlsoIds: c.see_also || [],
        keywords: [c.other, ...(c.search_terms || [])],
        blocks: [
          { t: "h", text: "Where Kaizen Manas is different" },
          { t: "list", items: c.where_this_is_different || [] },
          { t: "h", text: "Where " + c.other + " is better" },
          { t: "list", items: c.where_the_other_is_better || [] },
          { t: "kv", rows: rows([["Pick Kaizen Manas if", c.pick_this_if], ["Pick " + c.other + " if", c.pick_the_other_if], ["Checked on", c.checked_on]]) }
        ]
      });
    }
  }
  {
    const uc = readJson<Item[]>("12-project/use-cases.json");
    add({
      path: "use-cases",
      title: "Use cases",
      summary: uc.length + " things people do with it, step by step.",
      lead: "Examples of what the owner asks for and what Kaizen Manas does, with the tools involved. All of them are made-up examples.",
      keywords: ["use cases", "examples", "what can it do"]
    });
    for (const u of uc) {
      const up = "use-cases/" + slug(u.title);
      reg(u.id, up, false);
      add({
        path: up,
        title: u.title,
        summary: u.situation,
        lead: u.situation,
        image: USE_CASE_IMAGES[u.id],
        seeAlsoIds: [...(u.see_also || []), ...(u.tools_used || [])],
        keywords: u.search_terms || [],
        blocks: [
          { t: "kv", rows: rows([["Who", u.who], ["What the owner sees", u.what_the_owner_sees], ["Limits", u.limits]]) },
          { t: "h", text: "Step by step" },
          { t: "convo", turns: (u.steps || []).map((s: Item) => ({ who: s.actor === "owner" ? "You" : s.actor === "manas" ? "Manas" : "Tool", text: s.text })), notice: ["Made-up example."] }
        ]
      });
    }
  }
  {
    const files = ["allow-window", "approval-allow-once", "approval-deny", "group-switch", "memory-save-search", "model-error-404", "refused-core-file", "routing-escalate", "scheduled-job", "setup-flow", "shell-off", "tool-failure"];
    const samples = files.map((f) => readJson<Item>("12-project/sample-conversations/" + f + ".json"));
    add({
      path: "examples",
      title: "Example conversations",
      summary: samples.length + " made-up chats that show how it behaves.",
      lead: "Short made-up chats showing approvals, errors, scheduled jobs and more. They are examples written for this page, not real conversations.",
      keywords: ["examples", "sample conversations", "demo", "transcript"]
    });
    for (const s of samples) {
      const sp = "examples/" + slug(s.id.replace("sample.", ""));
      reg(s.id, sp, false);
      add({
        path: sp,
        title: s.title,
        summary: s.summary,
        lead: s.summary,
        seeAlsoIds: s.see_also || [],
        keywords: s.search_terms || [],
        blocks: [
          {
            t: "convo",
            turns: (s.turns as Item[]).map((t) => {
              const extra: string[] = [];
              for (const c of (t.tool_calls || []) as Item[]) extra.push("Tool: " + c.tool + " " + JSON.stringify(c.args) + (c.result_summary ? " → " + c.result_summary : ""));
              if (t.approval) extra.push("Approval buttons: " + str(t.approval.buttons) + (t.approval.chosen ? ". Chosen: " + t.approval.chosen : ""));
              return { who: t.role === "owner" ? "You" : "Manas", text: t.text || "", extra };
            }),
            notice: ["Platform: " + s.platform + ". Made-up example."]
          },
          { t: "h", text: "What to notice" },
          { t: "list", items: s.what_to_notice || [] }
        ]
      });
    }
  }
  {
    const faq = readJson<Item[]>("12-project/faq.json");
    faq.forEach((x) => reg(x.id, "faq"));
    add({
      path: "faq",
      title: "Frequently asked questions",
      summary: faq.length + " questions and short answers.",
      lead: "Short answers to the questions people ask most about Kaizen Manas.",
      keywords: ["faq", "questions", "answers"],
      blocks: [{ t: "entries", items: faq.map((q) => ({ anchor: anchorId(q.id), title: q.question, body: q.answer })) }]
    });
  }
  {
    const gl = readJson<Item[]>("12-project/glossary.json");
    gl.forEach((x) => reg(x.id, "glossary"));
    add({
      path: "glossary",
      title: "Glossary",
      summary: gl.length + " terms in plain words.",
      lead: "Terms used in these pages, explained in plain words.",
      keywords: ["glossary", "terms", "definitions"],
      blocks: [{ t: "entries", items: [...gl].sort((a, b) => a.term.localeCompare(b.term)).map((g) => ({ anchor: anchorId(g.id), title: g.term, body: g.definition })) }]
    });
  }

  const byPath = new Map(pages.map((p) => [p.path, p]));
  const children = new Map<string, KmPage[]>();
  for (const p of pages) {
    const parts = p.path.split("/");
    for (let i = parts.length - 1; i >= 1; i--) {
      const parent = parts.slice(0, i).join("/");
      if (byPath.has(parent)) {
        (children.get(parent) || children.set(parent, []).get(parent)!).push(p);
        break;
      }
    }
  }

  // Turn id references into real links, and add the "more in this section" cards.
  const title = (id: string) => {
    const path = (idPath.get(id) || "").split("#")[0];
    return byPath.get(path)?.title || "";
  };
  void title;
  const resolve = (ids: string[]) => {
    const out: { title: string; path: string }[] = [];
    const seen = new Set<string>();
    for (const id of ids) {
      const target = idPath.get(id);
      if (!target) continue;
      const page = byPath.get(target.split("#")[0]);
      if (!page || seen.has(target)) continue;
      seen.add(target);
      out.push({ title: page.title, path: target });
    }
    return out;
  };
  for (const p of pages) {
    p.blocks = p.blocks.map((b) => (b.t === "refs" ? ({ t: "links", label: b.label, items: resolve(b.ids) } as Block) : b));
    p.blocks = p.blocks.filter((b) => !(b.t === "links" && b.items.length === 0) && !(b.t === "kv" && b.rows.length === 0));
    for (const b of p.blocks) {
      if (b.t === "steps") {
        // keep the step's own links as plain data for the renderer
        for (const s of b.items) if (s.refs) s.refs = resolve(s.refs).map((x) => x.title + "|" + x.path);
      }
    }
    const kids = children.get(p.path);
    if (kids && kids.length && p.path !== "commands" && p.path !== "tools/all") {
      p.blocks.push({ t: "h", text: "In this section" });
      p.blocks.push({ t: "cards", items: kids.map((k) => ({ title: k.title, summary: k.summary, path: k.path })) });
    }
  }

  built = { pages, byPath, idPath, children };
  return built;
}

export function seeAlso(page: KmPage) {
  const km = getKm();
  const out: { title: string; path: string }[] = [];
  const seen = new Set<string>();
  for (const id of page.seeAlsoIds) {
    const target = km.idPath.get(id);
    if (!target || target.split("#")[0] === page.path || seen.has(target)) continue;
    const p = km.byPath.get(target.split("#")[0]);
    if (!p) continue;
    seen.add(target);
    out.push({ title: p.title, path: target });
  }
  return out;
}

export function kmUrl(path: string) {
  return KM_BASE + "/" + path;
}

export function kmRef() {
  const m = kmMeta();
  return { short: m.ref.slice(0, 7), readOn: m.read_on, counts: m.counts };
}

/** Plain text of a page, for search, the assistant and llms-full.txt. */
export function pageText(p: KmPage): string {
  const out: string[] = [p.title, p.lead || p.summary];
  for (const b of p.blocks) {
    switch (b.t) {
      case "md":
        out.push(b.text.replace(/`/g, "").replace(/\*\*/g, ""));
        break;
      case "h":
        out.push(b.text + ":");
        break;
      case "p":
      case "note":
        out.push(b.text);
        break;
      case "list":
        for (const i of b.items) out.push("- " + i);
        break;
      case "kv":
        for (const [k, v] of b.rows) out.push(k + ": " + v);
        break;
      case "table":
        out.push(b.head.join(" | "));
        for (const r of b.rows) out.push(r.map((c) => c.split("|")[0]).join(" | "));
        break;
      case "code":
        out.push((b.label ? b.label + ": " : "") + b.text);
        break;
      case "steps":
        b.items.forEach((s, i) => out.push(i + 1 + ". " + (s.title ? s.title + ": " : "") + s.body));
        break;
      case "convo":
        for (const t of b.turns) {
          out.push(t.who + ": " + t.text);
          for (const e of t.extra || []) out.push(e);
        }
        break;
      case "entries":
        for (const e of b.items) out.push(e.title + ": " + e.body + (e.meta ? " " + e.meta.replace(/\n/g, " ") : ""));
        break;
      case "cards":
        break;
      case "links":
        break;
      default:
        break;
    }
  }
  return out.join("\n");
}
