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
- A Markdown version of every page (`src/lib/mdExport.ts`): add `.md` to a page address (`/about.md`), send `Accept: text/markdown` to the normal address, or browse the index at `/md`. The pages list `<link rel="alternate" type="text/markdown">`, and the Markdown copies are marked `noindex` so search engines keep the HTML page.
- `/robots.txt` and `/sitemap.xml`
- Per-page titles, descriptions, canonical URLs and share-preview (Open Graph / Twitter) tags

## Run locally
1. Node.js 20.9 or newer.
2. `npm install`
3. `npm run dev`, then open http://localhost:3000

## Two services, one codebase
The repository is deployed twice, as two Vercel projects.
- **The public site** (the default) serves every page and holds no secrets. With `API_ORIGIN` set (the address of the second service), `next.config.ts` forwards every `/api/*` request to it behind the same address, so the browser never leaves the site, never sees the second address, and cookies stay on the site's own domain.
- **The API service** (`SERVICE_ROLE=api`) holds the keys and runs the chat, sign-in, newsletter, submissions and visit counter. Everything that is not `/api/*`, the Markdown pages or `robots.txt` answers "not found", it asks search engines to stay away, and its `SITE_HOSTS` variable lists the public site's address so browser requests from the site pass the origin check (`src/lib/origin.ts`).
- With neither variable set (local development) everything runs in one process.

The public site shows the assistant only when the API service is running: `src/components/AssistantGate.tsx` asks `/api/assistant`, and only if the service answers (with its key in place) does it load the chat window. If the service is off, the button is simply absent and the rest of the site is unaffected. Secrets (`GEMINI_API_KEY`, `VIEWS_ENDPOINT`, `VIEWS_SECRET`, `CHAT_SIGNING_SECRET`, the mail keys) belong to the API service only; the public site needs just `API_ORIGIN`.

## Optional chat assistant
Set `GEMINI_API_KEY` as a server-side environment variable on the API service (Production and Preview) and redeploy it. The chat button only appears when the key exists and the service answers. Never use a `NEXT_PUBLIC_` prefix for it.

How it works:
- Before each answer the server picks the pages of this site that match the question and sends only those to Gemini. The visitor sees the steps as they happen: reading the question, searching the docs, reading each page, writing.
- Answers stream in and are drawn as formatted text (bold, lists, tables, code, links) by a small safe renderer in `src/lib/markdown.ts`. No HTML from the model is ever inserted. Half-finished formatting while text is still arriving is repaired so nothing flashes as raw symbols.
- Flowcharts written in Mermaid are drawn in the page in the current colours. If a diagram fails to parse, a repair pass runs first and the source is shown if it still fails.
- Links in an answer are only clickable when they point to a page that exists on this site or to one of the project links in `src/lib/projects.ts`. Anything else is shown as plain text.
- The system prompt (`src/lib/chatPrompt.ts`) keeps the assistant to the docs: the projects, how they compare with other tools, and the site itself. It declines unrelated tasks, code writing, and questions about private details.

- "What can you do?", "how can you help", "who are you" and similar questions are answered at once from a fixed reply (`src/lib/intent.ts`) with no model call and no question used. It lists what the assistant covers and links the site pages.
- An answer never keeps the chat waiting. The server ends the stream as soon as the model reports it is finished, treats a model that goes quiet for 12 seconds after it started writing as finished (the answer is kept and marked as cut short), and sends a heartbeat every 5 seconds. The browser gives up on a connection that is silent for 25 seconds, keeps the text it has and unlocks the input. While an answer is being written, the send button becomes a Stop button.

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
- `/unsubscribe` (linked from the footer and the newsletter page) takes an address off the list with no account and no code. Route: `/api/unsubscribe`, limited to 10 requests an hour per network address and 5 a day per email, with the same hidden bot field. It runs the store's `forget` action, which only deletes the saved subscriber row (the address, the wording agreed to and the dates), never an account, and the answer is the same whether or not the address was on the list. A link in a future email can carry the address as `/unsubscribe?email=...` so the visitor only has to press the button. When mail is switched on, put that link in the footer of every promotional email.
- With a mail provider, the newsletter box also sends the six-digit code and marks the address confirmed. Without one the address is saved as unconfirmed and nothing may be sent to it until it is confirmed.

## Submit page
`/submit` takes an idea, a request or feedback (title up to 80 characters, description up to 500, optional name up to 40) and lists the latest 30 below the form with their descriptions (the page loads the list from `GET /api/submit` when it opens, so the page itself holds no store access). Rules are in `src/lib/submissions.ts` and run in the browser and again in `/api/submit`: no links, email addresses or phone numbers, no spam-looking repeats, a hidden field for bots, and limits of 1 per 30 seconds, 6 an hour and 20 a day per network address. The database adds its own length checks, drops an identical repeat within a day and stops at 300 a day in total. Text is always shown as plain text. Rows are in `portfolio.submissions`; to take one down, set its `status` to `hidden` and it disappears from the page (`update portfolio.submissions set status = 'hidden' where id = …`). Only the site's server can read or write the table, through the edge function actions `submit` and `submissions`.

## Animations
Animations are LottieFiles `.lottie` files played by `@lottiefiles/dotlottie-web`. The player engine (`public/lottie/*.wasm`) is served from this site; only the animation files themselves load from `assets-v2.lottiefiles.com`, which is allowed in the Content-Security-Policy. They are used for the idle chat button, the "reading the docs" state, the error shown inside the AI answer, the account setup screen and the 404 page. If an animation cannot load, or the visitor prefers reduced motion or has data saver on, a simple built-in icon is shown instead. The paper plane while a code is sent is drawn in SVG. The list of files is in `src/lib/lottie.ts`.

## 404 page
Any address that is not a real page shows the cat animation with a 404 status (`src/app/not-found.tsx`). If the address is close to a real page, it suggests it: `/abt` offers `/about` (`src/lib/didYouMean.ts`).

## Scroll hero
`src/components/ui/scroll-morph-hero.tsx` sits on the homepage under the first section. Cards for each project and each NiPlex-MCP tool group (read from `src/lib/projects.ts` through `src/lib/heroItems.ts`) scatter, line up, form a circle and settle into an arc as the page scrolls. It uses the normal page scroll with a sticky stage, so nothing captures the wheel or touch events. With reduced motion, or without JavaScript, a plain grid is shown instead.

## Credits
Animations from [LottieFiles](https://lottiefiles.com), used under the Lottie Simple License: the robot by Oshie Labs, the archive search by Rita Veríssimo, the error animation by Boltbite, the account setup walk by Irfan M and the 404 cat by Alice Costa.

## Kaizen Manas documentation

`/projects/niplex-harness/...` holds about 285 pages (tools, commands, settings, safety, fixes, FAQ and more). They are built at deploy time from the files in `content/km`, which were read from the product's source at one commit (`content/km/meta.json`). To update them, replace the files and redeploy. Each page has its own address, so any page can be opened directly.

Pictures come in two styles, "funny" (the default) and "simple". The address picks one: add `#funny` or `#simple`, or use the switch on the page. The pictures are stored scrambled in `public/km` and painted onto a canvas by the browser (`src/lib/kmImages.ts`), so there is no image address to save. This only stops casual copying; a screenshot or someone reading the code gets around it.

## Visit counter
The footer shows a total visit count that is stored outside the site, so it keeps counting from where it left off after every redeploy. The browser asks `/api/views`, which calls a small database function using two server-side variables, `VIEWS_ENDPOINT` and `VIEWS_SECRET`. Each browser is counted once (a flag in local storage plus a one-year cookie), so revisits and redeploys do not add visits; opening any page once with `?owner=1` marks a browser as the owner's and it is never counted. Crawlers and rapid repeats are read-only. If the variables are missing or the store is unreachable, the counter simply does not appear.

## Security headers
`next.config.ts` sets a Content-Security-Policy (production only), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options` and `frame-ancestors`. Anything new that loads from another site has to be added to the policy there.

## Site URL
`NEXT_PUBLIC_SITE_URL` sets the canonical URL. It defaults to https://aj-niplex.vercel.app.

## What is published
Public repositories, plus a description of what the private NiPlex-MCP server and the current private NiPlex-Harness (Kaizen Manas) do. The public NiPlex-Harness repository is an older snapshot and is labelled that way. The Manas mascot images are in `public/logos/`. Credentials, private repositories and personal data are not published. OpenDots is labelled as a fork of CopilotKit's project.
