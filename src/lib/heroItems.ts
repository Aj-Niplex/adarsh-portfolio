// Cards for the scroll hero. Everything here comes from the project data, so the cards can
// never say something the project pages do not say.
import { projects, TIERS } from "./projects";

export type HeroItem = {
  id: string;
  kicker: string;
  title: string;
  text: string;
  href: string;
  count?: string;
  countLabel?: string;
  logo?: { src: string; alt: string };
};

const GROUP = /^(.+?), (\d+) tools?: (.+)$/;

function sentence(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function heroItems(): HeroItem[] {
  const items: HeroItem[] = projects.map((p) => ({
    id: p.slug,
    kicker: TIERS[p.tier].title,
    title: p.name,
    text: p.tagline,
    href: "/projects/" + p.slug,
    logo: p.logo
  }));

  // The tool groups inside NiPlex-MCP, read from its "N tools in seven groups" list.
  const mcp = projects.find((p) => p.slug === "niplex-mcp");
  const groups = mcp?.groups[0]?.items ?? [];
  for (const line of groups) {
    const match = GROUP.exec(line);
    if (!match || !mcp) continue;
    items.push({
      id: "mcp-" + match[1].toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      kicker: "NiPlex-MCP",
      title: match[1],
      text: sentence(match[3]),
      href: "/projects/" + mcp.slug,
      count: match[2],
      countLabel: Number(match[2]) === 1 ? "tool" : "tools"
    });
  }
  return items;
}
