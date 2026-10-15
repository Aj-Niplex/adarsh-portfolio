import Link from "next/link";
import { ArrowUpRight, BookOpen, BrainCircuit, Bot, GitBranch, Layers, Network, Workflow } from "lucide-react";
import { projects } from "@/lib/projects";

const icons: Record<string, typeof BookOpen> = {
  "niplex-research-ai": BrainCircuit,
  "niplex-harness": Workflow,
  "rei-kun-bot": Bot,
  "threadforge-mcp": Network,
  "niplex-harness-site": BookOpen,
  "opendots": Layers
};

export const metadata = {
  title: "Project Dossiers | Adarsh Jaiswal",
  description: "Detailed feature, architecture, workflow, setup, and limitation breakdowns for public NiPlex projects."
};

export default function ProjectsPage() {
  return <main className="container inner-page">
    <div className="section-label">PROJECT INDEX / PUBLIC WORK</div>
    <h1 className="page-title">Projects, <span className="accent">in detail.</span></h1>
    <p className="page-lead">Each dossier explains what the repository is for, what its documented features do, how components work together, how to configure it, and what caveats to know before deploying it. Private repositories and personal data are not included.</p>
    <div className="index-meta"><span><BookOpen size={14}/> {projects.length} detailed dossiers</span><span><GitBranch size={14}/> Direct source links</span><span><Network size={14}/> Architecture + workflows</span></div>
    <div className="detail-grid">
      {projects.filter(p=>p.slug).map((p) => {
        const Icon = icons[p.slug || ""] || BookOpen;
        return <article className="detail-card index-project" key={p.slug}>
          <div className="project-top"><span className="project-icon"><Icon size={20}/></span><span className="project-status available">{p.status}</span></div>
          <div className="project-eyebrow">{p.eyebrow}</div><h2>{p.name}</h2><p>{p.description}</p>
          {p.attribution && <p className="attribution-note">{p.attribution}</p>}
          <div className="project-tags">{p.tags.map(t=><span className="project-tag" key={t}>{t}</span>)}</div>
          <div className="detail-card-actions"><Link className="project-action" href={"/projects/"+p.slug}>Open full dossier <ArrowUpRight size={14}/></Link><a className="project-action subdued" href={p.href} target="_blank" rel="noreferrer">Source repo <GitBranch size={13}/></a></div>
        </article>
      })}
    </div>
    <div className="scope-note"><strong>Evidence standard.</strong> Pages are based on publicly available README/docs and selected implementation files. Documented features are distinguished from independently verified behavior. Repository source is the final authority, not the portfolio summary.</div>
  </main>;
}
