import type { Metadata } from "next";
import Link from "next/link";
import { UnsubscribeForm } from "@/components/UnsubscribeForm";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Unsubscribe",
    description: "Take an email address off the product updates and promotions list.",
    path: "/unsubscribe"
  }),
  robots: { index: false, follow: true }
};

export default function UnsubscribePage() {
  return (
    <main className="container page">
      <p className="crumbs"><Link href="/">Home</Link> / Unsubscribe</p>
      <h1>Unsubscribe</h1>
      <p className="lead">Type the address and it is taken off the product updates and promotions list. No account, no code, no questions.</p>
      <div className="signup-card">
        <UnsubscribeForm />
        <ul className="signup-points">
          <li>This only stops the emails. If you also made an account, it stays and you can still sign in.</li>
          <li>The saved address, the wording you agreed to and the date are deleted with it.</li>
        </ul>
      </div>
      <p className="signup-more">
        Changed your mind? <Link href="/newsletter">Join the list again</Link>.
      </p>
    </main>
  );
}
