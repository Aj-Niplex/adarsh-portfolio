# Adarsh Jaiswal (AJ NiPlex)

Portfolio for Adarsh Jaiswal, who builds AI agent systems and Model Context Protocol (MCP) servers: NiPlex-Harness, NiPlex-MCP, ThreadForge-MCP and Rei-kun-Bot.

Live: https://aj-niplex.vercel.app

## Stack
- Next.js App Router, TypeScript, Tailwind CSS v4
- Three switchable visual styles (Spec, Noir, Cockpit), chosen in the header
- Fonts through next/font/google, self-hosted at build time

## Where the content lives
- `src/lib/site.ts`: name, alias, headline, services and the facts table
- `src/lib/projects.ts`: every project, grouped into core, public tools and side projects. Pages, sitemap, llms.txt and the chat assistant all read from this one file.

## Built for search and AI assistants
- Structured data (schema.org JSON-LD): Person, WebSite, ProfilePage, one SoftwareApplication per project, breadcrumbs
- `/llms.txt` and `/llms-full.txt`, generated from the same data
- `/robots.txt` and `/sitemap.xml`
- Per-page titles, descriptions and canonical URLs

## Run locally
1. Node.js 20.9 or newer.
2. `npm install`
3. `npm run dev`, then open http://localhost:3000

## Optional chat assistant
Set `GEMINI_API_KEY` as a server-side environment variable (Production and Preview) and redeploy. The chat button only appears when the key exists. Never use a `NEXT_PUBLIC_` prefix for it. The default model is `gemini-3.1-flash-lite`; `GEMINI_MODEL` overrides it. Messages go to Google's Gemini API, so visitors are told not to send private data. The rate limit is in memory and per serverless instance.

## Site URL
`NEXT_PUBLIC_SITE_URL` sets the canonical URL. It defaults to https://aj-niplex.vercel.app.

## What is published
Public repositories, plus a description of what the private NiPlex-MCP server does. Credentials, private repositories and personal data are not published. OpenDots is labelled as a fork of CopilotKit's project.
