import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { forks, projects, projectsByTier, TIERS, type Tier } from "@/lib/projects";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "NiPlex-Harness, NiPlex-MCP, ThreadForge-MCP, Rei-kun-Bot and more: AI agent systems and MCP servers by Adarsh Jaiswal (AJ NiPlex).",
  alternates: { canonical: "/projects" }
};

const ORDER: Tier[] = ["core", "tools", "side"];

export default function ProjectsPage() {
  const list = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Projects by " + SITE.name + " (" + SITE.alias + ")",
    itemListElement: projects.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: SITE.url + "/projects/" + p.slug
    }))
  };

  return (
    <main className="container page">
      <JsonLd data={list} />
      <p className="crumbs"><Link href="/">Home</Link> / Projects</p>
      <h1>Projects</h1>
      <p className="lead">
        Two core systems and the public tools built around them. Each page says what the project does, how it works, how to run it, and where its limits are.
      </p>

      {ORDER.map((tier) => (
        <section className="section" key={tier}>
          <div className="section-head">
            <h2>{TIERS[tier].title}</h2>
            <p>{TIERS[tier].blurb}</p>
          </div>
          <div className="rows">
            {projectsByTier(tier).map((p) => (
              <Link href={"/projects/" + p.slug} className="row" key={p.slug}>
                <div className="row-main">
                  <h3>{p.name}</h3>
                  <p>{p.tagline} {p.summary}</p>
                </div>
                <div className="row-meta">
                  {p.logo && <Image className="row-logo" src={p.logo.src} alt={p.logo.alt} width={64} height={64} />}
                  <span className={"pill " + (p.visibility === "public" ? "pill-accent" : "")}>{p.status}</span>
                  {p.tags.slice(0, 3).map((t) => <span className="pill" key={t}>{t}</span>)}
                </div>
              </Link>
            ))}
            {tier === "side" &&
              forks.map((f) => (
                <a href={f.href} target="_blank" rel="noreferrer" className="row" key={f.name}>
                  <div className="row-main">
                    <h3>{f.name}</h3>
                    <p>{f.note}</p>
                  </div>
                  <div className="row-meta">
                    <span className="pill">Fork of {f.from}</span>
                  </div>
                </a>
              ))}
          </div>
        </section>
      ))}
    </main>
  );
}
