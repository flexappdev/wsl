"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Cloud, DollarSign, FileText, Globe, MapPin, Plane, Settings, Shuffle, Users, type LucideIcon } from "lucide-react";
import { useNow } from "./useNow";
import { computeTicker } from "@/lib/wsl-v2/computeTicker";
import { FMT } from "@/lib/wsl-v2/fmt";
import type { Country, Ticker } from "@/lib/wsl-v2/types";

type Item = { href: string; label: string; Icon: LucideIcon };

const ITEMS: Item[] = [
  { href: "/", label: "Dashboard", Icon: Activity },
  { href: "/population", label: "Population", Icon: Users },
  { href: "/gdp", label: "GDP & economy", Icon: DollarSign },
  { href: "/climate", label: "Climate & energy", Icon: Cloud },
  { href: "/tourism", label: "Tourism", Icon: Plane },
  { href: "/destinations", label: "Destinations", Icon: MapPin },
  { href: "/story", label: "The big story", Icon: FileText },
  { href: "/random", label: "Random", Icon: Shuffle },
  { href: "/about", label: "About & sources", Icon: Settings },
];

type Props = {
  tickers: Ticker[];
  countries: Country[];
  epoch: number;
};

export function Sidebar({ tickers, countries, epoch }: Props) {
  const path = usePathname();
  const now = useNow();
  const pop = tickers.find((t) => t.id === "population");
  const co2 = tickers.find((t) => t.id === "co2");
  const tour = tickers.find((t) => t.id === "tourism");

  return (
    <aside className="sb">
      <div className="sb-brand">
        <div className="sb-mark"><Globe size={18} /></div>
        <div className="sb-name">World Stats <span>Live · v2.0</span></div>
      </div>

      <div className="sb-group">
        <div className="type-eyebrow" style={{ padding: "0 10px 6px" }}>MAIN</div>
        {ITEMS.map(({ href, label, Icon }) => {
          const active = href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
          return (
            <Link key={href} href={href} className={"nav-item" + (active ? " active" : "")}>
              <Icon size={16} /> {label}
            </Link>
          );
        })}
      </div>

      <div className="sb-group">
        <div className="type-eyebrow" style={{ padding: "0 10px 6px" }}>LIVE</div>
        <div className="sb-mini">
          {pop && <div className="sb-mini-row"><span>POP</span><span className="v">{FMT.short(computeTicker(pop, now, epoch))}</span></div>}
          {co2 && <div className="sb-mini-row"><span>CO₂ today</span><span className="v down">{(computeTicker(co2, now, epoch) / 1e6).toFixed(2)} Mt</span></div>}
          {tour && <div className="sb-mini-row"><span>$ tourism</span><span className="v up">${FMT.short(computeTicker(tour, now, epoch))}</span></div>}
        </div>
      </div>

      <div className="sb-group">
        <div className="type-eyebrow" style={{ padding: "0 10px 6px" }}>FEATURED</div>
        {countries.slice(0, 5).map((c) => (
          <span key={c.id} className="nav-item" style={{ fontSize: 12.5 }}>
            <span style={{ fontSize: 14 }}>{c.flag}</span>{c.name}
          </span>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <div className="sb-group">
        <Link href="/about" className="nav-item">
          <Settings size={16} /> Sources & method
        </Link>
      </div>
    </aside>
  );
}
