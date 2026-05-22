"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { Fact } from "@/lib/wsl-v2/types";

export function RandomFact({ facts }: { facts: Fact[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!facts.length) return;
    const id = window.setInterval(() => setIdx((i) => (i + 1) % facts.length), 9000);
    return () => window.clearInterval(id);
  }, [facts.length]);
  const f = facts[idx] ?? { text: "—", src: "—" };
  return (
    <div className="fact-card" data-accent="lists">
      <div className="ticker-accent" style={{ background: "var(--ws-lists)" }} />
      <div className="eye">
        <span className="pip" />RIGHT NOW IN THE WORLD
      </div>
      <div className="fact-text" dangerouslySetInnerHTML={{ __html: f.text }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
        <div className="fact-meta">source · {f.src}</div>
        <button className="btn btn-secondary btn-sm roll" type="button" onClick={() => setIdx((i) => (i + 1) % Math.max(facts.length, 1))}>
          <RefreshCw size={12} /> Another
        </button>
      </div>
    </div>
  );
}
