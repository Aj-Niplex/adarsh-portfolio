import { mdPages } from "@/lib/mdExport";
import { SITE } from "@/lib/site";

// The Markdown version of every page, built once at deploy time.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return mdPages().map((p) => ({ path: p.path === "" ? [] : p.path.split("/") }));
}

let index: Map<string, ReturnType<typeof mdPages>[number]> | null = null;

export async function GET(_request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;
  if (!index) index = new Map(mdPages().map((p) => [p.path, p]));
  const page = index.get((path || []).join("/"));
  if (!page) {
    return new Response("There is no Markdown version of this page. The list is at " + SITE.url + "/md\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
  return new Response(page.body(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      Link: "<" + SITE.url + page.canonical + '>; rel="canonical"',
      // The HTML page is the one to find in search; this copy is for reading and for AI assistants.
      "X-Robots-Tag": "noindex",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
