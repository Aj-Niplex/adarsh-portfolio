import Link from "next/link";
import { KmImage } from "@/components/km/KmImage";
import { KM_BASE } from "@/lib/km/pages";

export default function KmNotFound() {
  return (
    <main className="container page km-missing">
      <h1>That page is not in the Kaizen Manas documentation</h1>
      <div className="km-fig">
        <KmImage id="state-not-found" alt="Manas holding a lantern in a small felt forest, looking around" priority />
      </div>
      <p className="lead">The address may be misspelled, or the page was renamed. Start from the overview and use the search box there.</p>
      <p><Link className="btn" href={KM_BASE}>Open the Kaizen Manas overview</Link></p>
    </main>
  );
}
