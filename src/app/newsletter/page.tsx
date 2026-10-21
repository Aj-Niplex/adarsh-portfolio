import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterForm } from "@/components/NewsletterForm";
import { pageMeta } from "@/lib/meta";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Newsletter",
    description: "Occasional updates about NiPlex-Harness, NiPlex-MCP and what else is being built. Leave an email address to join.",
    path: "/newsletter"
  }),
  robots: { index: false, follow: true }
};

export default function NewsletterPage() {
  return (
    <main className="container page">
      <p className="crumbs"><Link href="/">Home</Link> / Newsletter</p>
      <h1>Newsletter</h1>
      <p className="lead">Occasional updates about NiPlex-Harness, NiPlex-MCP and whatever is built next. No account needed, just an email address.</p>
      <div className="signup-card">
        <NewsletterForm tone="page" />
        <ul className="signup-points">
          <li>Updates are about these projects only, and they are sent rarely.</li>
          <li>The address is kept with the wording you agreed to and the date, only for these emails.</li>
          <li>
            To have it deleted, sign in and choose &quot;Delete my email&quot;, or <a href={SITE.github} target="_blank" rel="noreferrer">message me on GitHub</a>.
          </li>
        </ul>
      </div>
      <p className="signup-more">
        Want an account for the assistant as well? <Link href="/signup">Sign up here</Link>.
      </p>
    </main>
  );
}
