"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, LoaderCircle, MessageSquare, RotateCcw, Send, X } from "lucide-react";
import type { ChatEvent, SessionInfo } from "@/lib/chatTypes";
import { CONSENT_TEXT, FREE_PER_MINUTE, SIGNED_IN_PER_MINUTE } from "@/lib/consent";
import { Markdown } from "./Markdown";

type Step = { id: string; label: string; detail?: string; status: "running" | "done" };
type Source = { title: string; url: string };

type Msg = {
  id: number;
  role: "user" | "assistant" | "notice";
  content: string;
  steps?: Step[];
  sources?: Source[];
  links?: string[];
  phase?: "working" | "writing" | "done" | "error";
  ms?: number;
  question?: string;
};

const GREETING =
  "Ask me about the projects: what NiPlex-Harness does, how NiPlex-MCP is built, or which one fits what you need. I read the site's docs before I answer, and you can watch each step.";

const SUGGESTIONS = ["What is NiPlex-MCP?", "How does NiPlex-Harness keep code execution safe?", "Show how a request flows through NiPlex-MCP"];

let nextId = 1;

/** A request that never got a reply (a dropped mobile connection, say) is tried once more before giving up. */
async function postChat(body: string, signal: AbortSignal) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body, signal });
    } catch (error) {
      if ((error as Error).name === "AbortError" || attempt >= 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 700));
    }
  }
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/** Reveals streamed text a little at a time so it reads like typing. */
function useTypewriter(target: string, live: boolean) {
  const [shown, setShown] = useState(() => (live ? 0 : target.length));
  const targetRef = useRef(target);
  targetRef.current = target;

  useEffect(() => {
    if (!live) {
      setShown(target.length);
      return;
    }
    if (prefersReducedMotion()) {
      setShown(target.length);
      return;
    }
    let frame = 0;
    const tick = () => {
      setShown((current) => {
        const full = targetRef.current.length;
        if (current >= full) return current;
        const backlog = full - current;
        let next = current + Math.max(1, Math.ceil(backlog / 14));
        const code = targetRef.current.charCodeAt(next - 1);
        if (code >= 0xd800 && code <= 0xdbff) next += 1;
        return Math.min(next, full);
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [live, target.length === 0]); // eslint-disable-line react-hooks/exhaustive-deps

  return live ? target.slice(0, shown) : target;
}

function Trace({ steps, phase, ms }: { steps: Step[]; phase: Msg["phase"]; ms?: number }) {
  const working = phase === "working" || phase === "writing";
  const [open, setOpen] = useState(true);
  const wasWorking = useRef(working);

  useEffect(() => {
    // Fold the trace away once the answer is complete; the visitor can open it again.
    if (wasWorking.current && !working) setOpen(false);
    wasWorking.current = working;
  }, [working]);

  const reads = steps.filter((s) => s.id.startsWith("read:")).length;
  const summary = working
    ? "Reading the docs"
    : "Read " + reads + (reads === 1 ? " page" : " pages") + (ms ? " · " + (ms / 1000).toFixed(1) + "s" : "");

  return (
    <div className="trace">
      <button type="button" className="trace-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {working ? <LoaderCircle size={13} className="spin" /> : <Check size={13} />}
        <span>{summary}</span>
        <ChevronDown size={13} className={"trace-chev" + (open ? " is-open" : "")} />
      </button>
      {open && (
        <ol className="trace-list">
          {steps.map((s) => (
            <li key={s.id} className={s.status === "running" ? "is-running" : "is-done"}>
              <span className="trace-icon" aria-hidden="true">
                {s.status === "running" ? <LoaderCircle size={12} className="spin" /> : <Check size={12} />}
              </span>
              <span className="trace-text">
                <span>{s.label}</span>
                {s.detail && <small>{s.detail}</small>}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Answer({ msg }: { msg: Msg }) {
  const live = msg.phase === "working" || msg.phase === "writing";
  const text = useTypewriter(msg.content, live);
  const typing = live || text.length < msg.content.length;
  const allowed = useMemo(() => new Set((msg.links || []).map((l) => l.replace(/\/+$/, "") || "/")), [msg.links]);
  const allowLink = useCallback(
    (href: string) => {
      if (href.startsWith("#")) return true;
      if (href.startsWith("mailto:")) return false;
      let target = href.replace(/[#?].*$/, "").replace(/\/+$/, "") || "/";
      // The same site on another address (a preview or local run) counts as an internal path.
      if (typeof window !== "undefined" && target.startsWith(window.location.origin)) {
        target = target.slice(window.location.origin.length) || "/";
      }
      return allowed.has(target);
    },
    [allowed]
  );

  return (
    <>
      {msg.steps && msg.steps.length > 0 && <Trace steps={msg.steps} phase={msg.phase} ms={msg.ms} />}
      {text && <Markdown text={text} streaming={typing} allowLink={allowLink} />}
      {live && !text && (!msg.steps || msg.steps.length === 0) && <p className="chat-wait">One moment</p>}
      {msg.phase === "writing" && !text && <p className="chat-wait">Writing</p>}
      {!typing && msg.sources && msg.sources.length > 0 && msg.phase === "done" && (
        <div className="sources">
          <span>Sources</span>
          {msg.sources.map((s) => (
            <a key={s.url} href={s.url}>
              {s.title}
            </a>
          ))}
        </div>
      )}
    </>
  );
}

export function AIWidget() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [session, setSession] = useState<SessionInfo>({ available: false, signedIn: false, limit: FREE_PER_MINUTE });
  const [remaining, setRemaining] = useState<number | null>(null);
  const [blockedUntil, setBlockedUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [signInOpen, setSignInOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [formError, setFormError] = useState("");
  const [formBusy, setFormBusy] = useState(false);

  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const abortRef = useRef<AbortController | null>(null);
  const stickRef = useRef(true);

  const close = useCallback(() => {
    setOpen(false);
    // Hand keyboard focus back to the launcher so keyboard users keep their place.
    requestAnimationFrame(() => toggleRef.current?.focus());
  }, []);

  useEffect(() => {
    fetch("/api/session", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: SessionInfo | null) => data && setSession(data))
      .catch(() => {});
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const el = logRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [messages, signInOpen, open]);

  useEffect(() => {
    if (blockedUntil <= Date.now()) return;
    const timer = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= blockedUntil) clearInterval(timer);
    }, 500);
    return () => clearInterval(timer);
  }, [blockedUntil]);

  const secondsLeft = Math.max(0, Math.ceil((blockedUntil - now) / 1000));
  const blocked = secondsLeft > 0;

  const patch = useCallback((id: number, fn: (m: Msg) => Msg) => {
    setMessages((cur) => cur.map((m) => (m.id === id ? fn(m) : m)));
  }, []);

  const enqueue = useCallback((delay: number, fn: () => void) => {
    const wait = prefersReducedMotion() ? 0 : delay;
    queueRef.current = queueRef.current.then(
      () =>
        new Promise<void>((resolve) => {
          setTimeout(() => {
            fn();
            resolve();
          }, wait);
        })
    );
    return queueRef.current;
  }, []);

  async function ask(question: string) {
    const text = question.trim();
    if (!text || busy || blocked) return;

    const history = messages
      .filter((m) => (m.role === "user" || m.role === "assistant") && m.phase !== "error" && m.content)
      .slice(-6)
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const answerId = nextId++;
    stickRef.current = true;
    setMessages((cur) => [
      ...cur,
      { id: nextId++, role: "user", content: text },
      { id: answerId, role: "assistant", content: "", steps: [], phase: "working", question: text }
    ]);
    setDraft("");
    setBusy(true);
    queueRef.current = Promise.resolve();
    const started = Date.now();
    const controller = new AbortController();
    abortRef.current = controller;

    const fail = (message: string) =>
      enqueue(0, () => patch(answerId, (m) => ({ ...m, content: message, phase: "error", steps: m.steps?.map((s) => ({ ...s, status: "done" as const })) })));

    const apply = (ev: ChatEvent) => {
      if (ev.type === "step") {
        enqueue(90, () =>
          patch(answerId, (m) => {
            const steps = [...(m.steps || [])];
            const at = steps.findIndex((s) => s.id === ev.id);
            const running: Step = { id: ev.id, label: ev.label, detail: ev.detail, status: "running" };
            if (at === -1) steps.push(running);
            else steps[at] = { ...steps[at], ...running };
            return { ...m, steps, phase: ev.id === "write" ? "writing" : m.phase };
          })
        );
        if (ev.status === "done") {
          enqueue(130, () =>
            patch(answerId, (m) => ({ ...m, steps: m.steps?.map((s) => (s.id === ev.id ? { ...s, status: "done" as const } : s)) }))
          );
        }
      } else if (ev.type === "sources") {
        enqueue(0, () => patch(answerId, (m) => ({ ...m, sources: ev.items, links: ev.links })));
      } else if (ev.type === "token") {
        enqueue(0, () => patch(answerId, (m) => ({ ...m, content: m.content + ev.text })));
      } else if (ev.type === "done") {
        enqueue(0, () => {
          patch(answerId, (m) => ({ ...m, phase: "done", ms: Date.now() - started, steps: m.steps?.map((s) => ({ ...s, status: "done" as const })) }));
          if (ev.usage.remaining !== null) setRemaining(ev.usage.remaining);
        });
      } else if (ev.type === "error") {
        fail(ev.message);
      }
    };

    try {
      const payload = JSON.stringify({ messages: [...history, { role: "user", content: text }] });
      const response = await postChat(payload, controller.signal);

      if (!response.ok) {
        // The server may answer with JSON or, on a timeout, a plain-text error page. Never show a parser error.
        const raw = await response.text();
        let data: { error?: string; retryAfter?: number; limit?: number; canSignIn?: boolean } = {};
        try {
          data = JSON.parse(raw);
        } catch {
          /* not JSON */
        }
        if (response.status === 429 && data.retryAfter) {
          setBlockedUntil(Date.now() + data.retryAfter * 1000);
          setNow(Date.now());
          setRemaining(0);
          setMessages((cur) => cur.filter((m) => m.id !== answerId));
          setMessages((cur) => [
            ...cur,
            { id: nextId++, role: "notice", content: (data.error || "You are asking too fast.") + " Try again in a moment." }
          ]);
        } else {
          const message =
            data.error ||
            (response.status === 504 || response.status === 408
              ? "That took too long. Please try again."
              : "The assistant is unavailable right now. Please try again shortly.");
          await fail(message);
        }
        return;
      }

      if (!response.body) throw new Error("no body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let sawDone = false;
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const ev = JSON.parse(line) as ChatEvent;
            if (ev.type === "done" || ev.type === "error") sawDone = true;
            apply(ev);
          } catch {
            /* skip a malformed line */
          }
        }
      }
      if (!sawDone) await fail("The connection dropped before the answer finished. Please try again.");
    } catch (error) {
      if ((error as Error).name !== "AbortError") await fail("Could not reach the assistant. Check your connection and try again.");
    } finally {
      await queueRef.current;
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(draft);
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!consent) {
      setFormError("Tick the box to agree to product emails.");
      return;
    }
    setFormBusy(true);
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent: true })
      });
      const raw = await response.text();
      let data: (SessionInfo & { error?: string }) | null = null;
      try {
        data = JSON.parse(raw);
      } catch {
        /* not JSON */
      }
      if (!response.ok || !data || !data.signedIn) {
        setFormError(data?.error || "Sign-in did not work. Please try again.");
        return;
      }
      setSession(data);
      setSignInOpen(false);
      setEmail("");
      setConsent(false);
      setRemaining(null);
      setBlockedUntil(0);
    } catch {
      setFormError("Could not reach the server. Please try again.");
    } finally {
      setFormBusy(false);
    }
  }

  async function signOut(forget: boolean) {
    try {
      const response = await fetch("/api/session" + (forget ? "?forget=1" : ""), { method: "DELETE" });
      const data = (await response.json()) as SessionInfo;
      setSession(data);
      setRemaining(null);
    } catch {
      /* leave the state as it is */
    }
  }

  const lastAnswer = [...messages].reverse().find((m) => m.role === "assistant");
  const canRetry = !busy && lastAnswer?.phase === "error" && lastAnswer.question;

  return (
    <>
      {open && (
        <section
          className="chat-panel"
          aria-label="Ask about the projects"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              close();
            }
          }}
        >
          <header className="chat-head">
            <strong>Ask about the work</strong>
            <button type="button" className="chat-icon" onClick={close} aria-label="Close chat">
              <X size={16} />
            </button>
          </header>

          <div
            className="chat-log"
            ref={logRef}
            aria-live="polite"
            onScroll={(e) => {
              const el = e.currentTarget;
              stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
            }}
          >
            <p className="chat-note">
              Answers come from Google Gemini and only from this site&apos;s public project docs. Do not send passwords, keys or private data.
            </p>
            <div className="chat-msg from-ai">
              <p className="chat-plain">{GREETING}</p>
              {messages.length === 0 && (
                <div className="suggest">
                  {SUGGESTIONS.map((s) => (
                    <button type="button" key={s} onClick={() => void ask(s)} disabled={busy || blocked}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {messages.map((m) =>
              m.role === "user" ? (
                <div className="chat-msg from-user" key={m.id}>
                  {m.content}
                </div>
              ) : m.role === "notice" ? (
                <div className="chat-msg from-notice" key={m.id} role="status">
                  {m.content}
                  {!session.signedIn && session.available && (
                    <button type="button" className="link-btn" onClick={() => setSignInOpen(true)}>
                      Sign in for {SIGNED_IN_PER_MINUTE} a minute
                    </button>
                  )}
                </div>
              ) : (
                <div className={"chat-msg from-ai" + (m.phase === "error" ? " is-error" : "")} key={m.id}>
                  {m.phase === "error" ? (
                    <>
                      {m.steps && m.steps.length > 0 && <Trace steps={m.steps} phase="error" />}
                      <p className="chat-plain">{m.content}</p>
                    </>
                  ) : (
                    <Answer msg={m} />
                  )}
                </div>
              )
            )}
            {canRetry && (
              <button type="button" className="link-btn retry" onClick={() => void ask(lastAnswer!.question!)}>
                <RotateCcw size={13} /> Try again
              </button>
            )}
          </div>

          <div className="chat-meta">
            <span aria-live="polite">
              {blocked
                ? "Next question in " + secondsLeft + "s"
                : remaining !== null
                  ? remaining + " of " + session.limit + " questions left this minute"
                  : session.limit + " questions a minute"}
            </span>
            {session.signedIn ? (
              <span className="meta-actions">
                {session.email}
                <button type="button" className="link-btn" onClick={() => void signOut(false)}>
                  Sign out
                </button>
                <button type="button" className="link-btn" onClick={() => void signOut(true)}>
                  Delete my email
                </button>
              </span>
            ) : (
              session.available && (
                <button type="button" className="link-btn" onClick={() => setSignInOpen((v) => !v)} aria-expanded={signInOpen}>
                  Sign in for {SIGNED_IN_PER_MINUTE} a minute
                </button>
              )
            )}
          </div>

          {signInOpen && !session.signedIn && (
            <form className="signin" onSubmit={signIn}>
              <label>
                <span>Email</span>
                <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" maxLength={254} />
              </label>
              <label className="consent">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>{CONSENT_TEXT}</span>
              </label>
              <p className="signin-note">
                We keep your email and the date you agreed, only for those emails. Nothing else is stored about you. Use &quot;Delete my email&quot; once you are signed in to remove it.
              </p>
              {formError && <p className="signin-error" role="alert">{formError}</p>}
              <div className="signin-actions">
                <button type="submit" className="chat-submit" disabled={formBusy}>
                  {formBusy ? "Signing in" : "Sign in"}
                </button>
                <button type="button" className="link-btn" onClick={() => setSignInOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          <form className="chat-form" onSubmit={onSubmit}>
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={blocked ? "Wait " + secondsLeft + "s" : "Ask a question"}
              rows={1}
              maxLength={600}
              aria-label="Your question"
              onKeyDown={(e) => {
                // Enter confirms an IME composition (Japanese, Chinese, Korean); it must not send the message.
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <button type="submit" className="chat-send" aria-label="Send" disabled={busy || blocked || !draft.trim()}>
              <Send size={16} />
            </button>
          </form>
        </section>
      )}
      <button
        type="button"
        ref={toggleRef}
        className="chat-toggle"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-label={open ? "Close chat" : "Ask about the work"}
      >
        <MessageSquare size={18} />
        <span>{open ? "Close" : "Ask"}</span>
      </button>
    </>
  );
}
