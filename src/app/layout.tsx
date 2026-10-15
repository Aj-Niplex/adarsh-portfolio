import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
