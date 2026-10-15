import Link from "next/link";
import { ArrowUpRight, BrainCircuit, Eye, ShieldCheck, Workflow } from "lucide-react";

export const metadata = { title: "About | Adarsh Jaiswal", description: "The ideas, product principles, and publication policy behind NiPlex." };

export default function AboutPage() {
  return <main className="container inner-page">
    <div className="section-label">ABOUT / PRINCIPLES</div>
    <h1 className="page-title">The thinking behind <span className="accent">the tools.</span></h1>
    <p className="page-lead">I build practical AI tools, agent workflows, and developer-first software under NiPlex. The goal is to make complex workflows inspectable and useful, rather than bolting a chatbot onto every screen and calling it innovation.</p>
    <div className="detail-grid about-detail-grid">
      <article className="detail-card"><BrainCircuit size={24}/><h2>AI with boundaries</h2><p>Provider adapters, bounded context, visible failure states, and explicit permission checks are part of the product, not optional polish.</p></article>
      <article className="detail-card"><Workflow size={24}/><h2>Systems that connect</h2><p>Agent harnesses, MCP servers, bots, and knowledge tools use clear interfaces so different clients can share capabilities.</p></article>
      <article className="detail-card"><Eye size={24}/><h2>Inspectability over hype</h2><p>Project dossiers trace the documented workflow, identify configuration requirements, and call out behavior that still needs independent verification.</p></article>
    </div>
    <section className="detail-section"><div className="section-label">PUBLICATION POLICY</div><h2>Detailed does not mean indiscriminate.</h2><p>This website documents public repositories and attributed upstream projects in depth. Personal vaults, saved data, private infrastructure, private development repositories, credentials, access tokens, and unpublished design notes are not copied into public pages.</p><p>A repository being accessible to its owner is not permission to publish its contents. A feature listed in a README also does not prove that the feature is stable in production. Dossiers therefore distinguish described capabilities, implementation notes, and limitations.</p><div className="architecture-callout"><ShieldCheck size={18}/><span>Upstream projects and forks are clearly attributed. They are not presented as original NiPlex products merely because a repository exists under the account.</span></div><Link className="button-primary" href="/projects">Read the full project dossiers <ArrowUpRight size={15}/></Link></section>
  </main>;
}
