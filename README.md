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

## Publishing policy
The portfolio uses a curated allowlist. Private repositories, personal vaults, saved conversation data, internal connectors, tokens, and development handover notes are deliberately not indexed or shown. KaizenManas is listed only as an unreleased preview; its private development source is not linked.
