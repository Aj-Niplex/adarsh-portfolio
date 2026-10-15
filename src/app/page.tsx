import Link from "next/link";
import { ArrowRight, ArrowUpRight, BrainCircuit, Bot, GitBranch, Network, Workflow, BookOpen, Layers } from "lucide-react";
import { AIWidget } from "@/components/AIWidget";
import { projects } from "@/lib/projects";

const iconFor = (slug: string) => {
  if (slug === "niplex-research-ai") return BrainCircuit;
  if (slug === "rei-kun-bot") return Bot;
  if (slug === "threadforge-mcp") return Network;
  if (slug === "niplex-harness") return Workflow;
  if (slug === "opendots") return Layers;
  return BookOpen;
};

export default function Home() {
  const featured = projects.filter(p => ["niplex-research-ai","niplex-harness","rei-kun-bot","threadforge-mcp"].includes(p.slug || ""));
  return <>
    <main className="container home-page">
      <section className="hero hero-multipage">
        <div className="hero-layout">
          <div>
            <div className="eyebrow"><span className="live-dot" /> Independent developer · NiPlex</div>
            <h1>Small ideas.<br/>Useful systems.<br/><span className="accent">Full breakdowns.</span></h1>
            <p className="hero-copy">I&apos;m Adarsh Jaiswal. I build AI tools, agent workflows, and developer-first software under NiPlex. This site is a detailed map of the public projects: what each one does, how its pieces work together, how to configure it, and where its limits are.</p>
            <div className="hero-actions">
              <Link className="button-primary" href="/projects">Explore all project dossiers <ArrowRight size={15}/></Link>
              <a className="button-secondary" href="https://github.com/Aj-Niplex" target="_blank" rel="noreferrer"><GitBranch size={15}/> GitHub profile <ArrowUpRight size={14}/></a>
            </div>
            <div className="hero-meta"><span><BookOpen size={13}/> Feature-level documentation</span><span><Network size={13}/> Architecture + workflows</span></div>
          </div>
          <div className="hero-console">
            <div className="hero-console-top"><span>niplex / project-index</span><span className="window-dots"><i/><i/><i/></span></div>
            <div className="console-content">
              <div className="console-kicker">Documentation policy</div>
              <div className="console-headline">Every public feature gets context. <span>Private data stays private.</span></div>
              <div className="console-row"><span>Scope</span><strong>Public repositories</strong></div>
              <div className="console-row"><span>Format</span><strong>Dedicated project dossiers</strong></div>
              <div className="console-row"><span>Evidence</span><strong>Docs + inspected source</strong></div>
              <div className="console-code"><div><span>$</span> map-repository --feature-level</div><div>known behavior: <span>documented</span></div><div>unknown behavior: <span>labelled</span></div><div>private source: <span>not published</span></div></div>
            </div>
            <div className="console-footer"><Layers size={14}/> Explore each project as its own page.</div>
          </div>
        </div>
      </section>
      <section className="section section-contained">
        <div className="section-heading"><div><div className="section-label">01 / Selected projects</div><h2>Go beyond the README.</h2></div><p>Dedicated pages cover feature inventories, architecture, request/data flows, setup, public tools or commands, and known limitations.</p></div>
        <div className="detail-grid">
          {featured.map(p => { const Icon = iconFor(p.slug || ""); return <article className="detail-card home-project" key={p.slug}><div className="project-top"><span className="project-icon"><Icon size={19}/></span><span className="project-status available">{p.status}</span></div><div className="project-eyebrow">{p.eyebrow}</div><h2>{p.name}</h2><p>{p.description}</p><div className="project-tags">{p.tags.slice(0,4).map(t=><span className="project-tag" key={t}>{t}</span>)}</div><Link className="project-action" href={"/projects/"+p.slug}>Read full dossier <ArrowUpRight size={14}/></Link></article>})}
        </div>
        <div className="center-action"><Link className="button-secondary" href="/projects">View all documented projects <ArrowRight size={15}/></Link></div>
      </section>
      <section className="section section-contained">
        <div className="section-heading"><div><div className="section-label">02 / How to read this site</div><h2>Documentation, not hype.</h2></div><p>Pages separate what repository documentation claims, what the inspected implementation indicates, and what still needs verification.</p></div>
        <div className="workflow-grid">
          <article className="workflow-card"><BookOpen size={21} className="workflow-icon"/><h3>Feature by feature</h3><p>Each capability gets a clear explanation, not a four-word card summary.</p></article>
          <article className="workflow-card"><Network size={21} className="workflow-icon"/><h3>Trace the workflow</h3><p>Follow the user request through providers, tools, storage, and returned results.</p></article>
          <article className="workflow-card"><GitBranch size={21} className="workflow-icon"/><h3>Inspect the source</h3><p>Every full dossier links back to its public repository and documents known caveats.</p></article>
        </div>
      </section>
      <section className="section section-contained">
        <div className="contact-panel"><div><div className="section-label">03 / About the build</div><h2>Full detail without leaking private work.</h2><p>The catalogue documents public repositories and attributed upstream projects. Personal vaults, private infrastructure, credentials, and unpublished implementation notes do not belong on a public portfolio.</p></div><div className="contact-actions"><Link className="button-primary" href="/about">Read about the approach <ArrowRight size={15}/></Link><Link className="button-secondary" href="/architecture">Explore architecture <ArrowUpRight size={14}/></Link></div></div>
      </section>
    </main>
    <AIWidget/>
  </>;
}
