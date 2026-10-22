import Image from "next/image";
import Link from "next/link";
import { NAV, PORTFOLIOS, SITE } from "@/lib/site";
import { FooterNews } from "./FooterNews";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { ViewCounter } from "./ViewCounter";

export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label={SITE.name + " home"}>
          <Image src="/logos/niplex-logo.png" alt="" width={40} height={33} className="brand-logo" priority />
          <span className="brand-text">
            <strong>{SITE.alias}</strong>
            <small>{SITE.name}</small>
          </span>
        </Link>
        <nav className="nav" aria-label="Main">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <a href={SITE.github} target="_blank" rel="noreferrer" className="nav-ext">
            GitHub
          </a>
        </nav>
        <ThemeSwitcher />
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <FooterNews />
      <div className="container footer-inner">
        <div>
          <strong>{SITE.name}</strong> · {SITE.alias}
          <p>{SITE.tagline}.</p>
          <ViewCounter />
        </div>
        <div className="footer-cols">
          <ul className="footer-links">
            <li>
              <Link href="/projects">Projects</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/submit">Submit</Link>
            </li>
            <li>
              <Link href="/signup">Sign up</Link>
            </li>
            <li>
              <Link href="/newsletter">Newsletter</Link>
            </li>
            <li>
              <Link href="/unsubscribe">Unsubscribe</Link>
            </li>
            <li>
              <a href={SITE.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </li>
            <li>
              <a href="/llms.txt">llms.txt</a>
            </li>
          </ul>
          <ul className="footer-links footer-links-sub" aria-label="Portfolios and profiles">
            {PORTFOLIOS.map((p) => (
              <li key={p.href}>
                <a href={p.href} target="_blank" rel="noreferrer">
                  {p.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
