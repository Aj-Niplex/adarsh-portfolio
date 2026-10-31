import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { KmHub } from "@/components/km/KmHub";
import { KmImage } from "@/components/km/KmImage";
import { pageMeta } from "@/lib/meta";
import { getProject, projects } from "@/lib/projects";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return { title: "Not found" };
  return pageMeta({
    title: p.name + ": " + p.tagline.replace(/\.$/, ""),
    description: p.summary,
    path: "/projects/" + p.slug,
    image: p.share
  });
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const url = SITE.url + "/projects/" + p.slug;
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": url + "#software",
        name: p.name,
        url,
        description: p.summary,
        ...(p.share ? { image: SITE.url + p.share.src } : {}),
        applicationCategory: p.appCategory,
        operatingSystem: "Cross-platform",
        author: { "@id": SITE.url + "/#person" },
        creator: { "@id": SITE.url + "/#person" },
        isAccessibleForFree: p.visibility === "public",
        ...(p.repo ? { sameAs: [p.repo], license: "https://opensource.org/license/mit" } : {})
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Projects", item: SITE.url + "/projects" },
          { "@type": "ListItem", position: 3, name: p.name, item: url }
        ]
      }
    ]
  };

  return (
    <main className="container page">
      <JsonLd data={graph} />
      <p className="crumbs"><Link href="/">Home</Link> / <Link href="/projects">Projects</Link> / {p.name}</p>

      <div className="page-head">
        <span className={"pill " + (p.visibility === "public" ? "pill-accent" : "")}>{p.status}</span>
        {p.tags.map((t) => <span className="pill" key={t}>{t}</span>)}
      </div>
      <h1>{p.name}</h1>
      <p className="lead">{p.tagline} {p.summary}</p>

      <div className="stat-strip" style={{ marginTop: 28, border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--surface)" }}>
        {p.stats.map((s) => (
          <div className="stat" key={s.label}>
            <span>{s.label}</span>
            <b>{s.value}</b>
          </div>
        ))}
      </div>

      {p.slug === "niplex-harness" && <KmHub />}

      <div className="layout-2">
        <div>
          <section className="block" style={{ borderTop: 0, paddingTop: 0 }}>
            <h2>What it does</h2>
            {p.groups.map((g) => {
              const fig = g.figure;
              const beside = fig && fig.item === undefined ? fig : null;
              const figure = (f: NonNullable<typeof fig>) => (
                <figure className="group-fig">
                  <KmImage id={f.id} alt={f.alt} />
                  <figcaption>{f.caption}</figcaption>
                </figure>
              );
              return (
                <div className="group" key={g.title}>
                  <h3>{g.title}</h3>
                  {beside && figure(beside)}
                  <ul className="list">
                    {g.items.map((item, i) => (
                      <li key={item} className={fig && fig.item === i ? "has-fig" : undefined}>
                        {item}
                        {fig && fig.item === i && figure(fig)}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>

          <section className="block">
            <h2>{p.stepsTitle}</h2>
            <div className="steps">
              {p.steps.map((s) => (
                <div className="step" key={s.title}>
                  <div>
                    <b>{s.title}</b>
                    <span>{s.body}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {p.reference && (
            <section className="block">
              <h2>{p.reference.title}</h2>
              <div className="table">
                {p.reference.rows.map((r) => (
                  <div className="trow" key={r.name}>
                    <code>{r.name}</code>
                    <span>{r.purpose}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {p.setup.length > 0 && (
            <section className="block">
              <h2>Setup</h2>
              <ul className="list">
                {p.setup.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </section>
          )}

          <section className="block">
            <h2>Boundaries</h2>
            <ul className="list">
              {p.boundaries.map((b) => <li key={b}>{b}</li>)}
            </ul>
          </section>
        </div>

        <aside className="aside">
          {p.logo && (
            <div className="aside-card">
              <Image src={p.logo.src} alt={p.logo.alt} width={240} height={p.logo.plain ? 240 : 160} style={{ width: "100%", height: "auto", borderRadius: "var(--radius)", ...(p.logo.plain ? {} : { background: "#fff" }) }} />
            </div>
          )}
          <div className="aside-card">
            <h3>Links</h3>
            {p.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer">{l.label} ↗</a>
            ))}
          </div>
          <div className="aside-card">
            <h3>By</h3>
            <p><Link href="/about"><strong>{SITE.name}</strong></Link> ({SITE.alias})</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
