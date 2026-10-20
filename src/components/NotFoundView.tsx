"use client";

import { Cat } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { didYouMean } from "@/lib/didYouMean";
import { LottiePlayer } from "./LottiePlayer";

export function NotFoundView({ routes }: { routes: string[] }) {
  // The page is prerendered once for every missing address, so the real address is only known in the browser.
  const [pathname, setPathname] = useState<string | null>(null);
  useEffect(() => setPathname(window.location.pathname || "/"), []);
  const guess = pathname ? didYouMean(pathname, routes) : null;

  return (
    <main className="notfound">
      <div className="container notfound-inner">
        <div className="notfound-cat">
          <LottiePlayer name="cat" label="A cat looking for the page that is not here" size={280} fallback={<Cat size={96} strokeWidth={1.4} className="walk" />} />
        </div>
        <p className="eyebrow">Error 404</p>
        <h1>This page does not exist</h1>
        <p className="lede">
          {pathname ? (
            <>There is nothing at <code className="notfound-path">{pathname.length > 60 ? pathname.slice(0, 57) + "..." : pathname}</code>.</>
          ) : (
            <>There is nothing at this address.</>
          )}{" "}
          The address may have a typo, or the page may have moved.
        </p>
        {guess && (
          <p className="notfound-guess">
            Did you mean <Link href={guess}>{guess}</Link>?
          </p>
        )}
        <div className="hero-actions notfound-actions">
          <Link href="/" className="btn btn-primary">Back to the homepage</Link>
          <Link href="/projects" className="btn">See the projects</Link>
        </div>
      </div>
    </main>
  );
}
