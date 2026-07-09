"use client";

import { useState } from "react";
import { Share2, Check, Code2 } from "lucide-react";

type Props = {
  title?: string;
  url?: string;
  embedSrc?: string;
};

export function ShareButton({ title, url, embedSrc }: Props) {
  const [state, setState] = useState<"idle" | "copied" | "embed-copied">("idle");

  async function onShare() {
    const finalUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");
    const finalTitle = title ?? (typeof document !== "undefined" ? document.title : "World Stats Live");
    // Web Share API where available (mobile mostly)
    const nav = typeof navigator !== "undefined" ? (navigator as Navigator & { share?: (d: ShareData) => Promise<void> }) : undefined;
    if (nav?.share) {
      try {
        await nav.share({ title: finalTitle, url: finalUrl });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(finalUrl);
      setState("copied");
      setTimeout(() => setState("idle"), 1500);
    } catch {
      // no-op
    }
  }

  async function onEmbed() {
    if (!embedSrc) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://worldstatslive.org";
    const snippet = `<iframe src="${origin}${embedSrc}" width="360" height="220" frameborder="0" style="border:0;background:#0b1220;border-radius:8px"></iframe>`;
    try {
      await navigator.clipboard.writeText(snippet);
      setState("embed-copied");
      setTimeout(() => setState("idle"), 1500);
    } catch {
      // no-op
    }
  }

  return (
    <div style={{ display: "inline-flex", gap: 6 }}>
      <button
        onClick={onShare}
        className="btn btn-secondary btn-sm"
        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        aria-label="Share this page"
      >
        {state === "copied" ? <Check size={13} /> : <Share2 size={13} />}
        {state === "copied" ? "Link copied" : "Share"}
      </button>
      {embedSrc && (
        <button
          onClick={onEmbed}
          className="btn btn-ghost btn-sm"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          aria-label="Copy embed code"
        >
          {state === "embed-copied" ? <Check size={13} /> : <Code2 size={13} />}
          {state === "embed-copied" ? "Embed copied" : "Embed"}
        </button>
      )}
    </div>
  );
}
