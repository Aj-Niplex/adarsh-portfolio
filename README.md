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

Optional variables: `GEMINI_MODEL` (default `gemini-3.1-flash-lite`; `gemini-3.8-flash` and then `gemini-2.5-flash` are tried if it is busy or retired), `GEMINI_BASE_URL` (for tests), `CHAT_DAILY_CAP`.

## Sign-in (email code, then a password)
Signing in raises the chat limit and puts the visitor on the product-updates list, so the address has to be proven first:
1. Enter an email and tick the consent box, then **Send OTP**. A six-digit code is emailed (valid for 10 minutes, 5 tries, one new code every 45 seconds). The same reply is given whether or not the address already has an account.
2. After the code is verified, the code screen is replaced by **Create a Password**. Passwords are hashed with scrypt (`src/lib/password.ts`); the site never stores or logs one in plain text.
3. Next time, **I already have a password** signs in with email and password. "Delete my email" removes the subscriber row and the account together.

Routes: `/api/auth/start`, `/api/auth/verify`, `/api/auth/password`, `/api/auth/login`, plus `/api/session` for the current state. Codes are stored only as a keyed hash; the database functions are closed to the public keys and only the site's server can call them. Send limits: 10 codes an hour per network address and 5 per email.

The email is sent by one provider chosen from the environment (`src/lib/mailer.ts`): AgentMail (`AGENTMAIL_API_KEY` + `AGENTMAIL_INBOX`), Resend (`RESEND_API_KEY` + `MAIL_FROM`) or Brevo (`BREVO_API_KEY` + `MAIL_FROM`). `CHAT_SIGNING_SECRET` signs the cookies. If no provider is configured, the sign-in option is hidden rather than broken.

### Where the visitor finds it
- `/signup` is the full account form (linked as **Sign up** in the header and footer). While no mail provider is configured it says so honestly and offers the newsletter box instead, then switches itself on once a provider exists.
- `/newsletter` and the box at the bottom of every page (`src/components/FooterNews.tsx`, `NewsletterForm.tsx`) take an email and the consent tick without needing an account. Route: `/api/newsletter`. The address and the exact wording agreed to are saved, limited to 8 requests an hour per network address and 4 a day per email, with a hidden field to catch bots.
- With a mail provider, the newsletter box also sends the six-digit code and marks the address confirmed. Without one the address is saved as unconfirmed and nothing may be sent to it until it is confirmed.

## Animations
Animations are LottieFiles `.lottie` files played by `@lottiefiles/dotlottie-web`. The player engine (`public/lottie/*.wasm`) is served from this site; only the animation files themselves load from `assets-v2.lottiefiles.com`, which is allowed in the Content-Security-Policy. They are used for the idle chat button, the "reading the docs" state, the error shown inside the AI answer, the account setup screen and the 404 page. If an animation cannot load, or the visitor prefers reduced motion or has data saver on, a simple built-in icon is shown instead. The paper plane while a code is sent is drawn in SVG. The list of files is in `src/lib/lottie.ts`.

## 404 page
Any address that is not a real page shows the cat animation with a 404 status (`src/app/not-found.tsx`). If the address is close to a real page, it suggests it: `/abt` offers `/about` (`src/lib/didYouMean.ts`).

## Scroll hero
`src/components/ui/scroll-morph-hero.tsx` sits on the homepage under the first section. Cards for each project and each NiPlex-MCP tool group (read from `src/lib/projects.ts` through `src/lib/heroItems.ts`) scatter, line up, form a circle and settle into an arc as the page scrolls. It uses the normal page scroll with a sticky stage, so nothing captures the wheel or touch events. With reduced motion, or without JavaScript, a plain grid is shown instead.

## Credits
Animations from [LottieFiles](https://lottiefiles.com), used under the Lottie Simple License: the robot by Oshie Labs, the archive search by Rita Veríssimo, the error animation by Boltbite, the account setup walk by Irfan M and the 404 cat by Alice Costa.

## Visit counter
The footer shows a total visit count that is stored outside the site, so it keeps counting from where it left off after every redeploy. The browser asks `/api/views`, which calls a small database function using two server-side variables, `VIEWS_ENDPOINT` and `VIEWS_SECRET`. One visit is counted per browser session; crawlers and rapid repeats are read-only. If the variables are missing or the store is unreachable, the counter simply does not appear.

## Security headers
`next.config.ts` sets a Content-Security-Policy (production only), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options` and `frame-ancestors`. Anything new that loads from another site has to be added to the policy there.

## Site URL
`NEXT_PUBLIC_SITE_URL` sets the canonical URL. It defaults to https://aj-niplex.vercel.app.

## What is published
Public repositories, plus a description of what the private NiPlex-MCP server and the current private NiPlex-Harness (Kaizen Manas) do. The public NiPlex-Harness repository is an older snapshot and is labelled that way. The Manas mascot images are in `public/logos/`. Credentials, private repositories and personal data are not published. OpenDots is labelled as a fork of CopilotKit's project.
