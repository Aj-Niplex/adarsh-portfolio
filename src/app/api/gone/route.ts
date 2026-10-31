// On the API service every address that is not an API route, a Markdown page or robots.txt is
// sent here (see next.config.ts), so the service shows nothing but a plain "not found".
const reply = () =>
  new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });

export const GET = reply;
export const HEAD = reply;
export const POST = reply;
