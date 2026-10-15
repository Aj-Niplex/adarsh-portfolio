import Link from "next/link";
import { ArrowUpRight, Boxes, BrainCircuit, Cloud, Database, GitBranch, MessageSquare, ShieldCheck, Workflow } from "lucide-react";

export const metadata = { title: "Architecture | NiPlex", description: "How public NiPlex project categories fit together, with clear boundaries between tools and products." };

const layers = [
  {n:"01",icon:MessageSquare,title:"User interfaces",body:"Discord and Telegram gateways for NiPlex Harness; Discord commands and embeds for Rei-kun-Bot; Obsidian's mobile-first plugin view for Research AI; and MCP client connections for ThreadForge."},
  {n:"02",icon:BrainCircuit,title:"Agent and model orchestration",body:"Provider setup and model selection route requests to configured AI endpoints. Where documented, projects have fallback or cooldown behavior; exact model availability remains provider- and version-dependent."},
  {n:"03",icon:Workflow,title:"Tools and permission boundaries",body:"Vault search/read/edit tools, resource commands, emoji administration, sandboxed execution, terminal tools, web search, and MCP tools have distinct responsibilities. Human approvals and user/admin allowlists matter most where tools can write or execute."},
  {n:"04",icon:Database,title:"Persistence and knowledge",body:"Research AI uses local Markdown chat history and skills in the Obsidian vault. ThreadForge stores thread metadata, messages, summaries, and artifacts via a configurable GitHub-backed storage path. Rei-kun-Bot documents JSON storage for state/resources."},
  {n:"05",icon:Cloud,title:"Deployment and hosting",body:"The Harness launcher targets local and Python hosts, its companion public documentation site is static, and ThreadForge exposes an MCP server. Each deployment still needs its own provider credentials, bot tokens, and access settings."}
];

export default function ArchitecturePage() {
  return <main className="container inner-page">
    <div className="section-label">ARCHITECTURE / SYSTEM MAP</div>
    <h1 className="page-title">From message to <span className="accent">useful result.</span></h1>
    <p className="page-lead">These projects are separate tools, not one giant shared runtime. This page maps their common design patterns while keeping each repository's actual boundaries visible.</p>
    <div className="architecture-stack">
      {layers.map((layer)=><article className="architecture-layer" key={layer.n}><div className="architecture-layer-icon"><layer.icon size={21}/></div><div><div className="section-label">LAYER {layer.n}</div><h2>{layer.title}</h2><p>{layer.body}</p></div></article>)}
    </div>
    <section className="detail-section"><div className="section-label">CROSS-PROJECT FLOWS</div><h2>What a typical request does</h2><div className="architecture-steps">
      <div className="architecture-step"><span>01</span><p><strong>Receive intent.</strong> A user asks through the project’s configured UI: Obsidian, Discord, Telegram, or an MCP client.</p></div>
      <div className="architecture-step"><span>02</span><p><strong>Apply context limits.</strong> The project gathers only the history, notes, or data its workflow calls for, where such bounds are implemented.</p></div>
      <div className="architecture-step"><span>03</span><p><strong>Choose model and tools.</strong> The runtime routes to a configured provider and exposes only its available tool contracts.</p></div>
      <div className="architecture-step"><span>04</span><p><strong>Check authority.</strong> Allowlists and permission checks gate privileged commands; write/execute operations should use review or approval where provided.</p></div>
      <div className="architecture-step"><span>05</span><p><strong>Return and persist.</strong> The UI shows an answer/result, and projects with storage enabled preserve the appropriate conversation, notes, resources, or artifacts.</p></div>
    </div></section>
    <section className="detail-section"><div className="section-label">SECURITY MODEL</div><h2>Shared themes, separate trust boundaries.</h2><div className="detail-grid">
      <article className="detail-card"><ShieldCheck size={22}/><h3>Credentials</h3><p>Provider keys and bot tokens belong in environment variables or supported secret storage, never in public source files.</p></article>
      <article className="detail-card"><Boxes size={22}/><h3>Tool access</h3><p>A chat interface does not itself make a tool safe. File writes, web access, terminal execution, and administration must be scoped deliberately.</p></article>
      <article className="detail-card"><GitBranch size={22}/><h3>Source is project-specific</h3><p>Each dossier links to the repository that implements that system. Similar concepts do not imply the projects share a codebase.</p></article>
    </div></section>
    <p className="page-note">This is a conceptual map assembled from public documentation and selected implementation files, not a claim that all projects are integrated together or that their security has been independently audited.</p>
    <Link href="/projects" className="button-primary">Open project dossiers <ArrowUpRight size={15}/></Link>
  </main>;
}
