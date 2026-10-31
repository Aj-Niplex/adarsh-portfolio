/** The address of the Markdown version of a page, given the page's own path ("/about", "/projects/x"). */
export function mdUrl(pagePath: string) {
  const clean = pagePath.split("#")[0].replace(/\/+$/, "");
  if (clean === "" || clean === "/") return "/md/home";
  return "/md" + clean;
}

/** Pages that have a Markdown version: the home page, About, Projects, every project and its documentation. */
export function hasMarkdown(pagePath: string) {
  const clean = pagePath.split("#")[0].replace(/\/+$/, "") || "/";
  return clean === "/" || clean === "/about" || clean === "/projects" || clean.startsWith("/projects/");
}
