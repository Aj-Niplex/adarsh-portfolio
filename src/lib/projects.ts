export type Tier = "core" | "tools" | "side";

// A picture that belongs to one group (see public/km). With `item`, it sits under that bullet; without, beside the group's heading.
export type Figure = { id: string; alt: string; caption: string; item?: number };

export type Project = {
  slug: string;
  name: string;
  tier: Tier;
  visibility: "public" | "private";
  status: string;
  tagline: string;
  summary: string;
  tags: string[];
  stats: { label: string; value: string }[];
  groups: { title: string; items: string[]; figure?: Figure }[];
  steps: { title: string; body: string }[];
  stepsTitle: string;
  setup: string[];
  reference?: { title: string; rows: { name: string; purpose: string }[] };
  boundaries: string[];
  links: { label: string; href: string }[];
  logo?: { src: string; alt: string; plain?: boolean };
  share?: { src: string; width: number; height: number; alt: string };
  appCategory: string;
  repo?: string;
};

export const TIERS: Record<Tier, { title: string; blurb: string }> = {
  core: { title: "Core", blurb: "The two systems everything else connects to." },
  tools: { title: "Public tools", blurb: "Working open-source projects built on the same ideas." },
  side: { title: "Side projects", blurb: "Smaller, personal or documentation projects." }
};

export const projects: Project[] = [
  {
    slug: "niplex-harness",
    name: "NiPlex-Harness",
    tier: "core",
    visibility: "private",
    status: "Private · In development",
    tagline: "A personal AI agent you run from Discord or Telegram.",
    summary:
      "Also known as Kaizen Manas, with the agent itself named Manas. The name joins kaizen (continuous improvement) and manas (Sanskrit for mind), and replaced NiPlex Harness on 17 September 2026. One Python process built for a single owner and for free hosts with no PC, so your phone is the control panel. It keeps notes, searches the web and runs Python in a resource-limited sandbox, and it stops at approval buttons before anything risky. The current source is private; this page describes what it does. An older public snapshot is on GitHub.",
    tags: ["Python", "Discord", "Telegram", "Sandbox", "Agents"],
    stats: [
      { label: "Tools", value: "61: 56 in 13 groups, 5 always on" },
      { label: "Chat apps", value: "Discord, Telegram" },
      { label: "Code execution", value: "Limited sandbox + approval buttons" },
      { label: "Tests", value: "484, run on Python 3.12 and 3.13" }
    ],
    groups: [
      {
        title: "Set up from chat",
        items: [
          "/setup walks through provider, API key and model. The model list comes from the provider's own API, and you can answer with a number, an ID or random.",
          "Providers: Agnes, Google Gemini, OpenAI, OpenRouter, any OpenAI-compatible endpoint, and Anthropic through an OpenAI-compatible proxy.",
          "The bot tries to delete the chat message that holds your API key. The key is saved in a local file that is never committed."
        ]
      },
      {
        title: "What the agent can do",
        items: [
          "Memory: notes kept globally or per chat, keyword search, semantic search through Gemini embeddings, a small knowledge graph, search across past sessions and a timestamped event log.",
          "Terminal: run Python in the sandbox, keep several terminal sessions open and reset the sandbox's installed packages.",
          "Files and vault: create, edit and delete files inside folders, with an Obsidian-ready vault. Files are never written to the project root.",
          "Skills: write, load and search reusable skills in personal, market and custom folders.",
          "Web: DuckDuckGo search with no API key, and page reading that refuses private and cloud-metadata addresses.",
          "Also: scheduled jobs, sub-goal tracking, GitHub tools (off by default), push notifications, offline voice replies (off by default) and a to-do list and clarify question for long tasks.",
          "Every group can be switched on or off by asking the agent, so it only sees the tools you want it to have."
        ]
      },
      {
        title: "Safe by default",
        figure: { id: "safety-approval-gate", alt: "Manas pausing at a small gate with a button, waiting for a person to approve", caption: "Risky things wait for a button" },
        items: [
          "Only numeric user IDs on the allow-list can talk to it. An empty list lets nobody in.",
          "Risky code stops at Allow Once, Allow Session, Always Allow (that exact command only) or Deny buttons. Waiting approvals survive a restart.",
          "/allow opens a 5, 10 or 30 minute window with no prompts, then closes it by itself.",
          "The sandbox runs with a scrubbed environment, so tokens and keys are not passed in, plus limits on memory, CPU time, file size, open files and processes. A timeout stops the whole process group.",
          "Secret Vault: store a secret once and write {=NAME=} in code. The value is filled in at run time and removed from the output before the model sees it.",
          "Scheduled jobs that run on their own can only use read-only tools.",
          "Web results and saved skills are screened for prompt-injection phrases and hidden characters. The harness's own code is hard-blocked from the agent's file tools.",
          "Crash reports to GitHub are off unless you turn them on, and secrets are stripped first."
        ]
      },
      {
        title: "Keeps itself running",
        figure: { id: "runtime-self-repair", alt: "Manas with a wrench helping a sleepy lamp wake up", caption: "Restarts and rolls back by itself" },
        items: [
          "Auto-deploy (needs a GitHub token): a supervisor checks the deploy branch about every two minutes, rejects code that does not compile, restarts on the new commit and rolls back if the bot crashes within two minutes of a deploy.",
          "A crash restarts the bot with growing delays, from 5 seconds up to 5 minutes.",
          "Long chats are compressed in the middle so the history stays inside the model's limit.",
          "Settings live in .env: GATEWAY, the bot token, the allow-list IDs, SANDBOX_MODE (builtin or external), SANDBOX_TIMEOUT (60 s by default) and SANDBOX_MAX_MEMORY_MB (512 by default)."
        ]
      },
      {
        title: "Merged in October, rolling out",
        items: [
          "Live progress in the chat: one line per tool call, the agent's text before a tool call sent as it happens, long replies split instead of cut off, and 25 tool rounds per message by default.",
          "A persistent shell terminal, a group of 5 tools. It keeps its state between commands and runs any installed language. Off by default; only the owner can switch it on in .env, never from chat. Risky commands use the same approval buttons.",
          "Model routing: small, medium and power tiers, each one model plus up to three fallbacks, set with /routing. With a power model set, hard jobs can be handed over automatically, or you use /model and /escalate.",
          "/ui shows each kind of button, menu, poll and card the bot can send. Normal replies do not use them yet."
        ]
      }
    ],
    stepsTitle: "How a message is handled",
    steps: [
      { title: "Receive", body: "A message arrives from Discord or Telegram. Anyone who is not on the allow-list is ignored. Messages in the same chat are handled one at a time, in the order they arrive." },
      { title: "Think", body: "The agent sends the chat and the tools that are switched on to your chosen model. One message can use up to 25 rounds of tool calls." },
      { title: "Check", body: "Risky code or commands pause with approval buttons. Safe ones run straight away." },
      { title: "Act", body: "Tools use the sandbox, the vault, memory or the web, and the results go back to the agent." },
      { title: "Reply", body: "The answer returns to the chat, with files attached when needed." }
    ],
    setup: [],
    reference: {
      title: "Commands",
      rows: [
        { name: "/start", purpose: "Telegram only: show the start text." },
        { name: "/setup", purpose: "Choose provider, API key and model." },
        { name: "/help", purpose: "Show usage help." },
        { name: "/reset", purpose: "Clear the current chat session." },
        { name: "/allow", purpose: "Skip approval buttons for 5, 10 or 30 minutes." },
        { name: "/routing", purpose: "Model tiers and automatic escalation." },
        { name: "/model", purpose: "See or pin the model tier." },
        { name: "/escalate", purpose: "Send a task to the power model." },
        { name: "/ui", purpose: "Show the UI styles." }
      ]
    },
    boundaries: [
      "It is a personal harness for one owner, not a hosted multi-user service.",
      "The approval gate, file protection, content screening and secret removal are checks that catch real mistakes. They are not a security boundary. The real boundary is the host or container it runs in.",
      "The built-in sandbox is a limited subprocess on the same host, not a container or a virtual machine. An external sandbox service can be used instead.",
      "Sub-agents are named trackers for a sub-goal, not separate running agents.",
      "Connecting outside MCP servers is scaffolding only and is not yet part of the agent loop.",
      "Semantic memory search needs a Google key and falls back to keyword search without one.",
      "Merged features are in the private main branch; a bot has them only after it updates and restarts.",
      "The current source is private and the public repository is an older snapshot, so the snapshot does not match everything on this page."
    ],
    links: [{ label: "Older public snapshot on GitHub", href: "https://github.com/Aj-Niplex/NiPlex-Harness" }],
    logo: { src: "/logos/kaizen-manas.webp", alt: "Manas, the Kaizen Manas mascot: a purple axolotl plush wearing a teal harness", plain: true },
    share: { src: "/logos/kaizen-manas-share-wide.jpg", width: 1200, height: 630, alt: "Manas, the Kaizen Manas mascot, waving" },
    appCategory: "DeveloperApplication"
  },
  {
    slug: "niplex-mcp",
    name: "NiPlex-MCP",
    tier: "core",
    visibility: "private",
    status: "Private · Production",
    tagline: "One MCP connection that gives an AI agent 73 tools.",
    summary:
      "A production Model Context Protocol server. Any MCP-capable AI client connects once and gets repository work, cloud sandboxes, remote file operations, web and YouTube search, Gemini analysis and persistent chat threads. The source is private; this page describes what it does.",
    tags: ["Python", "FastMCP", "MCP", "Sandboxes", "GitHub"],
    stats: [
      { label: "Tools", value: "73" },
      { label: "Auth", value: "Fail-secure API key" },
      { label: "Dispatch", value: "Allow-listed" },
      { label: "Source", value: "Private" }
    ],
    groups: [
      {
        title: "73 tools in seven groups",
        items: [
          "GitHub, 38 tools: repositories, files, branches, commits, issues, pull requests, CI status and code search.",
          "ThreadForge chat, 12 tools: persistent multi-model threads and shared artifacts, proxied from ThreadForge-MCP.",
          "Remote files, 8 tools: list, read, write, rename, search and delete files on a remote host over SFTP.",
          "Web and video, 5 tools: web search with fallbacks, page reading, and YouTube search, details and stats.",
          "Sandboxes, 4 tools: run code in two cloud sandboxes through one interface.",
          "Gemini, 2 tools: ask Gemini, or analyse a YouTube video straight from its URL.",
          "Utilities, 4 tools: keyword help across all tools, installed versions, recent errors and a helper."
        ]
      },
      {
        title: "Security posture",
        items: [
          "Fails closed: if no API key is configured, the whole server answers 503 instead of running open.",
          "Every call goes through an explicit allow-list. Unknown tool names never reach implementation code.",
          "There is no email-sending tool and no auto-merge. Nothing is destructive by default.",
          "Each domain is its own manager class, so one tool group cannot leak into another."
        ]
      }
    ],
    stepsTitle: "How a request flows",
    steps: [
      { title: "Connect", body: "An MCP client such as Claude connects to the server endpoint with an API key." },
      { title: "Check", body: "Requests without a valid key are rejected before any tool runs." },
      { title: "Dispatch", body: "The tool name is matched against the allow-list and handed to its manager." },
      { title: "Act", body: "The manager calls GitHub, a sandbox, a remote host, a search backend or Gemini." },
      { title: "Return", body: "The result goes back to the agent as a normal MCP tool response." }
    ],
    setup: [],
    boundaries: [
      "The repository is private. It is not open source and is not available to install.",
      "Security details are reported by the owner. They are not an independent audit.",
      "Staged tools for other providers exist in the codebase but are not exposed."
    ],
    links: [{ label: "ThreadForge-MCP (the public chat server it proxies)", href: "https://github.com/Aj-Niplex/ThreadForge-MCP" }],
    appCategory: "DeveloperApplication"
  },
  {
    slug: "threadforge-mcp",
    name: "ThreadForge-MCP",
    tier: "tools",
    visibility: "public",
    status: "Public · Prototype",
    tagline: "Chat threads that remember, served over MCP.",
    summary:
      "A multi-model chat server for MCP clients. Pass a thread ID and the conversation continues with its full history, so an AI client gets a chat partner that remembers earlier talks instead of starting blank every time.",
    tags: ["Python", "FastMCP", "Gemini", "MCP"],
    stats: [
      { label: "Continuity", value: "Thread IDs" },
      { label: "Models", value: "Fallback and per-thread choice" },
      { label: "Storage", value: "GitHub-backed" },
      { label: "Status", value: "Prototype" }
    ],
    groups: [
      {
        title: "Conversation",
        items: [
          "Send a message with a thread_id to continue a conversation, or leave it out to start a new one.",
          "List recent threads and read any thread's history and summary.",
          "Set a preferred model per thread. If a model fails or times out, the next candidate is tried."
        ]
      },
      {
        title: "Memory",
        items: [
          "A cheaper model compresses long history in the background so threads fit the context window.",
          "Threads are stored as JSON plus readable Markdown through the GitHub API.",
          "Shared artifacts (notes, decisions, snippets) can be saved, read, updated and deleted by the chat and by the host agent."
        ]
      },
      {
        title: "Where it runs",
        items: [
          "Standalone as its own MCP server, or behind a larger gateway. NiPlex-MCP proxies its tools.",
          "Local testing with the MCP Inspector: uv run mcp dev server.py."
        ]
      }
    ],
    stepsTitle: "How a thread works",
    steps: [
      { title: "Call chat", body: "A client sends a message with an optional thread ID and model." },
      { title: "Load", body: "The thread's history and summary are read from storage." },
      { title: "Answer", body: "The chosen model replies, falling back to another if needed." },
      { title: "Compress", body: "Long history is summarised in the background." },
      { title: "Save", body: "The exchange, summary and artifacts are written back." }
    ],
    setup: [
      "Python 3.10 or newer, managed with uv.",
      "uv sync, set GEMINI_API_KEY, then uv run python server.py.",
      "A GitHub token that can read and write the storage repository.",
      "THREADFORGE_STORAGE_REPO and THREADFORGE_STORAGE_ROOT choose where threads live."
    ],
    reference: {
      title: "Tools",
      rows: [
        { name: "chat", purpose: "Send a message, optionally continuing a thread or choosing a model." },
        { name: "list_threads", purpose: "List recent threads." },
        { name: "get_thread", purpose: "Read a thread's history and summary." },
        { name: "set_model_preference", purpose: "Set a preferred model for a thread." },
        { name: "save_artifact", purpose: "Create or replace a note, decision or snippet." },
        { name: "list_artifacts / get_artifact", purpose: "Browse and read a thread's artifacts." },
        { name: "update_artifact / delete_artifact", purpose: "Change or remove an artifact." }
      ]
    },
    boundaries: [
      "It is a prototype. Model names and provider behaviour change.",
      "GitHub's API sets the limits on speed, rate and write conflicts.",
      "Threads can hold sensitive text, so choose the storage repository's visibility carefully.",
      "The storage owner is hard-coded in the source, so other accounts need a small refactor.",
      "Do not expose the endpoint publicly without authentication and quotas."
    ],
    links: [{ label: "Source on GitHub", href: "https://github.com/Aj-Niplex/ThreadForge-MCP" }],
    appCategory: "DeveloperApplication",
    repo: "https://github.com/Aj-Niplex/ThreadForge-MCP"
  },
  {
    slug: "rei-kun-bot",
    name: "Rei-kun-Bot",
    tier: "tools",
    visibility: "public",
    status: "Public · MIT",
    tagline: "A Discord AI bot with a persistent persona.",
    summary:
      "A modular Python Discord bot that combines AI chat, a study-resource hub, custom emoji tools, code diagnostics and admin controls. Its persona stays consistent when the underlying model changes.",
    tags: ["Python", "discord.py", "OpenRouter", "Discord"],
    stats: [
      { label: "Models", value: "Multi-model fallback" },
      { label: "Memory", value: "Per-channel history" },
      { label: "Stack", value: "Python 3.13, discord.py" },
      { label: "Licence", value: "MIT" }
    ],
    groups: [
      {
        title: "Conversation",
        items: [
          "Routes chat through several models with automatic fallback.",
          "A protected identity prompt keeps the Rei-kun persona recognisable across models.",
          "Tracks recent messages per channel and can store notes on request."
        ]
      },
      {
        title: "Community tools",
        items: [
          "Study-resource hub: look up notes, mind maps, audio, quizzes and revision links by code or topic, with a wizard for adding and editing.",
          "Custom emoji catalogue with named placeholders, plus list, rename and add commands."
        ]
      },
      {
        title: "Admin and safety",
        items: [
          "Code Doctor analyses Python errors and suggests or applies fixes with interactive buttons.",
          "Hot-reload command modules without restarting the bot.",
          "Terms-of-service acceptance, owner and admin roles, user blocking and DM gating."
        ]
      }
    ],
    stepsTitle: "Getting it running",
    steps: [
      { title: "Create the app", body: "Make a Discord application and bot, then copy .env.example." },
      { title: "Configure", body: "Set DISCORD_TOKEN, the AI provider key, admin IDs and resource roles." },
      { title: "Start", body: "Run python app.py and complete the onboarding prompt." },
      { title: "Chat", body: "Use ?ai for conversation and ?resource for study material." }
    ],
    setup: [
      "Python 3.13 and discord.py 2.6.4 or newer.",
      "OPENROUTER_MODELS is a comma-separated fallback list.",
      "Keep .env and any encryption keys out of Git."
    ],
    reference: {
      title: "Commands",
      rows: [
        { name: "?ai <prompt>", purpose: "Chat with the AI persona." },
        { name: "?resource <code>", purpose: "Fetch a study resource." },
        { name: "?doctor [target]", purpose: "Diagnose and suggest fixes for Python errors." },
        { name: "?emojisync / ?emojilist", purpose: "Sync and browse the emoji catalogue." },
        { name: "?reload <module>", purpose: "Reload a command module." },
        { name: "?help", purpose: "List commands." }
      ]
    },
    boundaries: [
      "Rei-kun is a fictional persona, not a real person.",
      "Model availability depends on provider quotas and the configured list.",
      "Code patching and reload are privileged. Restrict them to trusted admins.",
      "The README documents prefix commands. Check the deployed version for slash commands."
    ],
    links: [{ label: "Source on GitHub", href: "https://github.com/Aj-Niplex/Rei-kun-Bot" }],
    logo: { src: "/logos/rei-kun-bot.png", alt: "Rei-kun AI Bot logo" },
    appCategory: "DeveloperApplication",
    repo: "https://github.com/Aj-Niplex/Rei-kun-Bot"
  },
  {
    slug: "niplex-research-ai",
    name: "Niplex Research AI",
    tier: "side",
    visibility: "public",
    status: "Public · v0.1.23 · MIT",
    tagline: "A mobile-first research assistant inside Obsidian.",
    summary:
      "An Obsidian plugin I built for my own notes and published for anyone who wants it. It searches relevant notes, reads bounded line windows, answers with evidence and keeps durable edits behind explicit approval. It is a side project, not my main work.",
    tags: ["TypeScript", "Obsidian", "Gemini", "Agnes AI"],
    stats: [
      { label: "Platform", value: "Obsidian, mobile-friendly" },
      { label: "Providers", value: "Gemini, Agnes AI" },
      { label: "Edits", value: "Behind approval" },
      { label: "Licence", value: "MIT" }
    ],
    groups: [
      {
        title: "Research",
        items: [
          "Plans steps, searches note titles and metadata, reads only the relevant line windows, then answers from that context.",
          "Runs can be stopped, and every step shows in a timeline.",
          "A question containing one public YouTube URL can be passed to Gemini."
        ]
      },
      {
        title: "Control",
        items: [
          "Plan and Chat modes are read-only. Create and edit mode is required before any write tool is considered, and writes still need approval.",
          "Context is capped: 20,000 characters injected, 6,000 for the question, and at most eight Markdown files from a folder.",
          "Provider keys are stored in Obsidian SecretStorage."
        ]
      },
      {
        title: "Notes and skills",
        items: [
          "Chat history is saved as readable Markdown inside the vault.",
          "Instruction-only skills install from the vault and cannot run code.",
          "An organiser can find note categories and build maps of content, with checkpoints for long runs."
        ]
      }
    ],
    stepsTitle: "How a question is answered",
    steps: [
      { title: "Ask", body: "Type a question in the mobile-first chat view." },
      { title: "Find", body: "The plugin searches note names and metadata for candidates." },
      { title: "Read", body: "Only relevant line windows, or files you attached, are read." },
      { title: "Answer", body: "The model replies using that supplied context." },
      { title: "Approve", body: "Any proposed edit waits for your explicit approval." }
    ],
    setup: [
      "Install as an Obsidian community plugin (minimum Obsidian 1.11.4).",
      "Add a Gemini or Agnes key in the plugin settings.",
      "Use the + control for files or a folder, @path for inline notes and /skill for skills."
    ],
    boundaries: [
      "Selected note context and prompts leave your device when sent to a provider. Avoid sensitive notes.",
      "Provider and model fallback lists change over time.",
      "Compatibility with MCP is a client feature. The plugin does not include an MCP server."
    ],
    links: [
      { label: "Source on GitHub", href: "https://github.com/Aj-Niplex/Niplex-obsidian-Research-AI" },
      { label: "Obsidian Community profile", href: "https://community.obsidian.md/users/aj-niplex" }
    ],
    logo: { src: "/logos/niplex-research-ai.jpeg", alt: "Niplex Research AI mascot" },
    appCategory: "ProductivityApplication",
    repo: "https://github.com/Aj-Niplex/Niplex-obsidian-Research-AI"
  },
  {
    slug: "niplex-harness-site",
    name: "NiPlex Harness site",
    tier: "side",
    visibility: "public",
    status: "Public · Static site",
    tagline: "The docs site for the first public release of NiPlex-Harness.",
    summary:
      "A static landing and documentation site written for the first public release of NiPlex-Harness, with an agent-ready page that offers a copy-paste prompt so any AI assistant can walk a new user through setup.",
    tags: ["HTML", "CSS", "Cloudflare Pages"],
    stats: [
      { label: "Type", value: "Static site" },
      { label: "Host", value: "Cloudflare Pages" },
      { label: "Includes", value: "Docs, 404, sitemap" },
      { label: "Scope", value: "Version 1" }
    ],
    groups: [
      {
        title: "What is on it",
        items: [
          "A landing page that explains the harness.",
          "A docs index covering installation, the product and the stack.",
          "An agent-ready page with a prompt to paste into any AI assistant.",
          "robots.txt, sitemap.xml and a 404 page for static hosting."
        ]
      }
    ],
    stepsTitle: "How a visitor uses it",
    steps: [
      { title: "Land", body: "Read what the harness does." },
      { title: "Read the docs", body: "Follow the installation and product guides." },
      { title: "Use an AI guide", body: "Copy the prepared prompt into any AI assistant." }
    ],
    setup: ["Deployable from the repository root on any static host."],
    boundaries: [
      "Version 1 is static only: no accounts, forum or voting.",
      "It documents the harness. It is not the agent runtime.",
      "It describes the first public release. The current version, also called Kaizen Manas, is covered on the NiPlex-Harness page."
    ],
    links: [{ label: "Source on GitHub", href: "https://github.com/Aj-Niplex/niplex-harness-site" }],
    appCategory: "WebApplication",
    repo: "https://github.com/Aj-Niplex/niplex-harness-site"
  }
];

export const forks = [
  {
    name: "OpenDots",
    from: "CopilotKit/OpenDots",
    href: "https://github.com/Aj-Niplex/OpenDots",
    note: "A fork kept for experiments. The original work belongs to CopilotKit."
  }
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function projectsByTier(tier: Tier) {
  return projects.filter((p) => p.tier === tier);
}

export function buildAssistantContext() {
  const lines = [
    "Adarsh Jaiswal (also AJ NiPlex, handle Aj-Niplex, brand NiPlex) is an independent developer in India who builds AI agent systems and Model Context Protocol (MCP) servers. Tagline: Never Stop Imagining.",
    "MCP stands for Model Context Protocol."
  ];
  for (const p of projects) {
    lines.push(p.name + " (" + p.status + "): " + p.tagline + " " + p.summary);
  }
  lines.push(
    "Never claim unfinished features are production-ready. NiPlex-MCP and the current NiPlex-Harness are private: describe what they do, but not their source code, hosting or infrastructure. Do not reveal private repositories, credentials, personal data or internal notes. If asked about private work, say the portfolio only documents public-facing information. Do not share or guess personal details such as age, school or contact information."
  );
  return lines.join(" ");
}
