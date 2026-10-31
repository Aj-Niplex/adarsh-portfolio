import Link from "next/link";
import { getKm, KM_BASE, KM_CHAPTERS, kmRef, seeAlso } from "@/lib/km/pages";
import type { KmPage } from "@/lib/km/types";
import { KmBody } from "./KmBody";
import { KmImage, KmLink, KmModeToggle } from "./KmImage";
import { KmNav } from "./KmNav";
import { KmSearch } from "./KmSearch";

function chapters() {
  const { byPath } = getKm();
  return KM_CHAPTERS.map((c) => ({
    title: c.title,
    items: c.paths.map((p) => byPath.get(p)).filter((p): p is KmPage => Boolean(p)).map((p) => ({ title: p.title, path: p.path }))
  }));
}

function fmtDate(d?: string) {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00Z");
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function KmShell({ page }: { page: KmPage }) {
  const km = getKm();
  const parts = page.path.split("/");
  const crumbs: { title: string; path: string }[] = [];
  for (let i = 1; i < parts.length; i++) {
    const p = km.byPath.get(parts.slice(0, i).join("/"));
    if (p) crumbs.push({ title: p.title, path: p.path });
  }
  const ref = kmRef();
  const also = seeAlso(page);
  return (
    <main className="container page km">
      <p className="crumbs">
        <Link href="/">Home</Link> / <Link href="/projects">Projects</Link> / <KmLink href={KM_BASE}>NiPlex-Harness</KmLink>
        {crumbs.map((c) => (
          <span key={c.path}> / <KmLink href={KM_BASE + "/" + c.path}>{c.title}</KmLink></span>
        ))}
        {" / "}{page.title}
      </p>
      <div className="km-top">
        <KmSearch />
        <KmModeToggle />
      </div>
      <div className="km-layout">
        <KmNav base={KM_BASE} chapters={chapters()} />
        <article className="km-main">
          <h1>{page.title}</h1>
          <div className={"km-lead-row" + (page.image ? " has-img" : "")}>
            <div>
              {page.lead && <p className="lead km-answer">{page.lead}</p>}
              {!page.lead && page.summary && <p className="lead km-answer">{page.summary}</p>}
              <p className="km-meta-line">
                {page.since ? "Since " + fmtDate(page.since) : "Kaizen Manas"}
                {page.updated ? " · Updated " + fmtDate(page.updated) : ""}
              </p>
            </div>
            {page.image && (
              <figure className="km-fig">
                <KmImage id={page.image.id} alt={page.image.alt} priority />
                <figcaption>{page.image.caption}</figcaption>
              </figure>
            )}
          </div>
          <KmBody blocks={page.blocks} />
          {also.length > 0 && (
            <p className="km-reflinks km-also">
              <span>See also:</span>
              {also.map((l) => <KmLink key={l.path} href={KM_BASE + "/" + l.path}>{l.title}</KmLink>)}
            </p>
          )}
          <p className="km-foot">
            Checked against the source at commit <code>{ref.short}</code> on {fmtDate(ref.readOn)}. Everything here is merged on the main branch; no release has been tagged yet. The source is private, so these pages are the public description.
          </p>
        </article>
      </div>
    </main>
  );
}
