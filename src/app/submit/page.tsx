import type { Metadata } from "next";
import Link from "next/link";
import { SubmitView } from "@/components/SubmitView";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Submit",
    description: "Send an idea, a request or feedback for NiPlex projects. The latest submissions are listed with their descriptions.",
    path: "/submit"
  }),
  robots: { index: false, follow: true }
};

export default function SubmitPage() {
  return (
    <main className="container page">
      <p className="crumbs"><Link href="/">Home</Link> / Submit</p>
      <h1>Submit</h1>
      <p className="lead">
        Tell me what to build next: an idea, a tool you want an AI agent to have, or feedback on this site. The latest submissions are listed here with their descriptions.
      </p>
      <SubmitView />
    </main>
  );
}
