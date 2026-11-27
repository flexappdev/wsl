"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { VideoCard } from "./VideoCard";
import type { TravelCard } from "@/lib/travel-videos-shared";

type Kind = "all" | "short" | "long";
type Props = { cards: TravelCard[]; countries: { name: string; flag: string; count: number }[] };

const PAGE = 48;

export function VideosBrowser({ cards, countries }: Props) {
  const [kind, setKind] = useState<Kind>("all");
  const [country, setCountry] = useState("");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(PAGE);

  // Deep links: /videos?country=Japan&kind=long&q=temples
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const k = sp.get("kind");
    if (k === "short" || k === "long") setKind(k);
    else if (k === "film" || k === "films") setKind("long");
    const c = sp.get("country");
    if (c) setCountry(c);
    const query = sp.get("q");
    if (query) setQ(query);
  }, []);

  // Keep URL in sync (shareable filters) without navigation.
  useEffect(() => {
    const sp = new URLSearchParams();
    if (kind !== "all") sp.set("kind", kind);
    if (country) sp.set("country", country);
    if (q) sp.set("q", q);
    const s = sp.toString();
    window.history.replaceState(null, "", s ? `?${s}` : window.location.pathname);
    setLimit(PAGE);
  }, [kind, country, q]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return cards.filter(
      (c) =>
        (kind === "all" || c.kind === kind) &&
        (!country || c.country === country) &&
        (!needle || `${c.title} ${c.place} ${c.country}`.toLowerCase().includes(needle)),
    );
  }, [cards, kind, country, q]);

  const films = filtered.filter((c) => c.kind === "long");
  const shorts = filtered.filter((c) => c.kind === "short");
  const shownShorts = shorts.slice(0, Math.max(0, limit - films.length));

  return (
    <div>
      <div className="tv-filters">
        <div className="tv-seg" role="tablist" aria-label="Video type">
          {(
            [
              ["all", `All ${cards.length}`],
              ["short", "Shorts"],
              ["long", "Films"],
            ] as [Kind, string][]
          ).map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={kind === k} className={kind === k ? "on" : ""} onClick={() => setKind(k)}>
              {label}
            </button>
          ))}
        </div>
        <select className="input tv-select" value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Country">
          <option value="">All countries ({countries.length})</option>
          {countries.map((c) => (
            <option key={c.name} value={c.name}>
              {c.flag} {c.name} ({c.count})
            </option>
          ))}
        </select>
        <div className="tv-search">
          <Search size={14} className="ico" />
          <input className="input" type="search" placeholder="Search places…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search videos" />
          {q && (
            <button type="button" className="clr" onClick={() => setQ("")} aria-label="Clear search">
              <X size={13} />
            </button>
          )}
        </div>
        <div className="tv-count">
          {filtered.length} video{filtered.length === 1 ? "" : "s"}
        </div>
      </div>

      {filtered.length === 0 && <div className="tv-empty">No videos match. Try another country or search.</div>}

      {films.length > 0 && (
        <>
          <h2 className="tv-h">Films</h2>
          <div className="tv-grid films">
            {films.map((c) => (
              <VideoCard key={c.id} card={c} />
            ))}
          </div>
        </>
      )}
      {shownShorts.length > 0 && (
        <>
          <h2 className="tv-h">Shorts</h2>
          <div className="tv-grid shorts">
            {shownShorts.map((c) => (
              <VideoCard key={c.id} card={c} />
            ))}
          </div>
        </>
      )}
      {shownShorts.length < shorts.length && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
          <button type="button" className="btn btn-secondary" onClick={() => setLimit((l) => l + PAGE * 2)}>
            Show more ({shorts.length - shownShorts.length} left)
          </button>
        </div>
      )}
    </div>
  );
}
