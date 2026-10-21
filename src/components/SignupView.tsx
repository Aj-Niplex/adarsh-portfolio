"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FREE_PER_MINUTE, SIGNED_IN_PER_MINUTE } from "@/lib/consent";
import type { SessionInfo } from "@/lib/chatTypes";
import { NewsletterForm } from "./NewsletterForm";
import { SignIn } from "./SignIn";

type State = { phase: "loading" } | { phase: "ready"; info: SessionInfo };

/** The /signup page: the account form when email sign-in is available, an honest notice when it is not. */
export function SignupView() {
  const [state, setState] = useState<State>({ phase: "loading" });
  const [welcome, setWelcome] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let live = true;
    fetch("/api/session", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((info: SessionInfo | null) => {
        if (!live) return;
        setState({ phase: "ready", info: info ?? { available: false, signedIn: false, limit: FREE_PER_MINUTE } });
      })
      .catch(() => live && setState({ phase: "ready", info: { available: false, signedIn: false, limit: FREE_PER_MINUTE } }));
    return () => {
      live = false;
    };
  }, []);

  async function signOut(forget: boolean) {
    setLeaving(true);
    try {
      const response = await fetch("/api/session" + (forget ? "?forget=1" : ""), { method: "DELETE" });
      const info = (await response.json()) as SessionInfo;
      setState({ phase: "ready", info });
      setWelcome(false);
    } catch {
      /* keep the current view */
    }
    setLeaving(false);
  }

  if (state.phase === "loading") {
    return (
      <div className="signup-card" role="status" aria-live="polite">
        <p className="signup-muted">Loading</p>
      </div>
    );
  }

  const info = state.info;

  if (info.signedIn) {
    return (
      <div className="signup-card" role="status" aria-live="polite">
        <h2>{welcome ? "You are in." : "You are signed in."}</h2>
        <p>
          Signed in as <strong className="signup-email">{info.email}</strong>. The assistant now answers up to {SIGNED_IN_PER_MINUTE} questions a minute instead of {FREE_PER_MINUTE}.
        </p>
        <div className="signup-actions">
          <Link href="/projects" className="btn btn-primary">
            Browse the projects
          </Link>
          <button type="button" className="link-btn" disabled={leaving} onClick={() => void signOut(false)}>
            Sign out
          </button>
          <button type="button" className="link-btn" disabled={leaving} onClick={() => void signOut(true)}>
            Delete my email
          </button>
        </div>
      </div>
    );
  }

  if (!info.available) {
    return (
      <div className="signup-card">
        <h2>Join the list now, account next</h2>
        <p>
          Leave your email below and you are on the product and promotions list today. The account part (the 6-digit code and a password) needs the email service that sends the codes, which is not connected yet. This page adds that step by itself once it is.
        </p>
        <NewsletterForm tone="page" />
      </div>
    );
  }

  return (
    <div className="signup-card">
      <SignIn
        variant="page"
        onSignedIn={(next) => {
          setWelcome(true);
          setState({ phase: "ready", info: next });
        }}
      />
    </div>
  );
}
