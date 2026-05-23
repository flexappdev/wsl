"use client";

import { Ticker } from "@/components/wsl-v2/Ticker";
import { CurrencyStrip } from "@/components/wsl-v2/CurrencyStrip";
import { TopList } from "@/components/wsl-v2/TopList";
import { RandomFact } from "@/components/wsl-v2/RandomFact";
import { useNow } from "@/components/wsl-v2/useNow";
import { SEED } from "@/lib/wsl-v2/seed";
import { FMT } from "@/lib/wsl-v2/fmt";

const TICKER_IDS = ["tourism", "data", "hotels", "flights"];

const LARGEST_GDP = [
  { rank: 1, name: "United States",  flag: "🇺🇸", v: 100, raw: "$28.8T" },
  { rank: 2, name: "China",          flag: "🇨🇳", v: 64,  raw: "$18.5T" },
  { rank: 3, name: "Germany",        flag: "🇩🇪", v: 17,  raw: "$4.6T" },
  { rank: 4, name: "Japan",          flag: "🇯🇵", v: 15,  raw: "$4.4T" },
  { rank: 5, name: "India",          flag: "🇮🇳", v: 14,  raw: "$4.1T" },
  { rank: 6, name: "United Kingdom", flag: "🇬🇧", v: 12,  raw: "$3.6T" },
  { rank: 7, name: "France",         flag: "🇫🇷", v: 11,  raw: "$3.1T" },
  { rank: 8, name: "Italy",          flag: "🇮🇹", v: 9,   raw: "$2.3T" },
];

const GDP_REGIONS = [
  { name: "Asia-Pacific",  pct: 36.4, color: "var(--ws-core)" },
  { name: "North America", pct: 27.1, color: "var(--ws-bo)" },
  { name: "Europe",        pct: 22.0, color: "var(--ws-context)" },
  { name: "Latin America", pct: 6.2,  color: "var(--ws-lists)" },
  { name: "Middle East",   pct: 4.5,  color: "var(--warning, oklch(0.75 0.18 75))" },
  { name: "Africa",        pct: 3.0,  color: "var(--ws-travel)" },
];

export default function GdpPage() {
  const now = useNow();
  const epoch = SEED.epoch;
  const tickers = TICKER_IDS
    .map((id) => SEED.tickers.find((t) => t.id === id))
    .filter(Boolean);

  // Day-start: today at 00:00 UTC
  const todayMs = new Date();
  todayMs.setUTCHours(0, 0, 0, 0);
  const secsToday = (now - todayMs.getTime()) / 1000;
  const gdpToday = Math.floor(secsToday * 3_000_000);
  const tradeToday = Math.floor(secsToday * 75_000);
  const stockToday = Math.floor(secsToday * 12_000_000);

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumb">DATA · GDP & ECONOMY</div>
          <h1>What the world is worth.</h1>
          <div className="sub">
            Global GDP grew past $110 trillion in 2024. Every second, the world economy adds roughly
            $3 million in value — and turns over orders of magnitude more.
          </div>
        </div>
      </div>

      {/* GDP Pulse */}
      <div className="section">
        <div className="section-head"><div><h2>GDP pulse · today</h2><div className="sub">Live — resets at 00:00 UTC</div></div></div>
        <div className="gdp-pulse">
          <div className="gdp-pulse-card">
            <div className="type-eyebrow" style={{ display: "block", marginBottom: 8 }}>GDP ADDED TODAY</div>
            <div style={{ fontSize: 36, fontFamily: "var(--font-mono)", letterSpacing: "-0.03em", fontWeight: 700, color: "var(--ws-core)" }}>
              {FMT.usd(gdpToday)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
              <div className="proj-row">
                <span className="y">Trade flow today</span>
                <span className="mono">{FMT.usd(tradeToday)}</span>
              </div>
              <div className="proj-row">
                <span className="y">Stock turnover</span>
                <span className="mono">{FMT.usd(stockToday)}</span>
              </div>
              <div className="proj-row" style={{ borderTop: "1px solid var(--border)", paddingTop: 8, marginTop: 4 }}>
                <span className="y">Nominal world GDP</span>
                <span className="mono">$110.5T</span>
              </div>
            </div>
          </div>
          <div className="gdp-tickers">
            {tickers.map((t) => t && <Ticker key={t.id} ticker={t} epoch={epoch} />)}
          </div>
        </div>
      </div>

      {/* Currency strip */}
      <div className="section">
        <div className="section-head"><div><h2>Currencies & commodities</h2></div></div>
        <CurrencyStrip currencies={SEED.currencies} />
      </div>

      {/* Largest economies */}
      <div className="section">
        <div className="section-head"><div><h2>Largest economies</h2><div className="sub">Nominal GDP, 2024 estimates · IMF WEO</div></div></div>
        <div className="row-2">
          <TopList title="Top 8 by nominal GDP" sub="2024 · USD" data={LARGEST_GDP} barColor="var(--ws-core)" />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>GDP share by region</div>
            {GDP_REGIONS.map((r) => (
              <div key={r.name} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "var(--foreground-subtle)" }}>{r.name}</span>
                  <span className="mono" style={{ color: "var(--foreground-muted)", fontSize: 11 }}>{r.pct}%</span>
                </div>
                <div style={{ background: "var(--muted)", borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div style={{ width: `${r.pct}%`, height: "100%", background: r.color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Currency table + fact */}
      <div className="section">
        <div className="section-head"><div><h2>Currency pairs</h2></div></div>
        <div className="row-2">
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "8px 14px", textAlign: "left", color: "var(--foreground-muted)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.05em" }}>PAIR</th>
                  <th style={{ padding: "8px 14px", textAlign: "right", color: "var(--foreground-muted)", fontFamily: "var(--font-mono)", fontSize: 10 }}>VALUE</th>
                  <th style={{ padding: "8px 14px", textAlign: "right", color: "var(--foreground-muted)", fontFamily: "var(--font-mono)", fontSize: 10 }}>CHANGE</th>
                  <th style={{ padding: "8px 14px", textAlign: "right", color: "var(--foreground-muted)", fontFamily: "var(--font-mono)", fontSize: 10 }}>%</th>
                </tr>
              </thead>
              <tbody>
                {SEED.currencies.map((c) => (
                  <tr key={c.code} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "8px 14px", color: "var(--foreground)", fontFamily: "var(--font-mono)" }}>{c.code}</td>
                    <td style={{ padding: "8px 14px", textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--foreground-subtle)" }}>
                      {c.val.toLocaleString("en-US", { maximumFractionDigits: 4 })}
                    </td>
                    <td style={{ padding: "8px 14px", textAlign: "right", fontFamily: "var(--font-mono)", color: c.ch >= 0 ? "var(--success)" : "var(--destructive)" }}>
                      {c.ch >= 0 ? "+" : ""}{c.ch.toLocaleString("en-US", { maximumFractionDigits: 4 })}
                    </td>
                    <td style={{ padding: "8px 14px", textAlign: "right", fontFamily: "var(--font-mono)", color: c.pct >= 0 ? "var(--success)" : "var(--destructive)" }}>
                      {c.pct >= 0 ? "+" : ""}{c.pct.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <RandomFact facts={SEED.facts} />
        </div>
      </div>

      {/* Latest news */}
      <div className="section">
        <div className="section-head"><div><h2>Latest</h2></div></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
          {SEED.news.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
              <span className="feed-tag" style={{ fontSize: 10, fontFamily: "var(--font-mono)", padding: "2px 6px", borderRadius: 4, background: "var(--muted)", color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 }}>{item.tag}</span>
              <span style={{ flex: 1, color: "var(--foreground-subtle)" }}>{item.title}</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--foreground-muted)", flexShrink: 0 }}>{item.src} · {item.when}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
