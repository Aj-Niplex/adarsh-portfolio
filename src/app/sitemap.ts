import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { SITE } from "@/lib/site";
import { getKm, kmUrl } from "@/lib/km/pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const priority = (tier: string) => (tier === "core" ? 0.9 : tier === "tools" ? 0.7 : 0.4);
  return [
    { url: SITE.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: SITE.url + "/projects", lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: SITE.url + "/about", lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    ...getKm().pages.map((p) => ({
      url: SITE.url + kmUrl(p.path),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: p.path.includes("/") ? 0.4 : 0.6
    })),
    ...projects.map((p) => ({
      url: SITE.url + "/projects/" + p.slug,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: priority(p.tier)
    }))
  ];
}
