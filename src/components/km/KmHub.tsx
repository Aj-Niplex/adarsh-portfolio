import { getKm, KM_BASE, KM_CHAPTERS } from "@/lib/km/pages";
import { KmImage, KmLink, KmModeToggle } from "./KmImage";
import { KmSearch } from "./KmSearch";

/** The front door of the Kaizen Manas documentation, shown on the NiPlex-Harness page. */
export function KmHub() {
  const { byPath, pages } = getKm();
  return (
    <section className="km-hub" aria-label="Documentation">
      <figure className="km-hero">
        <KmImage id="hero-manas" alt="Manas the felt axolotl sitting at a desk beside a lantern" priority />
      </figure>
      <div className="km-hub-head">
        <div>
          <h2>Documentation</h2>
          <p>{pages.length} pages, each on its own address: every tool, command, setting and fix, written from the source code.</p>
        </div>
        <KmModeToggle />
      </div>
      <KmSearch />
      <div className="km-cards km-hub-cards">
        {KM_CHAPTERS.flatMap((c) => c.paths).map((path) => {
          const p = byPath.get(path);
          if (!p) return null;
          return (
            <KmLink key={path} href={KM_BASE + "/" + path} className="km-card">
              <b>{p.title}</b>
              <span>{p.summary}</span>
            </KmLink>
          );
        })}
      </div>
    </section>
  );
}
