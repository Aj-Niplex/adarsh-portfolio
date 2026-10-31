import { getKm, pageText } from "@/lib/km/pages";

export const dynamic = "force-static";

export function GET() {
  const entries = getKm().pages.map((p) => ({
    p: p.path,
    t: p.title,
    s: (p.lead || p.summary).slice(0, 160),
    k: p.keywords.join(" "),
    x: pageText(p).slice(0, 500)
  }));
  return Response.json(entries, { headers: { "Cache-Control": "public, max-age=3600" } });
}
