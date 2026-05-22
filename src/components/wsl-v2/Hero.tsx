"use client";

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

export function Hero({ tickers, cities, epoch }: Props) {
  const now = useNow();
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
      <div className="hero-feature">
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
