import type { Metadata } from "next";
import { hasMarkdown, mdUrl } from "./mdPath";
import { SITE } from "./site";

/** The share picture used by link previews (LinkedIn, Slack, X, Discord): 1200 x 630. */
export const SHARE_IMAGE = {
  url: "/og/share.png",
  width: 1200,
  height: 630,
  alt: "Adarsh Jaiswal (AJ NiPlex): AI agents and MCP servers"
};

const DESCRIPTION_MIN = 70;
const DESCRIPTION_MAX = 160;
const TITLE_MAX = 60;

/**
 * A meta description that search results show in full: 70 to 160 characters.
 * A short one gets the first of `suffixes` that keeps it within 160 (list the longest first);
 * a long one is cut at the last sentence, or the last word, that fits.
 */
export function fitDescription(text: string, suffixes: string[] = []): string {
  let out = text.replace(/\s+/g, " ").trim();
  if (out.length < DESCRIPTION_MIN && suffixes.length) {
    const base = /[.!?]$/.test(out) ? out : out + ".";
    const pick = suffixes.find((s) => (base + " " + s).length <= DESCRIPTION_MAX) || suffixes[suffixes.length - 1];
    out = base + " " + pick;
  }
  if (out.length <= DESCRIPTION_MAX) return out;
  const head = out.slice(0, DESCRIPTION_MAX);
  const stop = Math.max(head.lastIndexOf(". "), head.lastIndexOf("? "), head.lastIndexOf("! "));
  if (stop + 1 >= DESCRIPTION_MIN) return head.slice(0, stop + 1);
  const cut = head.slice(0, DESCRIPTION_MAX - 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:\s]+$/, "") + "…";
}

/** The page title is followed by " · Adarsh Jaiswal"; keep the whole thing within 60 characters by dropping the label when it does not fit. */
export function fitTitle(title: string, label = ""): string {
  const tail = " · " + SITE.name;
  const withLabel = label ? title + " " + label : title;
  return withLabel.length + tail.length <= TITLE_MAX ? withLabel : title;
}

/**
 * Metadata for one page. Next replaces the whole openGraph object of the layout when a page sets
 * its own, so every field a share preview needs is written here for each route.
 */
export function pageMeta(input: {
  title: string;
  description: string;
  path: string;
  image?: { src: string; width: number; height: number; alt: string };
  descriptionSuffixes?: string[];
  /** Show the title without the " · Adarsh Jaiswal" tail, for a title that is already close to 60 characters. */
  titleAlone?: boolean;
}): Metadata {
  const shareTitle = input.title + " · " + SITE.name;
  const description = fitDescription(input.description, input.descriptionSuffixes);
  const image = input.image ? { url: input.image.src, width: input.image.width, height: input.image.height, alt: input.image.alt } : SHARE_IMAGE;
  return {
    title: input.titleAlone ? { absolute: input.title } : input.title,
    description,
    alternates: { canonical: input.path, ...(hasMarkdown(input.path) ? { types: { "text/markdown": mdUrl(input.path) } } : {}) },
    openGraph: {
      type: "website",
      siteName: SITE.alias,
      locale: "en_IN",
      url: SITE.url + input.path,
      title: shareTitle,
      description,
      images: [image]
    },
    twitter: { card: "summary_large_image", title: shareTitle, description, images: [image.url] }
  };
}
