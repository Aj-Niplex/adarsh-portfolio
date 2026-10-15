import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2, CircleAlert, GitBranch, ShieldCheck, Workflow } from "lucide-react";
import { projects } from "@/lib/projects";

export function generateStaticParams() {
  return projects.filter(p => p.slug).map(p => ({ slug: p.slug! }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find(p => p.slug === slug);
  return {
    title: project ? project.name + " | Project Dossier" : "Project Not Found | NiPlex",
    description: project?.description || "Public project dossier from NiPlex."
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projects.find(project => project.slug === slug);
  if (!p || !p.details) notFound();
  const d = p.details;

  return <main className="container inner-page dossier-page">
    <Link href="/projects" className="back-link"><ArrowLeft size={15}/> All project dossiers</Link>
    <div className="section-label">{p.eyebrow} / PROJECT DOSSIER</div>
    <h1 className="page-title">{p.name}<span className="accent">.</span></h1>
    <div className="detail-meta"><span className="project-status available">{p.status}</span><span>{p.tags.join(" · ")}</span></div>
    <p className="page-lead">{p.description}</p>
    {p.attribution && <div className="attribution-note large-note">{p.attribution}</div>}
    <div className="dossier-actions"><a className="button-primary" href={p.href} target="_blank" rel="noreferrer">Open source repository <ArrowUpRight size={15}/></a><Link className="button-secondary" href="/architecture"><Workflow size={15}/> Explore cross-project architecture</Link></div>

    <div className="dossier-layout">
      <article className="dossier-main">
        <section className="detail-section" id="purpose"><div className="section-label">01 / PURPOSE</div><h2>What this project is</h2><p>{d.purpose}</p></section>
        <section className="detail-section" id="features"><div className="section-label">02 / FEATURE INVENTORY</div><h2>Every documented capability</h2><p className="section-intro">This inventory expands the repository documentation into individual, explanatory items rather than compressing the project into a short card.</p><div className="full-feature-list">{d.features.map((feature:string,i:number)=><article className="full-feature" key={feature}><div className="feature-number">{String(i+1).padStart(2,"0")}</div><div><h3>{feature.split(":")[0]}</h3><p>{feature.includes(":") ? feature.slice(feature.indexOf(":")+1).trim() : feature}</p></div></article>)}</div></section>
        <section className="detail-section" id="architecture"><div className="section-label">03 / ARCHITECTURE</div><h2>How the pieces fit together</h2><p>{d.architecture}</p><div className="architecture-callout"><Workflow size={18}/><span>Architecture summary from public docs/source. Where a behavior is not established in the reviewed files, it is not filled in with guesswork.</span></div></section>
        <section className="detail-section" id="workflow"><div className="section-label">04 / END-TO-END FLOW</div><h2>How it works in practice</h2><div className="architecture-steps">{d.workflow.map((step:string,i:number)=><div className="architecture-step" key={step}><span>{String(i+1).padStart(2,"0")}</span><p>{step}</p></div>)}</div></section>
        {d.commands && <section className="detail-section" id="commands"><div className="section-label">05 / COMMAND REFERENCE</div><h2>Public commands</h2><div className="reference-table">{d.commands.map((cmd:{name:string;purpose:string})=><div className="reference-row" key={cmd.name}><code>{cmd.name}</code><p>{cmd.purpose}</p></div>)}</div></section>}
        {d.tools && <section className="detail-section" id="tools"><div className="section-label">05 / MCP TOOL REFERENCE</div><h2>Exposed tools</h2><div className="reference-table">{d.tools.map((tool:{name:string;purpose:string})=><div className="reference-row" key={tool.name}><code>{tool.name}</code><p>{tool.purpose}</p></div>)}</div></section>}
        <section className="detail-section" id="configuration"><div className="section-label">{d.commands || d.tools ? "06" : "05"} / CONFIGURATION</div><h2>Setup and configuration</h2><div className="config-list">{d.configuration.map((item:string,i:number)=><div className="config-item" key={item}><CheckCircle2 size={15}/><p>{item}</p></div>)}</div></section>
        <section className="detail-section" id="limitations"><div className="section-label">{d.commands || d.tools ? "07" : "06"} / LIMITATIONS</div><h2>Known boundaries and caveats</h2><div className="limit-list">{d.limits.map((item:string)=> <div className="limit-item" key={item}><CircleAlert size={15}/><p>{item}</p></div>)}</div></section>
        <section className="detail-section" id="source"><div className="section-label">SOURCE / VERIFICATION</div><h2>Keep reading at the source</h2><p>This dossier is a navigable explanation of the public repository, not a substitute for reading its code, configuration, tests, changelog, license, and issue history. Re-check upstream documentation before relying on a detail in a deployment.</p><div className="dossier-actions"><a className="button-primary" href={p.href} target="_blank" rel="noreferrer">Inspect complete repository <ArrowUpRight size={15}/></a><Link className="button-secondary" href="/projects">Back to project index</Link></div></section>
      </article>
      <aside className="dossier-sidebar">
        <div className="sidebar-card sticky-card"><ShieldCheck size={20}/><h3>Public-source boundary</h3><p>Only public-facing material is documented here. Private repositories, personal vaults, credentials, and unpublished implementation notes are not replicated on this site.</p><Link href="/about">Read publication policy <ArrowUpRight size={13}/></Link></div>
        <div className="sidebar-card"><div className="section-label">ON THIS PAGE</div><nav className="toc-nav"><a href="#purpose">Purpose</a><a href="#features">Feature inventory</a><a href="#architecture">Architecture</a><a href="#workflow">Workflow</a>{d.commands && <a href="#commands">Commands</a>}{d.tools && <a href="#tools">Tools</a>}<a href="#configuration">Configuration</a><a href="#limitations">Limitations</a><a href="#source">Source & verification</a></nav></div>
        <div className="sidebar-card"><GitBranch size={19}/><h3>Repository</h3><a href={p.href} target="_blank" rel="noreferrer">View on GitHub <ArrowUpRight size={13}/></a><div className="project-tags">{p.tags.map((tag:string)=><span className="project-tag" key={tag}>{tag}</span>)}</div></div>
      </aside>
    </div>
  </main>;
}
