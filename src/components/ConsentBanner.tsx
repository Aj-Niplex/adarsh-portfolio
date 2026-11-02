"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { agree, useAgreed } from "@/lib/consentClient";

// Shown to a visitor who has not agreed yet. "I agree" remembers the choice; "No, thanks" leaves the site.
// It stays out of the way on the Privacy Policy page itself, so the page can be read first.
export function ConsentBanner() {
  const agreed = useAgreed();
  const path = usePathname();
  if (agreed !== false || path.startsWith("/privacy")) return null;

  const leave = () => {
    // A tab the visitor opened themselves cannot be closed by a page, so it is sent to a blank page instead.
    window.close();
    window.location.replace("about:blank");
  };

  return (
    <div className="consent" role="dialog" aria-labelledby="consent-text">
      <p id="consent-text">
        By continuing you agree to our <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <div className="consent-actions">
        <button type="button" className="btn btn-primary" onClick={agree} autoFocus>
          I agree &amp; continue
        </button>
        <button type="button" className="btn" onClick={leave}>
          No, thanks
        </button>
      </div>
    </div>
  );
}
