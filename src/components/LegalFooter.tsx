"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { openConsentBanner } from "./ConsentBanner";

// Fleet-standard legal strip: affiliate disclosure (always on) plus links to the
// privacy notice, affiliate policy and cookie settings. Inline styles so it
// renders the same whatever the page's CSS system.
const DISCLOSURE = "Booking.com, Expedia, Agoda and Amazon links (tag fs08-21) may pay us a small commission on qualifying bookings or purchases, at no extra cost to you.";

const link: CSSProperties = { color: "inherit", textDecoration: "underline", textUnderlineOffset: 2 };

export function LegalFooter({ disclosure = DISCLOSURE }: { disclosure?: string }) {
  return (
    <div
      data-legal-footer
      style={{
        borderTop: "1px solid rgba(127,127,127,0.2)",
        padding: "16px 16px 24px",
        fontSize: 12,
        lineHeight: 1.6,
        opacity: 0.75,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "8px 24px", justifyContent: "space-between" }}>
        <p style={{ margin: 0, maxWidth: 640 }}>
          <strong>Affiliate disclosure.</strong> {disclosure}
        </p>
        <nav aria-label="Legal" style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <Link href="/legal/privacy" style={link}>Privacy</Link>
          <Link href="/legal/affiliates" style={link}>Affiliate policy</Link>
          <button
            type="button"
            onClick={openConsentBanner}
            style={{ ...link, background: "none", border: 0, padding: 0, font: "inherit", cursor: "pointer" }}
          >
            Cookie settings
          </button>
        </nav>
      </div>
    </div>
  );
}
