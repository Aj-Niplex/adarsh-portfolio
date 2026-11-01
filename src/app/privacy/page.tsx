import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PRIVACY, PRIVACY_LEAD, PRIVACY_UPDATED } from "@/lib/privacy";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  title: "Privacy Policy",
  description: "What this site keeps when you use the assistant, the newsletter, sign-up and the ideas page, who else handles it, and how to have it removed.",
  path: "/privacy"
});

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Turns [label](address) in the policy text into links. */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const href = m[2];
    out.push(
      href.startsWith("/") ? (
        <Link key={at} href={href} style={{ color: "var(--accent-text)" }}>{m[1]}</Link>
      ) : (
        <a key={at} href={href} target="_blank" rel="noreferrer" style={{ color: "var(--accent-text)" }}>{m[1]}</a>
      )
    );
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function PrivacyPage() {
  return (
    <main className="container page">
      <p className="crumbs"><Link href="/">Home</Link> / Privacy Policy</p>
      <h1>Privacy Policy</h1>
      <p className="lead">{PRIVACY_LEAD}</p>
      <p className="policy-date">Last updated {PRIVACY_UPDATED}</p>
      <div className="prose policy">
        {PRIVACY.map((section) => (
          <section key={section.id} id={section.id}>
            <h2>{section.title}</h2>
            {section.blocks.map((block, i) =>
              block.t === "p" ? (
                <p key={i}>{inline(block.text)}</p>
              ) : (
                <ul key={i} className="policy-list">
                  {block.items.map((item) => (
                    <li key={item}>{inline(item)}</li>
                  ))}
                </ul>
              )
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
