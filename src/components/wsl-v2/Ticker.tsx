"use client";

import { useMemo } from "react";
import { Activity, TrendingDown, TrendingUp } from "lucide-react";
import { I } from "./icons";
import { useNow } from "./useNow";
import { computeTicker } from "@/lib/wsl-v2/computeTicker";
import { FMT } from "@/lib/wsl-v2/fmt";
import type { Ticker as TickerType } from "@/lib/wsl-v2/types";

function Sparkline({ values, color, w = 100, h = 32 }: { values: number[]; color: string; w?: number; h?: number }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  const pts = values
    .map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / range) * (h - 2) - 1).toFixed(1)}`)
    .join(" ");
  return (
    <svg className="spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

export function Ticker({ ticker, epoch }: { ticker: TickerType; epoch: number }) {
  const now = useNow();
  const v = computeTicker(ticker, now, epoch);
  const IconCmp = I[ticker.icon] ?? Activity;
  const sparkData = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 24; i++) arr.push(70 + Math.sin(i * 0.7 + ticker.id.length) * 14 + (i / 24) * 18);
    return arr;
  }, [ticker.id]);
  return (
    <div className="ticker" data-accent={ticker.accent}>
      <div className="ticker-accent" />
      <div className="ticker-head">
        <div className="ticker-label">
          <IconCmp size={13} /> {ticker.label}
        </div>
      </div>
      <div className="ticker-value">{FMT[ticker.fmt](v)}</div>
      <div className={"ticker-delta" + (ticker.deltaDown ? " down" : " up")}>
        {ticker.deltaDown ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
        {ticker.delta}
      </div>
      <div className="ticker-spark">
        <Sparkline values={sparkData} color="var(--accent, var(--ws-bo))" />
      </div>
    </div>
  );
}
