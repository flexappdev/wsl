"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, MapPin, Search } from "lucide-react";
import type { City, Country, SimpleCountry } from "@/lib/wsl-v2/types";

type Props = {
  open: boolean;
  onClose: () => void;
  countries: Country[];
  allCountries: SimpleCountry[];
  cities: City[];
};

const PAGES = [
  { id: "home",        label: "Home",            hint: "/",            href: "/" },
  { id: "population",  label: "Population",      hint: "/population",  href: "/population" },
  { id: "gdp",         label: "GDP & economy",   hint: "/gdp",         href: "/gdp" },
  { id: "climate",     label: "Climate & energy",hint: "/climate",     href: "/climate" },
  { id: "tourism",     label: "Tourism",         hint: "/tourism",     href: "/tourism" },
  { id: "destinations",label: "Destinations",    hint: "/destinations",href: "/destinations" },
  { id: "story",       label: "The big story",   hint: "/story",       href: "/story" },
  { id: "random",      label: "Random",          hint: "/random",      href: "/random" },
  { id: "about",       label: "About & sources", hint: "/about",       href: "/about" },
];

export function SearchPalette({ open, onClose, countries, allCountries, cities }: Props) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
      setQ("");
      setIdx(0);
    }
  }, [open]);

  const lower = q.toLowerCase();
  const filterText = useCallback((s: string) => s.toLowerCase().includes(lower), [lower]);

  const pageHits = q ? PAGES.filter((p) => filterText(p.label)) : PAGES;
  const countryHits = q
    ? allCountries.filter((c) => filterText(c.name))
    : allCountries.slice(0, 6);
  const cityHits = q ? cities.filter((c) => filterText(c.name)) : [];

  type FlatItem =
    | { kind: "page"; it: (typeof PAGES)[number] }
    | { kind: "country"; it: SimpleCountry }
    | { kind: "city"; it: City };

  const flat: FlatItem[] = [
    ...pageHits.map((p) => ({ kind: "page" as const, it: p })),
    ...countryHits.map((c) => ({ kind: "country" as const, it: c })),
    ...cityHits.map((c) => ({ kind: "city" as const, it: c })),
  ];

  useEffect(() => {
    if (idx >= flat.length) setIdx(0);
  }, [flat.length, idx]);

  const selectItem = useCallback(
    (item: FlatItem) => {
      if (item.kind === "page") {
        router.push(item.it.href);
      } else if (item.kind === "country") {
        // Check if there's a detailed country page; fall back to destinations
        const detailed = countries.find(
          (c) => c.code.toLowerCase() === item.it.code.toLowerCase()
        );
        if (detailed) {
          router.push(`/destinations/${item.it.code.toLowerCase()}`);
        } else {
          router.push("/destinations");
        }
      }
      onClose();
    },
    [router, countries, onClose]
  );

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      const hit = flat[idx];
      if (hit) selectItem(hit);
    }
  };

  if (!open) return null;

  return (
    <div className="palette-overlay" onClick={onClose}>
      <div className="palette" onClick={(e) => e.stopPropagation()}>
        <div className="palette-input">
          <Search size={16} />
          <input
            ref={inputRef}
            value={q}
            placeholder="Search countries, cities, pages…"
            onChange={(e) => { setQ(e.target.value); setIdx(0); }}
            onKeyDown={onKey}
          />
          <span className="esc">esc</span>
        </div>
        <div className="palette-list">
          {pageHits.length > 0 && <div className="palette-group">PAGES</div>}
          {pageHits.map((p, i) => {
            const globalIdx = i;
            return (
              <div
                key={p.id}
                className={"palette-item" + (idx === globalIdx ? " active" : "")}
                onMouseEnter={() => setIdx(globalIdx)}
                onClick={() => { router.push(p.href); onClose(); }}
              >
                <FileText size={14} />
                {p.label}
                <span className="pi-meta">{p.hint}</span>
              </div>
            );
          })}
          {countryHits.length > 0 && <div className="palette-group">COUNTRIES</div>}
          {countryHits.map((c, i) => {
            const globalIdx = pageHits.length + i;
            return (
              <div
                key={c.code}
                className={"palette-item" + (idx === globalIdx ? " active" : "")}
                onMouseEnter={() => setIdx(globalIdx)}
                onClick={() => selectItem({ kind: "country", it: c })}
              >
                <span style={{ fontSize: 14 }}>{c.flag}</span>
                {c.name}
                <span className="pi-meta">{c.region}</span>
              </div>
            );
          })}
          {cityHits.length > 0 && <div className="palette-group">CITIES</div>}
          {cityHits.map((c, i) => {
            const globalIdx = pageHits.length + countryHits.length + i;
            return (
              <div
                key={c.id}
                className={"palette-item" + (idx === globalIdx ? " active" : "")}
                onMouseEnter={() => setIdx(globalIdx)}
                onClick={onClose}
              >
                <MapPin size={14} />
                {c.name}
                <span className="pi-meta">{c.country}</span>
              </div>
            );
          })}
          {flat.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", color: "var(--foreground-muted)", fontSize: 13 }}>
              No matches for &ldquo;{q}&rdquo;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
