import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import ScrollMorphHero from "@/components/ui/scroll-morph-hero";
import { heroItems } from "@/lib/heroItems";
import { forks, projects, projectsByTier, TIERS } from "@/lib/projects";
import { FACTS, HEADLINE, LEDE, META_DESCRIPTION, SERVICES, SITE } from "@/lib/site";

export default function Home() {
  const core = projectsByTier("core");
  const tools = projectsByTier("tools");
  const side = projectsByTier("side");
  const cards = heroItems();
  const toolGroups = cards.filter((c) => c.count).length;

  const profile = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": SITE.url + "/#profilepage",
    url: SITE.url,
    name: SITE.name + " (" + SITE.alias + ")",
    description: META_DESCRIPTION,
    mainEntity: { "@id": SITE.url + "/#person" },
    isPartOf: { "@id": SITE.url + "/#website" }
  };

  return (
    <main>
      <JsonLd data={profile} />
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">{SITE.alias} · {SITE.region}</p>
            <h1>{HEADLINE}</h1>
            <p className="lede">{LEDE}</p>
            <div className="hero-actions">
              <Link href="/projects" className="btn btn-primary">See the projects</Link>
              <a href={SITE.github} target="_blank" rel="noreferrer" className="btn">GitHub</a>
            </div>
          </div>
          <aside className="facts" aria-label="Quick facts">
            <div className="facts-title">At a glance</div>
            <dl>
              {FACTS.map((f) => (
                <div className="fact" key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>

      <ScrollMorphHero
        items={cards}
        intro="What I have built."
        hint="SCROLL TO EXPLORE"
        heading="Projects and tools"
        blurb={projects.length + " projects, plus the " + toolGroups + " groups of tools inside NiPlex-MCP. Scroll along the arc, hover a card to read more, then open it."}
      />

      <section className="section" id="core">
        <div className="container">
          <div className="section-head">
            <h2>{TIERS.core.title}</h2>
            <p>{TIERS.core.blurb}</p>
          </div>
          <div className="slabs">
            {core.map((p) => (
              <Link href={"/projects/" + p.slug} className="slab" key={p.slug}>
                <div className="slab-body">
                  <div className="slab-top">
                    <div className="slab-name">
                      {p.logo && <Image className="slab-logo" src={p.logo.src} alt="" width={56} height={56} />}
                      <h3>{p.name}</h3>
                    </div>
                    <span className={"pill " + (p.visibility === "public" ? "pill-accent" : "")}>{p.status}</span>
                  </div>
                  <p className="tagline">{p.tagline}</p>
                  <p className="summary">{p.summary}</p>
                  <span className="slab-link">Read how it works →</span>
                </div>
                <div className="stat-strip">
                  {p.stats.map((s) => (
                    <div className="stat" key={s.label}>
                      <span>{s.label}</span>
                      <b>{s.value}</b>
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="tools">
        <div className="container">
          <div className="section-head">
            <h2>{TIERS.tools.title}</h2>
            <p>{TIERS.tools.blurb}</p>
          </div>
          <div className="rows">
            {tools.map((p) => (
              <Link href={"/projects/" + p.slug} className="row" key={p.slug}>
                <div className="row-main">
                  <h3>{p.name}</h3>
                  <p>{p.tagline} {p.summary}</p>
                </div>
                <div className="row-meta">
                  {p.logo && <Image className={"row-logo" + (p.logo.plain ? " is-plain" : "")} src={p.logo.src} alt={p.logo.alt} width={64} height={64} />}
                  <span className="pill pill-accent">{p.status}</span>
                  {p.tags.slice(0, 3).map((t) => <span className="pill" key={t}>{t}</span>)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="services">
        <div className="container">
          <div className="section-head">
            <h2>What I build</h2>
            <p>The kinds of work these projects show I can do.</p>
          </div>
          <div className="services">
            {SERVICES.map((s, i) => (
              <div className="service" key={s.title}>
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="side">
        <div className="container">
          <div className="section-head">
            <h2>{TIERS.side.title}</h2>
            <p>{TIERS.side.blurb}</p>
          </div>
          <div className="rows">
            {side.map((p) => (
              <Link href={"/projects/" + p.slug} className="row" key={p.slug}>
                <div className="row-main">
                  <h3>{p.name}</h3>
                  <p>{p.tagline}</p>
                </div>
                <div className="row-meta">
                  {p.logo && <Image className={"row-logo" + (p.logo.plain ? " is-plain" : "")} src={p.logo.src} alt={p.logo.alt} width={64} height={64} />}
                  <span className="pill">{p.status}</span>
                </div>
              </Link>
            ))}
            {forks.map((f) => (
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
        </div>
      </section>

      <div className="container">
        <div className="cta-band">
          <div>
            <h2>Want to see the code?</h2>
            <p>Every public project is open source on GitHub.</p>
          </div>
          <a href={SITE.github} target="_blank" rel="noreferrer" className="btn btn-primary">Open GitHub profile</a>
        </div>
      </div>
    </main>
  );
}
