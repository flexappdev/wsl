"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";

type Tag = "tourism" | "climate" | "pop" | "energy" | "world";
type Item = { title: string; src: string; url?: string; pubDate: number; tag: Tag };

function relTime(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60_000) return "just now";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return `${Math.floor(diff / 86400_000)}d ago`;
}

export function LatestNews() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/news")
      .then((r) => r.json())
      .then((j: { items?: Item[] }) => {
        if (cancelled) return;
        setItems(Array.isArray(j?.items) ? j.items : []);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Never render fake headlines. Hide entirely when nothing real to show.
  if (failed || (items && items.length === 0)) return null;

  if (!items) {
    return (
      <div className="news-list" style={{ opacity: 0.5 }}>
        <div className="news-row"><div className="news-title">Loading real headlines…</div></div>
      </div>
    );
  }

  return (
    <div className="news-list">
      {items.slice(0, 6).map((n, i) => {
        const inner = (
          <>
            <div>
              <div className="news-title">{n.title}</div>
              <div className="news-meta">
                <span className="src">{n.src}</span>
                <span>·</span>
                <span>{relTime(n.pubDate)}</span>
                <span style={{ marginLeft: 4 }}>
                  <span className={"feed-tag " + n.tag}>{n.tag}</span>
                </span>
              </div>
            </div>
            <ArrowUpRight size={14} style={{ color: "var(--foreground-muted)" }} />
          </>
        );
        return n.url ? (
          <a key={i} href={n.url} target="_blank" rel="noreferrer noopener" className="news-row" style={{ textDecoration: "none", color: "inherit" }}>
            {inner}
          </a>
        ) : (
          <div key={i} className="news-row">{inner}</div>
        );
      })}
    </div>
  );
}
