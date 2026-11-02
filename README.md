# Adarsh Jaiswal (AJ NiPlex)

Portfolio for Adarsh Jaiswal, who builds AI agent systems and Model Context Protocol (MCP) servers: NiPlex-Harness, NiPlex-MCP, ThreadForge-MCP and Rei-kun-Bot.

Live: https://aj-niplex.vercel.app

## Stack
- Next.js App Router, TypeScript, Tailwind CSS v4
- Three switchable visual styles (Noir by default, Spec, Cockpit) with a Day / Dark switch, both chosen in the header and remembered per visitor
- Fonts through next/font/google, self-hosted at build time

## Where the content lives
- `src/lib/site.ts`: name, alias, headline, services and the facts table
- `src/lib/projects.ts`: every project, grouped into core, public tools and side projects. Pages, sitemap, llms.txt, the Markdown versions and (through `/md/full`) the chat assistant all read from this one file.

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

## Two services
This repository is the public site: pages, documentation and the Markdown versions. Everything that needs a key or a database lives in a second service, [aj-niplex-api](https://github.com/Aj-Niplex/aj-niplex-api): the chat assistant, sign-in, newsletter, unsubscribe, submissions, the visit counter and the request log.

```
visitor ──> aj-niplex.vercel.app ──/api/*──> aj-niplex-api.vercel.app
              (this repo)                      (chat, sign-in, newsletter, submissions, counter, log)
```

- With `API_ORIGIN` set (the address of the second service), `next.config.ts` forwards every `/api/*` request to it behind this site's own address. The browser never leaves the site, never sees the second address, and cookies stay on the site's own domain.
- Vercel replaces a visitor's address and location with its own when one project forwards to another, so `src/proxy.ts` copies them into `x-pf-*` headers signed with a shared key (`EDGE_KEY`). The API trusts those headers only when the key matches.
- This site holds no secrets. It needs `API_ORIGIN` and `EDGE_KEY`; the keys (Gemini, the store, the mail provider, the admin password) belong to the API service only.
- The assistant reads this site's documentation live from `/md/full` (every page in one Markdown file, each page marked by a comment line with its title, address and keywords; built in `src/lib/mdExport.ts`). Editing a page here changes the assistant's answers without redeploying the API.
- The chat window is `src/components/AIWidget.tsx`. `src/components/AssistantGate.tsx` asks `/api/assistant` first and loads the window only when the service is running and has its key. If the service is off, the button is simply absent and the rest of the site is unaffected.
- Without `API_ORIGIN` (plain local development) `/api/*` does not exist, the assistant stays hidden, and the pages work as usual. To try the assistant locally, run the API repository and point `API_ORIGIN` at it.

### Where the visitor finds the features
- `/signup` is the full account form (**Sign up** in the header and footer). `/newsletter` and the box at the bottom of every page (`FooterNews.tsx`, `NewsletterForm.tsx`) take an email without an account. `/unsubscribe` takes an address off the list with no account and no code; a link in a promotional email can carry the address as `/unsubscribe?email=...`.
- `/submit` takes an idea, a request or feedback (title up to 80 characters, description up to 500, optional name up to 40) and lists the latest 30. The input rules are in `src/lib/submissions.ts` (hints in the browser; the API checks them again).
- The shared wording and limits for the forms are in `src/lib/consent.ts` and `src/lib/chatTypes.ts`.
- `/privacy` is the Privacy Policy (`src/lib/privacy.ts`, also served as `/privacy.md`). A first-visit notice (`src/components/ConsentBanner.tsx`) says "By continuing you agree to our Privacy Policy": **I agree & continue** sets a first-party cookie (`pf_consent`, one year), **No, thanks** leaves the site. The visit counter and the assistant check wait for that choice (`src/lib/consentClient.ts`). When what the site or the API service keeps changes, change the policy first.

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
