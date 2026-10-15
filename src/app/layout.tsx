import type { Metadata } from "next";
import "./globals.css";
import { AIWidget } from "@/components/AIWidget";

export const metadata: Metadata = {
  metadataBase: new URL("https://adarsh-portfolio-aj-niplexs-projects.vercel.app"),
  title: "Adarsh Jaiswal | NiPlex",
  description: "Adarsh Jaiswal builds AI tools, agent workflows, and developer-first open-source projects.",
  keywords: ["Adarsh Jaiswal", "NiPlex", "AI agents", "MCP", "developer tools", "open source"],
  authors: [{ name: "Adarsh Jaiswal", url: "https://github.com/Aj-Niplex" }],
  openGraph: {
    title: "Adarsh Jaiswal | NiPlex",
    description: "AI systems, developer tools, and open-source experiments.",
    url: "https://adarsh-portfolio-aj-niplexs-projects.vercel.app",
    siteName: "NiPlex",
    locale: "en_IN",
    type: "website"
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="global-header"><div className="global-nav container"><a href="/" className="global-brand"><span className="brand-mark">N/</span><span><strong>NiPlex</strong><small>Adarsh Jaiswal</small></span></a><nav><a href="/projects">Projects</a><a href="/architecture">Architecture</a><a href="/about">About</a><a href="https://github.com/Aj-Niplex" target="_blank" rel="noreferrer">GitHub ↗</a></nav></div></header>
        {children}
        <footer className="global-footer"><div className="container global-footer-inner"><span>Adarsh Jaiswal · NiPlex</span><span>Public work, documented properly.</span><a href="/projects">All project dossiers ↗</a></div></footer>
        <AIWidget />
      </body>
    </html>
  );
}
