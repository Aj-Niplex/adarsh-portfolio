export type Tier = "core" | "tools" | "side";

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
  groups: { title: string; items: string[] }[];
  steps: { title: string; body: string }[];
  stepsTitle: string;
  setup: string[];
  reference?: { title: string; rows: { name: string; purpose: string }[] };
  boundaries: string[];
  links: { label: string; href: string }[];
  logo?: { src: string; alt: string };
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
    visibility: "public",
    status: "Public · MIT",
    tagline: "A personal AI agent you run from Discord or Telegram.",
    summary:
      "Built for people on free hosts who have no PC: your phone is the control panel. Message the agent in chat and it can search the web, keep notes, remember context and run Python in a sandbox that asks for your approval first.",
    tags: ["Python", "Discord", "Telegram", "Sandbox", "Agents"],
    stats: [
      { label: "Chat apps", value: "Discord, Telegram" },
      { label: "Code execution", value: "Python sandbox + approval buttons" },
      { label: "Access", value: "Allow-list only" },
      { label: "Licence", value: "MIT" }
    ],
    groups: [
      {
        title: "Set up from chat",
        items: [
          "/setup walks through provider, API key and model, and lists the models the provider offers.",
          "Providers: Agnes, Google Gemini, OpenAI, Anthropic, OpenRouter, or any OpenAI-compatible endpoint."
        ]
      },
      {
        title: "What the agent can do",
        items: [
          "Run Python in a sandbox. Risky commands show approval buttons instead of running silently.",
          "Keep Markdown notes in a vault folder that opens directly in Obsidian.",
          "Remember context with global and per-session memory, and load reusable skills.",
          "Search the web and use terminal tools, which are privileged and gated by the allow-list."
        ]
      },
      {
        title: "Safe by default",
        items: [
          "Only numeric user IDs on the allow-list can talk to the agent.",
          "Crash reporting to GitHub is off unless you turn it on.",
          "launch.py reinstalls dependencies only when requirements.txt changes."
        ]
      }
    ],
    stepsTitle: "Five-minute start",
    steps: [
      { title: "Create a bot", body: "Make a Discord or Telegram bot token." },
      { title: "Configure", body: "Copy .env.example to .env, then set GATEWAY, the token and your user ID." },
      { title: "Launch", body: "pip install -r requirements.txt, then python launch.py." },
      { title: "Set up the model", body: "In chat, send /setup and pick a provider, key and model. Send /help for the rest." }
    ],
    setup: [
      "Python 3.10 or newer.",
      "GATEWAY is discord or telegram, with the matching bot token.",
      "ALLOWED_DISCORD_IDS and/or ALLOWED_TELEGRAM_IDS hold the numeric IDs allowed to use it.",
      "Optional sandbox settings: SANDBOX_MODE, SANDBOX_TIMEOUT, SANDBOX_MAX_MEMORY_MB."
    ],
    reference: {
      title: "Commands",
      rows: [
        { name: "/setup", purpose: "Choose provider, API key and model." },
        { name: "/help", purpose: "Show usage help." },
        { name: "/reset", purpose: "Clear the current chat session." }
      ]
    },
    boundaries: [
      "It is a personal harness, not a hosted multi-user service.",
      "Sandbox isolation depends on the configured mode and host. A time or memory limit is not the same as OS-level isolation.",
      "Terminal, file and web tools carry real authority. Keep the allow-list on and read approval prompts before accepting.",
      "A provider key typed into chat can stay in message history if the message cannot be deleted."
    ],
    links: [
      { label: "Source on GitHub", href: "https://github.com/Aj-Niplex/NiPlex-Harness" },
      { label: "Setup guide", href: "https://github.com/Aj-Niplex/NiPlex-Harness/blob/main/docs/SETUP.md" }
    ],
    appCategory: "DeveloperApplication",
    repo: "https://github.com/Aj-Niplex/NiPlex-Harness"
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
    tagline: "The docs site for NiPlex-Harness.",
    summary:
      "A static landing and documentation site for NiPlex-Harness, with an agent-ready page that offers a copy-paste prompt so any AI assistant can walk a new user through setup.",
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
      "It documents the harness. It is not the agent runtime."
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
    "Never claim unfinished features are production-ready. NiPlex-MCP is private: do not describe its source code or infrastructure. Do not reveal private repositories, credentials, personal data or internal notes. If asked about private work, say the portfolio only documents public-facing information. Do not share or guess personal details such as age, school or contact information."
  );
  return lines.join(" ");
}
