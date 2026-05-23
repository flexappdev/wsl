"use client";

import { useState } from "react";
import { WorldMap } from "./WorldMap";
import { useNow } from "./useNow";
import { computeTicker } from "@/lib/wsl-v2/computeTicker";
import { FMT } from "@/lib/wsl-v2/fmt";
import type { City, Ticker } from "@/lib/wsl-v2/types";

type Props = {
  tickers: Ticker[];
  cities: City[];
  epoch: number;
};

const POP_PROJECTIONS = [
  { y: 2026, v: 8.15 },
  { y: 2030, v: 8.3 },
  { y: 2040, v: 9.0 },
  { y: 2050, v: 9.6 },
];

const GDP_PROJECTIONS = [
  { y: 2026, v: 110.5 },
  { y: 2030, v: 125 },
  { y: 2040, v: 155 },
  { y: 2050, v: 190 },
];

function MiniLineChart({ data, label }: { data: { y: number; v: number }[]; label: string }) {
  const W = 150, H = 60;
  const minV = Math.min(...data.map((d) => d.v)) * 0.9;
  const maxV = Math.max(...data.map((d) => d.v)) * 1.05;
  const minY = data[0].y;
  const maxY = data[data.length - 1].y;
  const xScale = (y: number) => ((y - minY) / (maxY - minY)) * W;
  const yScale = (v: number) => H - ((v - minV) / (maxV - minV)) * H;
  const pts = data.map((d) => `${xScale(d.y).toFixed(1)},${yScale(d.v).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 -4 ${W} ${H + 8}`} width={W} height={H} style={{ display: "block", marginBottom: 8 }}>
      <polyline
        points={pts}
        fill="none"
        stroke="var(--accent, var(--ws-bo))"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {data.map((d) => (
        <circle
          key={d.y}
          cx={xScale(d.y)}
          cy={yScale(d.v)}
          r="2.5"
          fill="var(--background)"
          stroke="var(--accent, var(--ws-bo))"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

export function Hero({ tickers, cities, epoch }: Props) {
  const now = useNow();
  const [popHover, setPopHover] = useState(false);
  const [gdpHover, setGdpHover] = useState(false);

  const pop = tickers.find((t) => t.id === "population");
  const births = tickers.find((t) => t.id === "births");
  const deaths = tickers.find((t) => t.id === "deaths");
  const internet = tickers.find((t) => t.id === "internet");
  const v = pop ? computeTicker(pop, now, epoch) : 0;
  const b = births ? computeTicker(births, now, epoch) : 0;
  const d = deaths ? computeTicker(deaths, now, epoch) : 0;
  const i = internet ? computeTicker(internet, now, epoch) : 0;
  const net = b - d;
  const utc = new Date(now).toUTCString().slice(17, 25);

  return (
    <div className="hero">
      <div
        className="hero-feature"
        style={{ position: "relative" }}
        onMouseEnter={() => setPopHover(true)}
        onMouseLeave={() => setPopHover(false)}
      >
        <div className="eye">
          <span className="live-pip" />WORLD POPULATION · LIVE
        </div>
        <div>
          <div className="big-counter">{FMT.int(v)}</div>
          <div className="sub-counter" style={{ marginTop: 8 }}>
            Net change today: <span style={{ color: "var(--success)" }}>+{FMT.int(net)}</span>
          </div>
        </div>
        <div className="splits">
          <div>
            <div className="s-label">Births today</div>
            <div className="s-val">+{FMT.int(b)}</div>
            <div className="s-delta">↑ 4.3 / sec</div>
          </div>
          <div>
            <div className="s-label">Deaths today</div>
            <div className="s-val">−{FMT.int(d)}</div>
            <div className="s-delta down">↓ 1.86 / sec</div>
          </div>
          <div>
            <div className="s-label">Online now</div>
            <div className="s-val">{FMT.short(i)}</div>
            <div className="s-delta">↑ 5.2k / sec</div>
          </div>
        </div>
        {popHover && (
          <div className="projection-tooltip">
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--foreground-muted)", marginBottom: 6, letterSpacing: "0.05em" }}>
              UN MEDIUM PROJECTION
            </div>
            <MiniLineChart data={POP_PROJECTIONS} label="population" />
            {POP_PROJECTIONS.map((p) => (
              <div key={p.y} className="proj-row">
                <span className="y">{p.y}</span>
                <span>{p.v.toFixed(2)}B</span>
              </div>
            ))}
            <div className="proj-caption">Source: UN DESA WUPP 2024</div>
          </div>
        )}
      </div>

      <div className="hero-map">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div>
            <div
              className="eye"
              style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--foreground-muted)" }}
            >
              <span className="live-pip" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", display: "inline-block" }} />
              GLOBAL ACTIVITY · NOW
            </div>
            <div style={{ fontSize: 12, color: "var(--foreground-muted)", marginTop: 4 }}>Hover any city for live metrics</div>
          </div>
          <div className="mono" style={{ fontSize: 11, color: "var(--foreground-muted)" }}>
            {cities.length} cities · refreshing
          </div>
        </div>
        <WorldMap cities={cities} accent="lists" />
        <div className="map-legend">
          <span><span className="lg-dot" style={{ background: "var(--ws-lists)" }} />major metro</span>
          <span><span className="lg-dot" style={{ background: "oklch(0.42 0 0)" }} />landmass</span>
          <span style={{ marginLeft: "auto", textTransform: "none", letterSpacing: 0 }} className="mono">
            {utc} UTC
          </span>
        </div>
      </div>
    </div>
  );
}
