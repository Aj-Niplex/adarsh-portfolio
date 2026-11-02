"use client";

// Whether this browser has agreed to the Privacy Policy. The answer is a first-party cookie, so it
// survives closing the tab. If cookies are blocked, the choice still holds until the page is closed.

import { useEffect, useState } from "react";

export const CONSENT_COOKIE = "pf_consent";
const EVENT = "pf-consent";
let agreedInMemory = false;

export function hasAgreed() {
  if (agreedInMemory) return true;
  try {
    return document.cookie.split(/;\s*/).includes(CONSENT_COOKIE + "=1");
  } catch {
    return false;
  }
}

export function agree() {
  agreedInMemory = true;
  try {
    document.cookie = CONSENT_COOKIE + "=1; Max-Age=31536000; Path=/; SameSite=Lax" + (window.location.protocol === "https:" ? "; Secure" : "");
  } catch {
    // Blocked cookies: the choice is kept in memory for this visit only.
  }
  window.dispatchEvent(new Event(EVENT));
}

/** null until the browser has been asked, then true or false. Updates when the visitor agrees. */
export function useAgreed(): boolean | null {
  const [agreed, setAgreed] = useState<boolean | null>(null);
  useEffect(() => {
    const read = () => setAgreed(hasAgreed());
    read();
    window.addEventListener(EVENT, read);
    return () => window.removeEventListener(EVENT, read);
  }, []);
  return agreed;
}
