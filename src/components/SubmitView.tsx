"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { KINDS, LIMITS, checkSubmission, formatDay, toSubmission, type Kind, type Submission } from "@/lib/submissions";

/** The form, and the latest submissions below it. A new one shows up at the top as soon as it is saved. */
export function SubmitView() {
  const uid = useId();
  const [items, setItems] = useState<Submission[]>([]);
  // The list comes from the API service when the page opens: "loading", then "ready" or "failed".
  const [listState, setListState] = useState<"loading" | "ready" | "failed">("loading");
  const [kind, setKind] = useState<Kind>("idea");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [trap, setTrap] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fresh, setFresh] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/submit", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { items?: unknown[] } | null) => {
        if (cancelled) return;
        if (!data || !Array.isArray(data.items)) {
          setListState("failed");
          return;
        }
        const list = data.items.map(toSubmission).filter((x): x is Submission => x !== null);
        // A submission sent while the list was loading stays on top.
        setItems((current) => [...current, ...list.filter((l) => !current.some((c) => c.id === l.id))].slice(0, 30));
        setListState("ready");
      })
      .catch(() => {
        if (!cancelled) setListState("failed");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function send(event: FormEvent) {
    event.preventDefault();
    setError("");
    setDone(false);
    const checked = checkSubmission({ kind, title, body, author });
    if (!checked.ok) {
      setError(checked.error);
      return;
    }
    setBusy(true);
    let reply: { ok: boolean; data: Record<string, unknown> };
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, title, body, author, website: trap })
      });
      const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      reply = { ok: response.ok, data };
    } catch {
      reply = { ok: false, data: { error: "Could not reach the server. Please try again." } };
    }
    setBusy(false);
    if (!reply.ok) {
      setError(typeof reply.data.error === "string" && reply.data.error ? reply.data.error : "That did not work. Please try again.");
      return;
    }
    const item = reply.data.item as Submission | null | undefined;
    if (item && typeof item.id === "number") {
      setItems((current) => [item, ...current.filter((c) => c.id !== item.id)].slice(0, 30));
      setFresh(item.id);
    }
    setTitle("");
    setBody("");
    setDone(true);
  }

  const kindLabel = (id: Kind) => KINDS.find((k) => k.id === id)?.label ?? id;

  return (
    <div className="submit-layout">
      <form className="signup-card submit-form" onSubmit={send} aria-label="Send a submission">
        <fieldset className="kind-pick">
          <legend>What is it?</legend>
          {KINDS.map((k) => (
            <label key={k.id} className={"kind-option" + (kind === k.id ? " is-on" : "")}>
              <input type="radio" name={uid + "-kind"} value={k.id} checked={kind === k.id} onChange={() => setKind(k.id)} />
              <span>
                <strong>{k.label}</strong>
                <small>{k.hint}</small>
              </span>
            </label>
          ))}
        </fieldset>

        <label className="field" htmlFor={uid + "-title"}>
          <span className="field-head">
            <span>Title</span>
            <span className="field-count">{Array.from(title).length}/{LIMITS.title.max}</span>
          </span>
          <input
            id={uid + "-title"}
            className="news-input field-input"
            type="text"
            value={title}
            maxLength={LIMITS.title.max}
            placeholder="A short name for it"
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label className="field" htmlFor={uid + "-body"}>
          <span className="field-head">
            <span>Description</span>
            <span className="field-count">{Array.from(body).length}/{LIMITS.body.max}</span>
          </span>
          <textarea
            id={uid + "-body"}
            className="news-input field-input"
            rows={5}
            value={body}
            maxLength={LIMITS.body.max}
            placeholder="What should it do, and why would it help?"
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </label>

        <label className="field" htmlFor={uid + "-author"}>
          <span className="field-head">
            <span>Name (optional)</span>
          </span>
          <input
            id={uid + "-author"}
            className="news-input field-input"
            type="text"
            value={author}
            maxLength={LIMITS.author.max}
            placeholder="Shown as Anonymous if empty"
            autoComplete="nickname"
            onChange={(e) => setAuthor(e.target.value)}
          />
        </label>

        {/* A field only bots fill in. */}
        <div className="news-trap" aria-hidden="true">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
          </label>
        </div>

        <p className="signup-points-note">Everything you send here is public: the title, the description and the name. Links, email addresses and phone numbers are not accepted.</p>

        {error && (
          <p className="news-error" role="alert">
            {error}
          </p>
        )}
        {done && !error && (
          <p className="submit-thanks" role="status">
            Thanks. It is on the list.
          </p>
        )}
        <div>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Sending" : "Submit"}
          </button>
        </div>
      </form>

      <section className="submit-list" aria-labelledby={uid + "-latest"}>
        <h2 id={uid + "-latest"}>Latest submissions</h2>
        {listState === "loading" && items.length === 0 ? (
          <p className="submit-empty">Loading the latest submissions…</p>
        ) : listState === "failed" && items.length === 0 ? (
          <p className="submit-empty">The list could not be loaded right now. Please try again in a moment.</p>
        ) : items.length === 0 ? (
          <p className="submit-empty">Nothing here yet. The first one is yours.</p>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.id} className={"sub-card" + (item.id === fresh ? " is-new" : "")}>
                <div className="sub-top">
                  <span className={"sub-kind kind-" + item.kind}>{kindLabel(item.kind)}</span>
                  <span className="sub-meta">
                    {item.author ?? "Anonymous"}
                    {formatDay(item.createdAt) && " · " + formatDay(item.createdAt)}
                  </span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
