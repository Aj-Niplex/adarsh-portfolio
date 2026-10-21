import type { Metadata } from "next";
import Link from "next/link";
import { SignupView } from "@/components/SignupView";
import { pageMeta } from "@/lib/meta";
import { FREE_PER_MINUTE, SIGNED_IN_PER_MINUTE } from "@/lib/consent";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Sign up",
    description: "Sign up for product updates and promotions from NiPlex. A free account with an email code and a password also raises the site assistant's question limit.",
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
        Sign up to get product updates and promotions from NiPlex by email. You also get a free account, which lifts the assistant from {FREE_PER_MINUTE} to {SIGNED_IN_PER_MINUTE} questions a minute.
      </p>
      <ol className="signup-steps" aria-label="How it works">
        <li><span><strong>Email.</strong> Tick the box to agree to product and promotional emails.</span></li>
        <li><span><strong>Code.</strong> A 6-digit code arrives by email and proves the address is yours.</span></li>
        <li><span><strong>Password.</strong> Pick one with at least 8 characters.</span></li>
      </ol>
      <SignupView />
      <p className="signup-more">
        Just want the emails, without an account? <Link href="/newsletter">Join the newsletter</Link>.
      </p>
    </main>
  );
}
