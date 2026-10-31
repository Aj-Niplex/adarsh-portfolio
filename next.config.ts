import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Two services are built from this one codebase.
//  - The public site (the default) holds no secrets. When API_ORIGIN is set, every /api/* request
//    is forwarded to the second service behind the same address, so visitors never see it.
//  - The API service (SERVICE_ROLE=api) holds the keys. It answers /api/*, the Markdown pages and
//    robots.txt, and shows a plain "not found" for everything else.
// With neither set (local development) everything runs in one process.
const isApiService = process.env.SERVICE_ROLE === "api";
const apiOrigin = (process.env.API_ORIGIN || "").replace(/\/+$/, "");

// Every source the pages need is listed here; anything else is blocked by the browser.
// 'unsafe-inline' stays for scripts and styles because Next.js writes small inline scripts and
// styles into each page (theme setup, hydration data). The animation player runs as WebAssembly
// served from this site ('wasm-unsafe-eval' allows that and nothing else), and the animation
// files themselves are the only thing fetched from another host.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://assets-v2.lottiefiles.com",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests"
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=()"
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isProd ? [{ key: "Content-Security-Policy", value: csp }] : [])
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The documentation text is read from files at run time by the assistant, so the files ship with it.
  outputFileTracingIncludes: {
    "/api/chat": ["./content/km/**/*"],
    "/llms-full.txt": ["./content/km/**/*"],
    // A mistyped documentation address is rendered on demand, and that reads the same files.
    "/projects/niplex-harness/**": ["./content/km/**/*"],
    "/projects/[slug]": ["./content/km/**/*"]
  },
  async rewrites() {
    // A request that asks for Markdown (Accept: text/markdown) gets the Markdown version of the page.
    const wantsMarkdown = [{ type: "header" as const, key: "accept", value: ".*text/markdown.*" }];
    const markdown = [
      { source: "/index.md", destination: "/md/home" },
      { source: "/:path(.+)\\.md", destination: "/md/:path" },
      { source: "/", has: wantsMarkdown, destination: "/md/home" },
      { source: "/:path(about|projects|projects/.+)", has: wantsMarkdown, destination: "/md/:path" }
    ];
    const forward = !isApiService && apiOrigin ? [{ source: "/api/:path*", destination: apiOrigin + "/api/:path*" }] : [];
    // On the API service, anything that is not meant to be public is answered with "not found".
    const closed = isApiService
      ? [
          { source: "/", destination: "/api/gone" },
          { source: "/:path((?!api(?:/|$)|md(?:/|$)|robots\\.txt$).*)", destination: "/api/gone" }
        ]
      : [];
    return { beforeFiles: [...forward, ...markdown, ...closed], afterFiles: [], fallback: [] };
  },
  async headers() {
    return [
      // The API service is not a website: keep it out of search results.
      ...(isApiService ? [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }] : []),
      // The same address answers in HTML or Markdown depending on the Accept header.
      { source: "/", headers: [{ key: "Vary", value: "Accept" }] },
      { source: "/about", headers: [{ key: "Vary", value: "Accept" }] },
      { source: "/projects/:path*", headers: [{ key: "Vary", value: "Accept" }] },
      { source: "/:path*", headers: securityHeaders },
      // The player engine has its version in the file name, so it can be cached for good.
      // The scrambled pictures never change under the same name.
      { source: "/km/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }, { key: "X-Robots-Tag", value: "noindex" }] },
      { source: "/lottie/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] }
    ];
  }
};

export default nextConfig;
