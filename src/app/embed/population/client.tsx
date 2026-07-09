"use client";

import { useEffect, useState } from "react";
import { computeTicker } from "@/lib/wsl-v2/computeTicker";
import { FMT } from "@/lib/wsl-v2/fmt";
import type { Ticker } from "@/lib/wsl-v2/types";

type Props = { ticker: Ticker; epoch: number };

export function EmbedPopulation({ ticker, epoch }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, []);

  const value = FMT.int(computeTicker(ticker, now, epoch));
  return (
    <div
      style={{
        margin: 0,
        padding: 20,
        color: "#fff",
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 200,
      }}
    >
      <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#9ca3af" }}>
        Population — live
      </div>
      <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-0.02em", color: "#10b981", marginTop: 6 }}>
        {value}
      </div>
      <a
        href="https://worldstatslive.org"
        target="_blank"
        rel="noreferrer noopener"
        style={{ fontSize: 11, color: "#6b7280", marginTop: 10, textDecoration: "none" }}
      >
        worldstatslive.org
      </a>
    </div>
  );
}
