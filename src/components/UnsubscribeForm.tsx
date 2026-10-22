"use client";

import { useEffect, useId, useState, type FormEvent } from "react";

/** Removes an address from the product updates and promotions list. No account or code needed. */
export function UnsubscribeForm() {
  const uid = useId();
  const [email, setEmail] = useState("");
  const [trap, setTrap] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");

  // A link in an email can carry the address (?email=...), so the visitor only has to press the button.
  useEffect(() => {
    try {
      const fromLink = new URLSearchParams(window.location.search).get("email");
      if (fromLink && fromLink.length <= 254) setEmail(fromLink);
    } catch {
      /* no query string to read */
    }
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website: trap })
      });
      let data: { error?: string } = {};
      try {
        data = (await response.json()) as { error?: string };
      } catch {
        /* not JSON */
      }
      if (!response.ok) {
        setError(data.error || "That did not work. Please try again.");
      } else {
        setDone(email.trim());
      }
    } catch {
      setError("Could not reach the server. Please try again.");
    }
    setBusy(false);
  }

  if (done) {
    return (
      <div className="news-form is-page" aria-live="polite">
        <div className="news-state left" role="status">
          <p className="news-lead">
            Done. <strong>{done}</strong> is off the list.
          </p>
          <p className="news-small">If it was on the list, nothing more will be sent to it. If you change your mind, subscribe again from the newsletter page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="news-form is-page" aria-live="polite">
      <form onSubmit={submit}>
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
            {busy ? "Removing" : "Unsubscribe"}
          </button>
        </div>
        {/* A field only bots fill in. */}
        <div className="news-trap" aria-hidden="true">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
          </label>
        </div>
        {error && (
          <p className="news-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
