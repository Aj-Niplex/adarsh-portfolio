"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { KmLink } from "./KmImage";

export type NavChapter = { title: string; items: { title: string; path: string }[] };

export function KmNav({ base, chapters }: { base: string; chapters: NavChapter[] }) {
  const [open, setOpen] = useState(false);
  const here = usePathname() || "";
  const current = here.startsWith(base + "/") ? here.slice(base.length + 1).split("/")[0] : "";
  return (
    <nav className={"km-nav" + (open ? " open" : "")} aria-label="Documentation">
      <button type="button" className="km-nav-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        Browse the documentation <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <div className="km-nav-body">
        <KmLink href={base} className={"km-nav-home" + (here === base ? " on" : "")}>Overview</KmLink>
        {chapters.map((c) => (
          <div key={c.title} className="km-nav-group">
            <h2>{c.title}</h2>
            <ul>
              {c.items.map((i) => (
                <li key={i.path}>
                  <KmLink href={base + "/" + i.path} className={current === i.path ? "on" : undefined} aria-current={current === i.path ? "page" : undefined}>{i.title}</KmLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
