import type { Metadata } from "next";
import Link from "next/link";
import { SubmitView } from "@/components/SubmitView";
import { pageMeta } from "@/lib/meta";
import { callStore } from "@/lib/store";
import { toSubmission, type Submission } from "@/lib/submissions";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Submit",
    description: "Send an idea, a request or feedback for NiPlex projects. The latest submissions are listed with their descriptions.",
    path: "/submit"
  }),
  robots: { index: false, follow: true }
};

// The list changes whenever someone submits, so it is read fresh on every visit.
export const dynamic = "force-dynamic";

async function latest(): Promise<Submission[] | null> {
  const result = await callStore<{ items?: unknown[] }>({ action: "submissions", limit: 30 });
  if (!result || !Array.isArray(result.items)) return null;
  return result.items.map(toSubmission).filter((s): s is Submission => s !== null);
}

export default async function SubmitPage() {
  const initial = await latest();
  return (
    <main className="container page">
      <p className="crumbs"><Link href="/">Home</Link> / Submit</p>
      <h1>Submit</h1>
      <p className="lead">
        Tell me what to build next: an idea, a tool you want an AI agent to have, or feedback on this site. The latest submissions are listed here with their descriptions.
      </p>
      <SubmitView initial={initial} />
    </main>
  );
}
