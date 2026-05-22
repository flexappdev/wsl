"use client";

import { useEffect, useState } from "react";
import { computeTicker } from "@/lib/wsl-v2/computeTicker";
import { FMT } from "@/lib/wsl-v2/fmt";
import type { FeedTemplate, Ticker } from "@/lib/wsl-v2/types";

type Props = {
  templates: FeedTemplate[];
  cities: string[];
  popTicker?: Ticker;
  epoch: number;
};

type FeedItem = {
  k: string;
  html: string;
  tag: string;
  time: string;
};

function makeFeedItem(ts: number, templates: FeedTemplate[], cityPool: string[], popTicker: Ticker | undefined, epoch: number): FeedItem {
  const tpl = templates[Math.floor(Math.random() * templates.length)];
  const city = cityPool[Math.floor(Math.random() * cityPool.length)];
  const n = Math.floor(Math.random() * 9000 + 1000);
  const popVal = popTicker ? FMT.int(computeTicker(popTicker, ts, epoch)) : "—";
  const html = tpl.tpl
    .replace("{city}", city)
    .replace("{n}", n.toLocaleString())
    .replace("{pop}", popVal);
  const d = new Date(ts);
  const time = `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}:${String(d.getUTCSeconds()).padStart(2, "0")}`;
  return { k: `${ts}_${Math.random().toFixed(4)}`, html, tag: tpl.tag, time };
}

export function RightNowFeed({ templates, cities, popTicker, epoch }: Props) {
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    // Seed initial items client-side so SSR markup is identical for everyone.
    const start = Date.now();
    setItems(Array.from({ length: 6 }, (_, i) => makeFeedItem(start - i * 5000, templates, cities, popTicker, epoch)));
    const id = window.setInterval(() => {
      setItems((cur) => [makeFeedItem(Date.now(), templates, cities, popTicker, epoch), ...cur].slice(0, 8));
    }, 3200);
    return () => window.clearInterval(id);
  }, [templates, cities, popTicker, epoch]);

  if (!items.length) {
    return (
      <div className="feed">
        <div className="feed-row" style={{ gridTemplateColumns: "1fr", padding: "16px" }}>
          <div className="feed-text" style={{ color: "var(--foreground-muted)" }}>Loading live feed…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="feed">
      {items.map((it) => (
        <div key={it.k} className="feed-row">
          <div className="feed-time">{it.time}</div>
          <div className="feed-text" dangerouslySetInnerHTML={{ __html: it.html }} />
          <span className={"feed-tag " + it.tag}>{it.tag}</span>
        </div>
      ))}
    </div>
  );
}
