export type PortfolioProject = {
  name: string;
  eyebrow: string;
  description: string;
  tags: string[];
  status: string;
  href?: string;
  action?: string;
};

export const projects: PortfolioProject[] = [
  {
    name: "Niplex Research AI",
    eyebrow: "Obsidian plugin",
    description: "A mobile-first research companion for Obsidian. It searches relevant notes, reads bounded context, returns evidence-grounded answers, and keeps edits behind explicit approval.",
    tags: ["TypeScript", "Obsidian", "Gemini", "MCP-compatible tools"],
    status: "Public",
    href: "https://github.com/Aj-Niplex/Niplex-obsidian-Research-AI",
    action: "View repository"
  },
  {
    name: "ThreadForge MCP",
    eyebrow: "Multi-model chat server",
    description: "A conversational MCP server with persistent threads, model selection and fallback, bounded context compression, and reusable conversation artifacts.",
    tags: ["Python", "MCP", "LLM routing", "Markdown"],
    status: "Public prototype",
    href: "https://github.com/Aj-Niplex/ThreadForge-MCP",
    action: "View repository"
  },
  {
    name: "Rei-kun-Bot",
    eyebrow: "AI Discord bot",
    description: "A persona-driven Discord bot with multi-model fallback, conversation memory, a study-resource hub, custom emoji tools, and permission-aware admin commands.",
    tags: ["Python", "Discord.py", "OpenRouter", "Automation"],
    status: "Public",
    href: "https://github.com/Aj-Niplex/Rei-kun-Bot",
    action: "View repository"
  },
  {
    name: "KaizenManas",
    eyebrow: "Personal AI agent harness",
    description: "An in-development assistant designed to operate through chat, coordinate tools, and keep useful work close at hand. It is not a stable public release yet.",
    tags: ["Python", "Agent workflows", "Human approval", "Local-first notes"],
    status: "In development",
    action: "Explore safe feature preview"
  }
];

export const kaizenPreviewFeatures = [
  {
    title: "Chat-first control",
    description: "A personal assistant controlled from Discord or Telegram, with access gated to explicitly allowed users."
  },
  {
    title: "Model-provider choice",
    description: "A setup flow for configuring supported providers or compatible endpoints without rewriting the application."
  },
  {
    title: "Human approval",
    description: "Riskier actions can pause for an approve-or-deny decision inside chat instead of running silently."
  },
  {
    title: "Bounded code execution",
    description: "Python tasks can run through a resource-limited execution path, with environment values kept out of the agent's visible output."
  },
  {
    title: "Persistent memory",
    description: "Global and session notes, lightweight relationship links, and searchable saved context."
  },
  {
    title: "Files and knowledge vault",
    description: "A constrained workspace for working with files and Markdown notes, including an Obsidian-friendly vault."
  },
  {
    title: "Reusable skills",
    description: "Small, reusable instruction files that the assistant can create, review, and load for repeated workflows."
  },
  {
    title: "Web research",
    description: "Search and page reading with basic safeguards against prompt-injection patterns and unsafe destinations."
  },
  {
    title: "Scheduled read-only jobs",
    description: "Background tasks intended for retrieval and reporting, without unrestricted unattended write or execution access."
  },
  {
    title: "Sub-agents",
    description: "Delegate a focused subtask to a named helper and collect its report."
  }
];

export const publicPortfolioContext = [
  "Adarsh Jaiswal (NiPlex) is an independent developer focused on AI tools, agent workflows, developer tooling, and open source.",
  "Niplex Research AI is a public Obsidian plugin for bounded, evidence-grounded vault research with explicit approval for edits.",
  "ThreadForge MCP is a public prototype for multi-turn conversation threads, model selection and fallback, context compression, and conversation artifacts.",
  "Rei-kun-Bot is a public Python Discord bot with multi-model fallback, persona continuity, conversation memory, study resources, emoji management, and admin utilities.",
  "KaizenManas is in development and not a stable public release. Public preview themes: chat-first control, provider configuration, action approvals, bounded code execution, searchable memory, constrained files/vault, reusable skills, web research, scheduled read-only jobs, and sub-agents.",
  "Do not claim unreleased features are production-ready. Do not expose private repository names, source code, credentials, saved user data, personal notes, or internal implementation details. If asked about private work, say the portfolio only discusses public project summaries."
].join(" ");
