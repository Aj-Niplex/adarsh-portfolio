export const SITE = {
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://aj-niplex.vercel.app").replace(/\/$/, ""),
  name: "Adarsh Jaiswal",
  alias: "AJ NiPlex",
  handle: "Aj-Niplex",
  brand: "NiPlex",
  tagline: "Never Stop Imagining",
  role: "AI agent and MCP developer",
  region: "India",
  github: "https://github.com/Aj-Niplex",
  obsidian: "https://community.obsidian.md/users/aj-niplex",
  profileRepo: "https://github.com/Aj-Niplex/Aj-Niplex",
  portfolioRepo: "https://github.com/Aj-Niplex/adarsh-portfolio",
  pagesSite: "https://aj-niplex.github.io"
} as const;

export const PORTFOLIOS = [
  { label: "GitHub profile", href: SITE.profileRepo, note: "Profile README and agent.md: the short version of who I am and what I build" },
  { label: "Portfolio source", href: SITE.portfolioRepo, note: "The code for this site" },
  { label: "GitHub Pages site", href: SITE.pagesSite, note: "The earlier site, with product pages and a resume" }
] as const;

export const NAV = [
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" }
] as const;

export const HEADLINE = "I build AI agents and MCP servers.";

export const LEDE =
  "I'm Adarsh Jaiswal, also known as AJ NiPlex. NiPlex-Harness runs a personal AI agent from Discord or Telegram. NiPlex-MCP puts 73 tools behind one Model Context Protocol connection.";

export const META_DESCRIPTION =
  "Adarsh Jaiswal (AJ NiPlex) builds AI agent systems and Model Context Protocol (MCP) servers: NiPlex-Harness, NiPlex-MCP, ThreadForge-MCP and Rei-kun-Bot.";

export const SERVICES = [
  {
    title: "Discord and Telegram AI bots",
    body: "Chat-first assistants with model fallback, memory, permissions and admin tools. Rei-kun-Bot and NiPlex-Harness are working examples."
  },
  {
    title: "MCP servers and tool integrations",
    body: "A Model Context Protocol server that gives any MCP-capable AI client the tools it needs, with allow-listed dispatch and key-based access."
  },
  {
    title: "Agent sandboxes with human approval",
    body: "Code execution and file access that pause for an explicit approve or deny, so an agent can do real work without running unchecked."
  }
] as const;

export const FACTS: { label: string; value: string }[] = [
  { label: "Name", value: "Adarsh Jaiswal" },
  { label: "Also known as", value: "AJ NiPlex, Aj-Niplex" },
  { label: "Brand", value: "NiPlex" },
  { label: "Based in", value: "India" },
  { label: "Focus", value: "AI agent systems, MCP servers, Discord and Telegram agents" },
  { label: "Main products", value: "NiPlex-Harness, NiPlex-MCP" },
  { label: "Also built", value: "ThreadForge-MCP, Rei-kun-Bot, Niplex Research AI (Obsidian plugin)" },
  { label: "Working style", value: "Backend and agents first, mobile-first, explicit approvals" }
];
