"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Ported from mtd's ConsentBanner (the fleet standard). Stores the choice in a
// first-party cookie and replays it to Google Consent Mode v2 on every load.
const COOKIE = "wsl-consent";
const OPEN_EVENT = "wsl-consent-open";
const CHANGE_EVENT = "wsl-consent-change";
const ACCENT = "#6366f1";
const MAX_AGE = 60 * 60 * 24 * 365;

type Choice = "accepted" | "declined";
type Gtag = (...args: unknown[]) => void;

function readConsent(): Choice | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE}=`));
  if (!match) return null;
  const value = match.split("=")[1];
  return value === "accepted" || value === "declined" ? value : null;
}

function pushConsent(value: Choice) {
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== "function") return;
  const granted = value === "accepted" ? "granted" : "denied";
  gtag("consent", "update", {
    analytics_storage: granted,
    ad_storage: granted,
    ad_user_data: granted,
    ad_personalization: granted,
  });
}

function writeConsent(value: Choice) {
  document.cookie = `${COOKIE}=${value}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
  pushConsent(value);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Re-open the banner, e.g. from a "Cookie settings" link in the footer. */
export function openConsentBanner() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(OPEN_EVENT));
}

export function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const state = readConsent();
    if (state === null) setShow(true);
    else pushConsent(state);
    const open = () => setShow(true);
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      style={{
        position: "fixed",
        bottom: 72,
        left: 16,
        right: 16,
        zIndex: 60,
        maxWidth: 600,
        margin: "0 auto",
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(10,10,10,0.96)",
        padding: "12px 16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <p style={{ fontSize: 13, color: "#a1a1aa", margin: 0 }}>
          We use cookies for anonymous analytics and, if you accept, ads and affiliate tracking.{" "}
          <Link href="/legal/privacy" style={{ color: ACCENT, textDecoration: "underline" }}>
            Privacy policy
          </Link>
          .
        </p>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => { writeConsent("declined"); setShow(false); }}
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "transparent",
              color: "#a1a1aa",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => { writeConsent("accepted"); setShow(false); }}
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              border: "none",
              background: ACCENT,
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
