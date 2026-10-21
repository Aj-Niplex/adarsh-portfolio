"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NewsletterForm } from "./NewsletterForm";

/** The newsletter box at the bottom of every page. The newsletter page has its own form, so it is left out there. */
export function FooterNews() {
  const pathname = usePathname();
  if (pathname === "/newsletter") return null;
  return (
    <div className="container footer-news" role="region" aria-labelledby="footer-news-title">
      <div className="footer-news-copy">
        <h2 id="footer-news-title">Product updates and promotions</h2>
        <p>
          Product updates and promotions from NiPlex-Harness, NiPlex-MCP and what comes next. <Link href="/newsletter">More about it</Link>.
        </p>
      </div>
      <NewsletterForm />
    </div>
  );
}
