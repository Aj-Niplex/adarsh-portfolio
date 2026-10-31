import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { KmShell } from "@/components/km/KmShell";
import { getKm, KM_BASE, pageText } from "@/lib/km/pages";
import { pageMeta } from "@/lib/meta";
import { SITE } from "@/lib/site";

export const dynamicParams = true;

export function generateStaticParams() {
  return getKm().pages.map((p) => ({ path: p.path.split("/") }));
}

const SHARE = { src: "/logos/kaizen-manas-share-wide.jpg", width: 1200, height: 630, alt: "Manas, the Kaizen Manas mascot, waving" };

export async function generateMetadata({ params }: { params: Promise<{ path: string[] }> }): Promise<Metadata> {
  const { path } = await params;
  const page = getKm().byPath.get(path.join("/"));
  if (!page) return { title: "Not found" };
  const description = (page.lead || page.summary).slice(0, 280);
  return pageMeta({ title: page.title + " (Kaizen Manas)", description, path: KM_BASE + "/" + page.path, image: SHARE });
}

export default async function KmPageRoute({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const km = getKm();
  const page = km.byPath.get(path.join("/"));
  if (!page) notFound();

  const url = SITE.url + KM_BASE + "/" + page.path;
  const crumbs = [{ name: "Home", item: SITE.url }, { name: "Projects", item: SITE.url + "/projects" }, { name: "NiPlex-Harness", item: SITE.url + KM_BASE }];
  const parts = page.path.split("/");
  for (let i = 1; i < parts.length; i++) {
    const p = km.byPath.get(parts.slice(0, i).join("/"));
    if (p) crumbs.push({ name: p.title, item: SITE.url + KM_BASE + "/" + p.path });
  }
  crumbs.push({ name: page.title, item: url });

  const graph: Record<string, unknown>[] = [
    {
      "@type": "TechArticle",
      "@id": url + "#article",
      headline: page.title,
      description: (page.lead || page.summary).slice(0, 300),
      url,
      inLanguage: "en",
      author: { "@id": SITE.url + "/#person" },
      about: { "@type": "SoftwareApplication", name: "Kaizen Manas (NiPlex-Harness)", url: SITE.url + KM_BASE }
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.item }))
    }
  ];
  if (page.path === "faq") {
    const entries = page.blocks.find((b) => b.t === "entries");
    if (entries && entries.t === "entries") {
      graph.push({
        "@type": "FAQPage",
        mainEntity: entries.items.map((e) => ({ "@type": "Question", name: e.title, acceptedAnswer: { "@type": "Answer", text: e.body } }))
      });
    }
  }
  void pageText;
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@graph": graph }} />
      <KmShell page={page} />
    </>
  );
}
