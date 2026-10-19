"use client";

import { Eye, EyeOff, Footprints } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CONSENT_TEXT } from "@/lib/consent";
import type { SessionInfo } from "@/lib/chatTypes";
import { LottiePlayer } from "./LottiePlayer";

type Step = "email" | "sending" | "code" | "password" | "login" | "setup";
type Reply = { ok: boolean; data: Record<string, unknown> };

async function post(url: string, body: Record<string, unknown>): Promise<Reply> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
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

const PLANE_PATH = "M6 62 C 40 62, 52 22, 92 30 S 130 18, 150 14";

/** A small paper plane that flies along a dashed trail while the code is on its way. */
function PaperPlane() {
  const still = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  return (
    <svg className="plane" viewBox="0 0 160 80" width="160" height="80" aria-hidden="true">
      <path className="plane-trail" d={PLANE_PATH} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 7" />
      <g className="plane-body" transform={still ? "translate(150 14) rotate(-15)" : undefined}>
        <path d="M0 0 L-4 -9 L26 0 L-4 9 Z" fill="currentColor" />
        <path d="M-4 -9 L8 0 L-4 9 Z" fill="currentColor" opacity="0.55" />
        {!still && (
          <>
            <animateMotion dur="2.2s" repeatCount="indefinite" rotate="auto" path={PLANE_PATH} calcMode="spline" keyTimes="0;1" keySplines="0.45 0 0.55 1" />
            <animate attributeName="opacity" dur="2.2s" repeatCount="indefinite" values="0;1;1;0" keyTimes="0;0.12;0.88;1" />
          </>
        )}
      </g>
    </svg>
  );
}

export function SignIn({ onSignedIn, onCancel }: { onSignedIn: (info: SessionInfo) => void; onCancel: () => void }) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const rootRef = useRef<HTMLDivElement>(null);

  // Put the cursor in the first field of whichever step is showing.
  useEffect(() => {
    const field = rootRef.current?.querySelector<HTMLInputElement>("input:not([type=checkbox])");
    field?.focus();
  }, [step]);

  useEffect(() => {
    if (resendAt <= Date.now()) return;
    const timer = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= resendAt) clearInterval(timer);
    }, 500);
    return () => clearInterval(timer);
  }, [resendAt]);

  const secondsLeft = Math.max(Math.ceil((resendAt - now) / 1000), 0);

  async function sendCode(event?: FormEvent) {
    event?.preventDefault();
    setError("");
    if (!consent) {
      setError("Tick the box to agree to product emails.");
      return;
    }
    setBusy(true);
    setStep("sending");
    const [reply] = await Promise.all([post("/api/auth/start", { email, consent: true }), wait(1400)]);
    setBusy(false);
    if (!reply.ok) {
      setError(message(reply.data, "The code could not be sent. Please try again."));
      const retry = Number(reply.data.retryAfter);
      if (reply.data.retryAfter && Number.isFinite(retry) && /already|moment/i.test(String(reply.data.error))) {
        // A code is already on its way: go to the code step so it can be entered.
        setResendAt(Date.now() + retry * 1000);
        setNow(Date.now());
        setStep("code");
        return;
      }
      setStep("email");
      return;
    }
    setCode("");
    setResendAt(Date.now() + (Number(reply.data.retryAfter) || 45) * 1000);
    setNow(Date.now());
    setStep("code");
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const reply = await post("/api/auth/verify", { email, code, consent: true });
    setBusy(false);
    if (!reply.ok) {
      setError(message(reply.data, "That code did not work."));
      return;
    }
    setHasPassword(reply.data.hasPassword === true);
    setPassword("");
    setStep("password");
  }

  async function createPassword(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const reply = await post("/api/auth/password", { password });
    if (!reply.ok) {
      setBusy(false);
      setError(message(reply.data, "The password could not be saved."));
      if (reply.data.reason === "ticket") setStep("email");
      return;
    }
    setStep("setup");
    await wait(2600);
    setBusy(false);
    onSignedIn(reply.data as unknown as SessionInfo);
  }

  async function logIn(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const reply = await post("/api/auth/login", { email, password });
    if (!reply.ok) {
      setBusy(false);
      setError(message(reply.data, "Sign-in did not work. Please try again."));
      return;
    }
    setStep("setup");
    await wait(1800);
    setBusy(false);
    onSignedIn(reply.data as unknown as SessionInfo);
  }

  const passwordField = (label: string, autoComplete: string) => (
    <label>
      <span>{label}</span>
      <span className="pw">
        <input
          type={showPassword ? "text" : "password"}
          required
          minLength={8}
          maxLength={128}
          autoComplete={autoComplete}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="button" className="pw-toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </span>
    </label>
  );

  const errorLine = error && (
    <p className="signin-error" role="alert">
      {error}
    </p>
  );

  return (
    <div className="signin" ref={rootRef} aria-live="polite">
      {step === "email" && (
        <form onSubmit={sendCode} className="signin-form">
          <label>
            <span>Email</span>
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" maxLength={254} />
          </label>
          <label className="consent">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>{CONSENT_TEXT}</span>
          </label>
          <p className="signin-note">
            We email you a 6-digit code to prove the address is yours. We keep your email and the date you agreed, only for those emails. &quot;Delete my email&quot; removes everything once you are signed in.
          </p>
          {errorLine}
          <div className="signin-center">
            <button type="submit" className="chat-submit" disabled={busy}>
              Send OTP
            </button>
          </div>
          <div className="signin-actions center">
            <button type="button" className="link-btn" onClick={() => { setError(""); setPassword(""); setStep("login"); }}>
              I already have a password
            </button>
            <button type="button" className="link-btn" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {step === "sending" && (
        <div className="signin-state" role="status">
          <PaperPlane />
          <p>Sending your code to {email}</p>
        </div>
      )}

      {step === "code" && (
        <form onSubmit={verify} className="signin-form">
          <p className="signin-lead">
            We sent a 6-digit code to <strong>{email}</strong>. It can take a minute to arrive; check spam too.
          </p>
          <label>
            <span>Code</span>
            <input
              className="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9 ]*"
              maxLength={7}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^\d ]/g, ""))}
              placeholder="000 000"
              aria-label="6-digit code"
            />
          </label>
          {errorLine}
          <div className="signin-center">
            <button type="submit" className="chat-submit" disabled={busy || code.replace(/\s/g, "").length !== 6}>
              {busy ? "Checking" : "Verify code"}
            </button>
          </div>
          <div className="signin-actions center">
            <button type="button" className="link-btn" disabled={secondsLeft > 0 || busy} onClick={() => void sendCode()}>
              {secondsLeft > 0 ? "Send again in " + secondsLeft + "s" : "Send a new code"}
            </button>
            <button type="button" className="link-btn" onClick={() => { setError(""); setStep("email"); }}>
              Use another email
            </button>
          </div>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={createPassword} className="signin-form">
          <h3 className="signin-title">{hasPassword ? "Set a new password" : "Create a Password"} <span aria-hidden="true">🔑</span></h3>
          <p className="signin-lead">Your email is verified. Pick a password to sign in faster next time (8 characters or more).</p>
          {passwordField("Password", "new-password")}
          {errorLine}
          <div className="signin-center">
            <button type="submit" className="chat-submit" disabled={busy || password.length < 8}>
              {busy ? "Saving" : hasPassword ? "Save password" : "Create account"}
            </button>
          </div>
        </form>
      )}

      {step === "login" && (
        <form onSubmit={logIn} className="signin-form">
          <h3 className="signin-title">Sign in</h3>
          <label>
            <span>Email</span>
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" maxLength={254} />
          </label>
          {passwordField("Password", "current-password")}
          {errorLine}
          <div className="signin-center">
            <button type="submit" className="chat-submit" disabled={busy}>
              {busy ? "Signing in" : "Sign in"}
            </button>
          </div>
          <div className="signin-actions center">
            <button type="button" className="link-btn" onClick={() => { setError(""); setStep("email"); }}>
              Email me a code instead
            </button>
            <button type="button" className="link-btn" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {step === "setup" && (
        <div className="signin-state" role="status">
          <LottiePlayer name="setup" label="" size={132} fallback={<Footprints size={44} className="walk" />} />
          <p>Setting up your account and adding you to the signup list</p>
        </div>
      )}
    </div>
  );
}
