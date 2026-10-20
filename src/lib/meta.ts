import type { Metadata } from "next";
import { SITE } from "./site";

const IMAGE = { url: "/logos/niplex-logo.png", width: 550, height: 454, alt: "NiPlex logo" };

/**
 * Metadata for one page. Next replaces the whole openGraph object of the layout when a page sets
 * its own, so every field a share preview needs is written here for each route.
 */
export function pageMeta(input: { title: string; description: string; path: string; image?: { src: string; width: number; height: number; alt: string } }): Metadata {
  const shareTitle = input.title + " · " + SITE.name;
  const image = input.image ? { url: input.image.src, width: input.image.width, height: input.image.height, alt: input.image.alt } : IMAGE;
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: input.path },
    openGraph: {
      type: "website",
      siteName: SITE.alias,
      locale: "en_IN",
      url: SITE.url + input.path,
      title: shareTitle,
      description: input.description,
      images: [image]
    },
    twitter: { card: "summary", title: shareTitle, description: input.description, images: [image.url] }
  };
}
