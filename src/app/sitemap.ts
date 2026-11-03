import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { SITE } from "@/lib/site";
import { getKm, kmUrl } from "@/lib/km/pages";

// No lastModified on purpose: a date that changes on every deploy, whether or not a page changed,
// teaches search engines to ignore it. Bing is told about real changes through IndexNow instead.
export default function sitemap(): MetadataRoute.Sitemap {
  const priority = (tier: string) => (tier === "core" ? 0.9 : tier === "tools" ? 0.7 : 0.4);
  return [
    { url: SITE.url, changeFrequency: "monthly", priority: 1 },
    { url: SITE.url + "/projects", changeFrequency: "monthly", priority: 0.8 },
    { url: SITE.url + "/about", changeFrequency: "yearly", priority: 0.6 },
    { url: SITE.url + "/privacy", changeFrequency: "yearly", priority: 0.3 },
    ...getKm().pages.map((p) => ({
      url: SITE.url + kmUrl(p.path),
      changeFrequency: "monthly" as const,
      priority: p.path.includes("/") ? 0.4 : 0.6
    })),
    ...projects.map((p) => ({
      url: SITE.url + "/projects/" + p.slug,
      changeFrequency: "monthly" as const,
      priority: priority(p.tier)
    }))
  ];
}
