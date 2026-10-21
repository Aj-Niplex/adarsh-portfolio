import type { Metadata } from "next";
import Link from "next/link";
import { SignupView } from "@/components/SignupView";
import { pageMeta } from "@/lib/meta";
import { FREE_PER_MINUTE, SIGNED_IN_PER_MINUTE } from "@/lib/consent";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Sign up",
    description: "Create a free account with an email code and a password. Signed-in visitors can ask the site assistant more questions per minute.",
    path: "/signup"
  }),
  robots: { index: false, follow: true }
};

export default function SignupPage() {
  return (
    <main className="container page">
      <p className="crumbs"><Link href="/">Home</Link> / Sign up</p>
      <h1>Sign up</h1>
      <p className="lead">
        A free account takes about a minute: your email, a 6-digit code, then a password. Signed-in visitors can ask the assistant {SIGNED_IN_PER_MINUTE} questions a minute instead of {FREE_PER_MINUTE}, and get product updates by email if they agree to them.
      </p>
      <ol className="signup-steps" aria-label="How it works">
        <li><span><strong>Email.</strong> Tick the box to agree to product emails.</span></li>
        <li><span><strong>Code.</strong> A 6-digit code arrives by email and proves the address is yours.</span></li>
        <li><span><strong>Password.</strong> Pick one with at least 8 characters.</span></li>
      </ol>
      <SignupView />
      <p className="signup-more">
        Only want the updates? <Link href="/newsletter">Join the newsletter</Link> without an account.
      </p>
    </main>
  );
}
