"use client";

import { useEffect, useState } from "react";
import { makeFeedItem, makeInitialFeed, type FeedItem } from "@/lib/feedEngine";
import type { FeedTemplate, Ticker } from "@/lib/wsl-v2/types";

type Props = {
  templates: FeedTemplate[];
  cities: string[];
  popTicker?: Ticker;
  epoch: number;
};

export function RightNowFeed({ templates, cities, popTicker, epoch }: Props) {
  const [items, setItems] = useState<FeedItem[]>(() => {
    // Deterministic 6-item batch derived from the current minute — same on
    // server render + first client render so there's no flash of empty state.
    return makeInitialFeed(templates, cities, popTicker, epoch, Date.now(), 6);
  });

  useEffect(() => {
    const id = window.setInterval(() => {
      setItems((cur) => [makeFeedItem(Date.now(), templates, cities, popTicker, epoch), ...cur].slice(0, 30));
    }, 4000 + Math.random() * 4000);
    return () => window.clearInterval(id);
  }, [templates, cities, popTicker, epoch]);

  return (
    <div className="feed">
      {items.map((it) => (
        <div key={it.k} className="feed-row">
          <div className="feed-time">{it.time}</div>
          <div className="feed-text" dangerouslySetInnerHTML={{ __html: it.html }} />
          <span
            className={"feed-tag " + it.tag}
            title="Projected from live rates — not a real-time event"
          >
            {it.tag}
          </span>
        </div>
      ))}
      <div
        className="feed-row"
        style={{ padding: "6px 12px", opacity: 0.55, fontSize: 11, gridTemplateColumns: "1fr" }}
      >
        <div className="feed-text">Projected from live rates — not real-time events.</div>
      </div>
    </div>
  );
}
