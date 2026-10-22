import type { Metadata } from "next";
import { NotFoundView } from "@/components/NotFoundView";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false }
};

// Any address that is not a real page ends up here, with a 404 status.
const ROUTES = ["/", "/about", "/projects", "/submit", "/signup", "/newsletter", "/unsubscribe", ...projects.map((p) => "/projects/" + p.slug)];

export default function NotFound() {
  return <NotFoundView routes={ROUTES} />;
}
