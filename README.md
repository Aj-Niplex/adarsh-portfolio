# Adarsh Jaiswal | NiPlex

Personal portfolio for Adarsh Jaiswal: AI systems, developer tooling, and open-source projects.

## Stack
- Next.js App Router and TypeScript
- Tailwind CSS v4
- Framer Motion and Lucide icons
- Vercel serverless route for the optional Gemini-powered chat

## Local development
1. Install Node.js 20.9+.
2. Run **npm install**.
3. Copy .env.example to .env.local and add a Gemini API key only if you want to enable the chat locally.
4. Run **npm run dev** and open http://localhost:3000.

## AI chat setup
Add GEMINI_API_KEY as a **server-side** Vercel environment variable for Production and Preview, then redeploy. Never put the key in a NEXT_PUBLIC_* variable or commit it to Git. The default model is gemini-3.1-flash-lite; GEMINI_MODEL can override it.

The chat is optional. Without the key, the widget explains that the assistant is not connected yet. API responses are bounded and the browser sends chat messages only to this site's server route.

**Privacy:** When configured, chat messages are forwarded to Google's Gemini API. Google's current pricing documentation says free-tier content may be used to improve Google products, so visitors are warned not to enter secrets or private data. The included in-memory rate limit is best-effort per serverless instance, not a durable global quota; add a persistent rate limiter or challenge before relying on it at high traffic.

## Publishing policy
The portfolio uses a curated allowlist. Private repositories, personal vaults, saved conversation data, internal connectors, tokens, and development handover notes are deliberately not indexed or shown. KaizenManas is listed only as an unreleased preview; its private development source is not linked.


## Multi-page portfolio structure

- / — overview and selected work
- /projects — index of public project dossiers
- /projects/niplex-research-ai — Obsidian plugin capabilities and workflow
- /projects/niplex-harness — chat-controlled personal-agent harness
- /projects/rei-kun-bot — Discord bot, commands, resource hub, and admin features
- /projects/threadforge-mcp — persistent chat MCP server and tool catalogue
- /projects/niplex-harness-site — static documentation site
- /projects/opendots — attributed upstream template/fork dossier
- /architecture — cross-project conceptual architecture and trust boundaries
- /about — development principles and publication policy

Each project dossier includes a feature inventory, architecture summary, end-to-end workflow, configuration notes, source link, and known limitations. The content is sourced from public repository documentation and selected implementation files; it is not a substitute for reviewing the complete upstream source, and it does not claim independent security certification.

### Public-source policy

The site describes public-facing product repositories. It does not reproduce private repository contents, personal vaults, saved data, credentials, private infrastructure, or unreleased design notes. Upstream templates and forks are labelled with attribution rather than presented as original NiPlex products.
