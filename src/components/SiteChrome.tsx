import Image from "next/image";
import Link from "next/link";
import { NAV, SITE } from "@/lib/site";
import { ThemeSwitcher } from "./ThemeSwitcher";

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
      <div className="container footer-inner">
        <div>
          <strong>{SITE.name}</strong> · {SITE.alias}
          <p>{SITE.tagline}.</p>
        </div>
        <ul className="footer-links">
          <li>
            <Link href="/projects">Projects</Link>
          </li>
          <li>
            <Link href="/about">About</Link>
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
      </div>
    </footer>
  );
}
