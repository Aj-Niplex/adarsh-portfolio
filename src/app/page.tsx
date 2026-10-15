"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  BrainCircuit,
  Boxes,
  Code2,
  ExternalLink,
  FlaskConical,
  GitBranch,
  Globe2,
  HeartHandshake,
  Menu,
  Network,
  ShieldCheck,
  Sparkles,
  Workflow,
  X
} from "lucide-react";
import { AIWidget } from "@/components/AIWidget";
import { projects, kaizenPreviewFeatures } from "@/lib/projects";

const focusAreas = [
  { icon: BrainCircuit, label: "Practical AI systems" },
  { icon: Workflow, label: "Agent workflows" },
  { icon: Code2, label: "Developer tooling" },
  { icon: Boxes, label: "Open-source building" }
];

const principles = [
  {
    number: "01",
    title: "Build with clear boundaries",
    detail: "Tools should have a visible purpose, a sensible scope, and a human decision point when it matters."
  },
  {
    number: "02",
    title: "Make progress inspectable",
    detail: "Useful software explains what it can do, what it cannot do, and when a feature is still experimental."
  },
  {
    number: "03",
    title: "Keep private work private",
    detail: "A public portfolio is a curated window, not a synchronized dump of every repository on GitHub."
  }
];

const workflows = [
  {
    icon: Network,
    title: "Bound the context",
    description: "Research should pull in the relevant information, not shovel an entire workspace into every model request."
  },
  {
    icon: HeartHandshake,
    title: "Keep people in the loop",
    description: "When an action has consequences, clear previews and explicit decisions beat mysterious automation."
  },
  {
    icon: FlaskConical,
    title: "Label experiments honestly",
    description: "A prototype can be interesting without pretending to be a polished release. Status labels are part of the product."
  }
];

const technologies = [
  "Python",
  "TypeScript",
  "JavaScript",
  "React",
  "Next.js",
  "MCP",
  "LLM APIs",
  "Obsidian",
  "GitHub",
  "Discord & Telegram"
];

function ProjectIcon({ name }: { name: string }) {
  if (name === "Niplex Research AI") return <BrainCircuit size={19} />;
  if (name === "ThreadForge MCP") return <Workflow size={19} />;
  if (name === "Rei-kun-Bot") return <Bot size={19} />;
  return <Sparkles size={19} />;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const navItems = [
    { href: "#about", label: "About" },
    { href: "#projects", label: "Projects" },
    { href: "#approach", label: "Approach" },
    { href: "#stack", label: "Stack" },
    { href: "#contact", label: "Contact" }
  ];

  return (
    <div className="site-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="grid-texture" aria-hidden="true" />

      <header className="site-header">
        <div className="container nav-inner">
          <a href="#" className="brand" aria-label="NiPlex portfolio home">
            <span className="brand-mark">N/</span>
            <span>
              <span className="brand-name">Adarsh Jaiswal</span>
              <span className="brand-caption">Independent builder · NiPlex</span>
            </span>
          </a>

          <nav className={"nav-links " + (menuOpen ? "is-open" : "")} aria-label="Main navigation">
            {navItems.map((item) => (
              <a href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="nav-right">
            <a className="nav-github" href="https://github.com/Aj-Niplex" target="_blank" rel="noreferrer">
              <GitBranch size={15} />
              <span>GitHub profile</span>
              <ArrowUpRight size={13} />
            </a>
            <button
              type="button"
              className="mobile-menu-button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero container">
          <div className="hero-layout">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="eyebrow"><span className="live-dot" /> Curious by default. Building in public.</div>
              <h1>
                Small ideas.<br />
                Useful systems.<br />
                <span className="accent">Less busywork.</span>
              </h1>
              <p className="hero-copy">
                I&apos;m <strong>Adarsh Jaiswal</strong>, building AI tools, agent workflows, and
                developer-first software under <strong>NiPlex</strong>. I care about tools that
                are actually useful, clear about their limits, and easier to work with than the
                problem they solve.
              </p>
              <div className="hero-actions">
                <a href="#projects" className="button-primary">
                  Explore projects <ArrowDownRight size={16} />
                </a>
                <a href="https://github.com/Aj-Niplex" className="button-secondary" target="_blank" rel="noreferrer">
                  <GitBranch size={15} /> Browse GitHub <ArrowUpRight size={14} />
                </a>
              </div>
              <div className="hero-meta">
                <span><Code2 size={13} /> Backend & product tooling</span>
                <span><BrainCircuit size={13} /> AI and agents</span>
                <span><Globe2 size={13} /> Open source</span>
              </div>
            </motion.div>

            <motion.div
              className="hero-console"
              initial={{ opacity: 0, y: 18, rotate: 2 }}
              animate={{ opacity: 1, y: 0, rotate: 0.6 }}
              transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
              aria-label="A visual summary of the developer's work"
            >
              <div className="hero-console-top">
                <span>niplex / workspace</span>
                <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>
              </div>
              <div className="console-content">
                <div className="console-kicker">Current interests</div>
                <div className="console-headline">Make the complex feel <span>manageable.</span></div>
                <div className="console-row"><span>01 / Research</span><strong>Relevant context, not everything</strong></div>
                <div className="console-row"><span>02 / Agents</span><strong>Tools with clear boundaries</strong></div>
                <div className="console-row"><span>03 / Products</span><strong className="green-text">Built · tested · refined</strong></div>
                <div className="console-code">
                  <div><span>$</span> inspect --public-projects</div>
                  <div>private work: <span>excluded</span></div>
                  <div>release status: <span>honest</span></div>
                  <div>next step: <span>keep building_</span></div>
                </div>
              </div>
              <div className="console-footer"><ShieldCheck size={14} /> Curated on purpose, not a repo firehose.</div>
            </motion.div>
          </div>
        </section>

        <section className="section" id="about">
          <div className="container">
            <div className="section-heading">
              <div>
                <div className="section-label">01 / About</div>
                <h2>Tools over theatre.</h2>
              </div>
              <p>
                I like building systems that remove friction: assistants that use tools carefully,
                research workflows that keep context bounded, and software that gives people control.
              </p>
            </div>

            <div className="about-grid">
              <article className="about-card">
                <h3>What I&apos;m interested in</h3>
                <p>
                  The useful middle ground between a clever demo and a dependable tool. That means
                  practical AI integrations, small interfaces that stay out of the way, and thoughtful
                  boundaries around data and actions.
                </p>
                <div className="focus-list">
                  {focusAreas.map(({ icon: Icon, label }) => (
                    <div className="focus-chip" key={label}><Icon size={15} /> {label}</div>
                  ))}
                </div>
              </article>

              <article className="about-card">
                <h3>How I try to build</h3>
                <div className="principles">
                  {principles.map((principle) => (
                    <div className="principle" key={principle.number}>
                      <div className="principle-number">{principle.number}</div>
                      <div>
                        <strong>{principle.title}</strong>
                        <span>{principle.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="projects">
          <div className="container">
            <div className="section-heading">
              <div>
                <div className="section-label">02 / Selected work</div>
                <h2>Built, not just imagined.</h2>
              </div>
              <p>
                A deliberately short list. These entries link to public repositories; anything
                private, personal, or not ready for a reveal stays off the shelf.
              </p>
            </div>

            <div className="project-grid">
              {projects.map((project) => {
                const isPreview = project.name === "KaizenManas";
                const isPublic = Boolean(project.href);
                const statusClass = isPreview ? "preview" : "available";

                return (
                  <motion.article
                    className="project-card"
                    key={project.name}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="project-top">
                      <div className="project-icon"><ProjectIcon name={project.name} /></div>
                      <span className={"project-status " + statusClass}>
                        <i className="status-dot" /> {project.status}
                      </span>
                    </div>
                    <div className="project-eyebrow">{project.eyebrow}</div>
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    <div className="project-tags">
                      {project.tags.map((tag) => <span className="project-tag" key={tag}>{tag}</span>)}
                    </div>
                    <div className="project-actions">
                      {isPublic && project.href ? (
                        <a className="project-action" href={project.href} target="_blank" rel="noreferrer">
                          {project.action} <ExternalLink size={13} />
                        </a>
                      ) : (
                        <button className="project-action" onClick={() => setShowPreview((value) => !value)}>
                          {showPreview ? "Hide feature preview" : "Explore safe feature preview"}
                          <ArrowUpRight size={14} />
                        </button>
                      )}
                      {isPreview ? (
                        <span className="project-action subdued"><FlaskConical size={13} /> Work in progress</span>
                      ) : (
                        <span className="project-action subdued">Read the code <ArrowUpRight size={12} /></span>
                      )}
                    </div>
                  </motion.article>
                );
              })}

              <AnimatePresence initial={false}>
                {showPreview && (
                  <motion.div
                    className="preview-panel"
                    key="kaizen-preview"
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: 7, height: 0 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                  >
                    <div className="preview-panel-top">
                      <div>
                        <div className="section-label">Concept preview · Not a release promise</div>
                        <h3>KaizenManas / NiPlex Harness</h3>
                        <p>
                          A personal, chat-first AI harness in active development. The preview below
                          describes the broad product direction only, not a guarantee that each feature
                          is stable or available to the public.
                        </p>
                      </div>
                      <span className="project-status preview"><i className="status-dot" /> In development</span>
                    </div>
                    <div className="preview-grid">
                      {kaizenPreviewFeatures.map((feature) => (
                        <article className="preview-feature" key={feature.title}>
                          <h4>{feature.title}</h4>
                          <p>{feature.description}</p>
                        </article>
                      ))}
                    </div>
                    <div className="preview-warning">
                      <ShieldCheck size={15} />
                      This is a high-level preview. Capabilities, controls, and safeguards are still being
                      evaluated; do not treat this as a finished or security-certified product. Private
                      development code and internal implementation details are intentionally not linked.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        <section className="section" id="approach">
          <div className="container">
            <div className="section-heading">
              <div>
                <div className="section-label">03 / Approach</div>
                <h2>Useful by design.</h2>
              </div>
              <p>
                A few principles that shape the work, especially when AI is involved and a confident
                answer is not automatically a correct one.
              </p>
            </div>
            <div className="workflow-grid">
              {workflows.map(({ icon: Icon, title, description }, index) => (
                <article className="workflow-card" key={title}>
                  <div className="workflow-icon"><Icon size={21} /></div>
                  <div className="project-eyebrow">Principle 0{index + 1}</div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="stack">
          <div className="container">
            <div className="section-heading">
              <div>
                <div className="section-label">04 / Tools I work with</div>
                <h2>The building blocks.</h2>
              </div>
              <p>Technologies that show up across the public projects and current product experiments.</p>
            </div>
            <div className="stack-list">
              {technologies.map((technology) => <span className="stack-pill" key={technology}>{technology}</span>)}
            </div>
          </div>
        </section>

        <section className="section" id="contact">
          <div className="container">
            <div className="contact-panel">
              <div>
                <div className="section-label">05 / Contact & open source</div>
                <h2>Found something interesting?</h2>
                <p>
                  Browse the public work, inspect the code, or follow along as projects mature.
                  The AI bubble in the corner can also answer questions about the projects when it is configured.
                </p>
              </div>
              <div className="contact-actions">
                <a className="button-primary" href="https://github.com/Aj-Niplex" target="_blank" rel="noreferrer">
                  <GitBranch size={15} /> GitHub profile <ArrowUpRight size={14} />
                </a>
                <a className="button-secondary" href="https://github.com/Aj-Niplex?tab=repositories" target="_blank" rel="noreferrer">
                  Public repositories <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <a href="#" className="footer-note"><span className="brand-mark">N/</span> <span>Adarsh Jaiswal · NiPlex</span></a>
          <div className="footer-links">
            <a href="https://github.com/Aj-Niplex" target="_blank" rel="noreferrer">GitHub</a>
            <a href="#projects">Projects</a>
            <span>Never stop imagining.</span>
          </div>
        </div>
      </footer>

      <AIWidget />
    </div>
  );
}
