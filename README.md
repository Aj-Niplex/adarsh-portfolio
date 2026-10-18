# Adarsh Jaiswal (AJ NiPlex)

Portfolio for Adarsh Jaiswal, who builds AI agent systems and Model Context Protocol (MCP) servers: NiPlex-Harness, NiPlex-MCP, ThreadForge-MCP and Rei-kun-Bot.

Live: https://aj-niplex.vercel.app

## Stack
- Next.js App Router, TypeScript, Tailwind CSS v4
- Three switchable visual styles (Noir by default, Spec, Cockpit) with a Day / Dark switch, both chosen in the header and remembered per visitor
- Fonts through next/font/google, self-hosted at build time

## Where the content lives
- `src/lib/site.ts`: name, alias, headline, services and the facts table
- `src/lib/projects.ts`: every project, grouped into core, public tools and side projects. Pages, sitemap, llms.txt and the chat assistant all read from this one file.

## Built for search and AI assistants
- Structured data (schema.org JSON-LD): Person, WebSite, ProfilePage, one SoftwareApplication per project, breadcrumbs
- `/llms.txt` and `/llms-full.txt`, generated from the same data
- `/robots.txt` and `/sitemap.xml`
- Per-page titles, descriptions, canonical URLs and share-preview (Open Graph / Twitter) tags

## Run locally
1. Node.js 20.9 or newer.
2. `npm install`
3. `npm run dev`, then open http://localhost:3000

## Optional chat assistant
Set `GEMINI_API_KEY` as a server-side environment variable (Production and Preview) and redeploy. The chat button only appears when the key exists. Never use a `NEXT_PUBLIC_` prefix for it.

How it works:
- Before each answer the server picks the pages of this site that match the question and sends only those to Gemini. The visitor sees the steps as they happen: reading the question, searching the docs, reading each page, writing.
- Answers stream in and are drawn as formatted text (bold, lists, tables, code, links) by a small safe renderer in `src/lib/markdown.ts`. No HTML from the model is ever inserted. Half-finished formatting while text is still arriving is repaired so nothing flashes as raw symbols.
- Flowcharts written in Mermaid are drawn in the page in the current colours. If a diagram fails to parse, a repair pass runs first and the source is shown if it still fails.
- Links in an answer are only clickable when they point to a page that exists on this site or to one of the project links in `src/lib/projects.ts`. Anything else is shown as plain text.
- The system prompt (`src/lib/chatPrompt.ts`) keeps the assistant to the docs: the projects, how they compare with other tools, and the site itself. It declines unrelated tasks, code writing, and questions about private details.

Limits: 2 questions a minute per visitor, 5 a minute when signed in, and a daily cap for the whole site (`CHAT_DAILY_CAP`, default 400). Counters live in the database behind `VIEWS_ENDPOINT`; if it cannot be reached, a per-instance in-memory counter is used.

Optional variables: `GEMINI_MODEL` (default `gemini-3.1-flash-lite`; `gemini-2.5-flash` is the fallback), `GEMINI_BASE_URL` (for tests), `CHAT_DAILY_CAP`.

## Visit counter
The footer shows a total visit count that is stored outside the site, so it keeps counting from where it left off after every redeploy. The browser asks `/api/views`, which calls a small database function using two server-side variables, `VIEWS_ENDPOINT` and `VIEWS_SECRET`. One visit is counted per browser session; crawlers and rapid repeats are read-only. If the variables are missing or the store is unreachable, the counter simply does not appear.

## Security headers
`next.config.ts` sets a Content-Security-Policy (production only), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options` and `frame-ancestors`. Anything new that loads from another site has to be added to the policy there.

## Site URL
`NEXT_PUBLIC_SITE_URL` sets the canonical URL. It defaults to https://aj-niplex.vercel.app.

## What is published
Public repositories, plus a description of what the private NiPlex-MCP server does. Credentials, private repositories and personal data are not published. OpenDots is labelled as a fork of CopilotKit's project.
