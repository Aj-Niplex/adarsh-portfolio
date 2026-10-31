import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // The API service is not a website, so it asks to be left out entirely.
  if (process.env.SERVICE_ROLE === "api") return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: SITE.url + "/sitemap.xml",
    host: SITE.url
  };
}
