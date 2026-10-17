import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { FACTS, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Adarsh Jaiswal, also known as AJ NiPlex: an independent developer in India who builds AI agent systems and Model Context Protocol (MCP) servers.",
  alternates: { canonical: "/about" }
};

export default function AboutPage() {
  const about = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": SITE.url + "/about#page",
    url: SITE.url + "/about",
    name: "About " + SITE.name + " (" + SITE.alias + ")",
    mainEntity: { "@id": SITE.url + "/#person" }
  };

  return (
    <main className="container page">
      <JsonLd data={about} />
      <p className="crumbs"><Link href="/">Home</Link> / About</p>
      <div className="page-head">
        <Image className="about-mark" src="/logos/adarsh-mark.jpeg" alt="AJ NiPlex monogram" width={120} height={120} />
      </div>
      <h1>About</h1>
      <p className="lead">{SITE.name}, also known as {SITE.alias}, is an independent developer in India who builds AI agent systems and MCP servers.</p>

      <div className="layout-2">
        <div className="prose">
          <p>
            <strong>What I do.</strong> I build agents that people can run and control from the apps they already use, and servers that give AI clients real tools. NiPlex-Harness is a personal agent you drive from Discord or Telegram. NiPlex-MCP is a Model Context Protocol server that puts 73 tools behind one authenticated connection.
          </p>
          <p>
            <strong>How I work.</strong> Backend and agents first. Chat apps are the interface. Context is bounded, permissions are explicit, and anything that can write or run code waits for approval. I ship working systems and then improve them.
          </p>
          <p>
            <strong>A correction, since it comes up.</strong> Niplex Research AI, an Obsidian plugin, is a side project I built for my own notes and published. It is the most visible thing in some search results, but it is not the main body of my work. The main work is NiPlex-Harness and NiPlex-MCP.
          </p>
          <p>
            <strong>Public and private.</strong> This site describes public repositories and, for NiPlex-MCP, what the private system does. Credentials, private repositories and personal data are not published. OpenDots is a fork of CopilotKit&apos;s project and is labelled as such.
          </p>
          <p>
            <strong>Find me.</strong> <a href={SITE.github} target="_blank" rel="noreferrer" style={{ color: "var(--accent-text)" }}>github.com/Aj-Niplex</a>. The same facts in plain text for AI assistants are at <a href="/llms.txt" style={{ color: "var(--accent-text)" }}>/llms.txt</a>.
          </p>
        </div>

        <aside className="aside">
          <div className="facts">
            <div className="facts-title">Facts</div>
            <dl>
              {FACTS.map((f) => (
                <div className="fact" key={f.label} style={{ gridTemplateColumns: "1fr" }}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </main>
  );
}
