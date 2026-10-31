import type { Metadata, Viewport } from "next";
import {
  Chakra_Petch,
  Fira_Code,
  Inter,
  JetBrains_Mono,
  Newsreader,
  Orbitron,
  Plus_Jakarta_Sans,
  Space_Mono,
  Syne
} from "next/font/google";
import "./globals.css";
import { AssistantGate } from "@/components/AssistantGate";
import { JsonLd } from "@/components/JsonLd";
import { Footer, Header } from "@/components/SiteChrome";
import { META_DESCRIPTION, SITE } from "@/lib/site";

const specDisplay = Chakra_Petch({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--f-spec-display", display: "swap" });
const specBody = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--f-spec-body", display: "swap" });
const specMono = JetBrains_Mono({ subsets: ["latin"], variable: "--f-spec-mono", display: "swap" });

const noirDisplay = Syne({ subsets: ["latin"], variable: "--f-noir-display", display: "swap", preload: false });
const noirBody = Newsreader({ subsets: ["latin"], variable: "--f-noir-body", display: "swap", preload: false });
const noirMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--f-noir-mono", display: "swap", preload: false });

const cockpitDisplay = Orbitron({ subsets: ["latin"], variable: "--f-cockpit-display", display: "swap", preload: false });
const cockpitBody = Inter({ subsets: ["latin"], variable: "--f-cockpit-body", display: "swap", preload: false });
const cockpitMono = Fira_Code({ subsets: ["latin"], variable: "--f-cockpit-mono", display: "swap", preload: false });

const fontVars = [
  specDisplay, specBody, specMono,
  noirDisplay, noirBody, noirMono,
  cockpitDisplay, cockpitBody, cockpitMono
].map((f) => f.variable).join(" ");

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name + " (" + SITE.alias + ") · AI agents and MCP servers",
    template: "%s · " + SITE.name
  },
  description: META_DESCRIPTION,
  applicationName: SITE.alias,
  authors: [{ name: SITE.name, url: SITE.github }],
  creator: SITE.name,
  keywords: ["Adarsh Jaiswal", "AJ NiPlex", "Aj-Niplex", "NiPlex", "NiPlex-Harness", "NiPlex-MCP", "MCP server", "Model Context Protocol", "AI agents"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.alias,
    locale: "en_IN",
    url: SITE.url,
    title: SITE.name + " (" + SITE.alias + ")",
    description: META_DESCRIPTION,
    images: [{ url: "/logos/niplex-logo.png", width: 550, height: 454, alt: "NiPlex logo" }]
  },
  twitter: { card: "summary", title: SITE.name + " (" + SITE.alias + ")", description: META_DESCRIPTION, images: ["/logos/niplex-logo.png"] },
  icons: { icon: "/logos/niplex-logo.png", apple: "/logos/niplex-logo.png" },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4efe7" },
    { media: "(prefers-color-scheme: dark)", color: "#080707" }
  ]
};

const personId = SITE.url + "/#person";

const identity = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": SITE.url + "/#website",
      url: SITE.url,
      name: SITE.name + " (" + SITE.alias + ")",
      description: META_DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": personId }
    },
    {
      "@type": "Person",
      "@id": personId,
      name: SITE.name,
      alternateName: [SITE.alias, SITE.handle, SITE.brand],
      url: SITE.url,
      image: SITE.url + "/logos/adarsh-mark.jpeg",
      jobTitle: "AI agent and MCP developer",
      description:
        "Independent developer in India who builds AI agent systems and Model Context Protocol (MCP) servers, including NiPlex-Harness and NiPlex-MCP.",
      brand: { "@type": "Brand", name: SITE.brand, slogan: SITE.tagline, logo: SITE.url + "/logos/niplex-logo.png" },
      address: { "@type": "PostalAddress", addressCountry: "IN" },
      knowsAbout: [
        "Model Context Protocol (MCP)",
        "AI agents",
        "Discord and Telegram bots",
        "Sandboxed code execution",
        "Human-in-the-loop approvals",
        "Multi-model fallback"
      ],
      sameAs: [SITE.github, SITE.pagesSite, SITE.obsidian]
    }
  ]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="noir" data-mode="dark" className={fontVars} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var d=document.documentElement;try{var t=localStorage.getItem('theme');if(t==='spec'||t==='noir'||t==='cockpit')d.dataset.theme=t}catch(e){}var m=null;try{m=localStorage.getItem('mode')}catch(e){}if(m!=='light'&&m!=='dark'){m=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}d.dataset.mode=m})();"
          }}
        />
        <JsonLd data={identity} />
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <Header />
        <div id="main">{children}</div>
        <Footer />
        <AssistantGate />
      </body>
    </html>
  );
}
