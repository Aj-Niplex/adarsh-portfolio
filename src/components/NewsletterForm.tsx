"use client";

import Link from "next/link";
import { useEffect, useId, useState, type FormEvent } from "react";
import { CONSENT_TEXT } from "@/lib/consent";
import { PaperPlane } from "./PaperPlane";

type Stage = "form" | "sending" | "code" | "saved" | "done";
type Reply = { ok: boolean; data: Record<string, unknown> };

async function post(url: string, body: Record<string, unknown>): Promise<Reply> {
  try {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const raw = await response.text();
    let data: Record<string, unknown> = {};
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") data = parsed as Record<string, unknown>;
    } catch {
      /* not JSON */
    }
    return { ok: response.ok, data };
  } catch {
    return { ok: false, data: { error: "Could not reach the server. Please try again." } };
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const message = (data: Record<string, unknown>, fallback: string) => (typeof data.error === "string" && data.error ? data.error : fallback);

/** Newsletter sign-up. Works with or without email delivery: unconfirmed addresses are kept but never mailed. */
export function NewsletterForm({ tone = "footer" }: { tone?: "footer" | "page" }) {
  const uid = useId();
  const [stage, setStage] = useState<Stage>("form");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [trap, setTrap] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (resendAt <= Date.now()) return;
    const timer = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= resendAt) clearInterval(timer);
    }, 500);
    return () => clearInterval(timer);
  }, [resendAt]);
  const secondsLeft = Math.max(Math.ceil((resendAt - now) / 1000), 0);

  async function subscribe(event?: FormEvent) {
    event?.preventDefault();
    setError("");
    if (!consent) {
      setError("Tick the box to agree to the emails first.");
      return;
    }
    setBusy(true);
    setStage("sending");
    const [reply] = await Promise.all([post("/api/newsletter", { email, consent: true, website: trap }), wait(1200)]);
    setBusy(false);
    if (!reply.ok) {
      setError(message(reply.data, "That did not work. Please try again."));
      setStage("form");
      return;
    }
    if (reply.data.stage === "code") {
      setCode("");
      setResendAt(Date.now() + (Number(reply.data.retryAfter) || 45) * 1000);
      setNow(Date.now());
      setStage("code");
      return;
    }
    setStage("saved");
  }

  async function confirm(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const reply = await post("/api/auth/verify", { email, code, consent: true });
    setBusy(false);
    if (!reply.ok) {
      setError(message(reply.data, "That code did not work."));
      return;
    }
    setStage("done");
  }

  const errorLine = error && (
    <p className="news-error" role="alert">
      {error}
    </p>
  );

  return (
    <div className={"news-form is-" + tone} aria-live="polite">
      {stage === "form" && (
        <form onSubmit={subscribe}>
          <div className="news-row">
            <label className="sr-only" htmlFor={uid + "-email"}>
              Email address
            </label>
            <input
              id={uid + "-email"}
              className="news-input"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn btn-primary news-button" disabled={busy}>
              Subscribe
            </button>
          </div>
          {/* A field only bots fill in. */}
          <div className="news-trap" aria-hidden="true">
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
            </label>
          </div>
          <label className="news-consent">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>{CONSENT_TEXT}</span>
          </label>
          {errorLine}
        </form>
      )}

      {stage === "sending" && (
        <div className="news-state" role="status">
          <PaperPlane />
          <p>Sending to {email}</p>
        </div>
      )}

      {stage === "code" && (
        <form onSubmit={confirm} className="news-code">
          <p className="news-lead">
            I sent a 6-digit code to <strong>{email}</strong>. It can take a minute; check spam too.
          </p>
          <div className="news-row">
            <label className="sr-only" htmlFor={uid + "-code"}>
              6-digit code
            </label>
            <input
              id={uid + "-code"}
              className="news-input otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
            <button type="submit" className="btn btn-primary news-button" disabled={busy || code.length !== 6}>
              {busy ? "Checking" : "Confirm"}
            </button>
          </div>
          {errorLine}
          <div className="news-links">
            <button type="button" className="link-btn" disabled={secondsLeft > 0 || busy} onClick={() => subscribe()}>
              {secondsLeft > 0 ? "Send a new code in " + secondsLeft + "s" : "Send a new code"}
            </button>
            <button type="button" className="link-btn" onClick={() => { setError(""); setStage("form"); }}>
              Use another email
            </button>
          </div>
        </form>
      )}

      {stage === "saved" && (
        <div className="news-state left" role="status">
          <p className="news-lead">
            You are on the list: <strong>{email}</strong>.
          </p>
          <p className="news-small">The address is saved but not confirmed yet, so nothing has been sent to it. I will ask you to confirm it before the first update goes out.</p>
        </div>
      )}

      {stage === "done" && (
        <div className="news-state left" role="status">
          <p className="news-lead">
            Confirmed. <strong>{email}</strong> is subscribed.
          </p>
          <p className="news-small">
            Want an account too? <Link href="/signup">Create a password</Link>.
          </p>
        </div>
      )}
    </div>
  );
}
