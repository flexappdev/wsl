import { Ticker } from "@/components/wsl-v2/Ticker";
import { TopList } from "@/components/wsl-v2/TopList";
import { RandomFact } from "@/components/wsl-v2/RandomFact";
import { getWslPayload } from "@/lib/wsl-v2/dataSource";

export const revalidate = 300;

const TICKER_IDS = ["co2", "energy", "forest", "species"];

const TOP_EMITTERS = [
  { rank: 1, name: "China",          flag: "🇨🇳", v: 100, raw: "11.4 Gt" },
  { rank: 2, name: "United States",  flag: "🇺🇸", v: 44,  raw: "5.0 Gt" },
  { rank: 3, name: "India",          flag: "🇮🇳", v: 26,  raw: "3.0 Gt" },
  { rank: 4, name: "Russia",         flag: "🇷🇺", v: 17,  raw: "1.9 Gt" },
  { rank: 5, name: "Japan",          flag: "🇯🇵", v: 10,  raw: "1.1 Gt" },
  { rank: 6, name: "Iran",           flag: "🇮🇷", v: 7,   raw: "0.8 Gt" },
  { rank: 7, name: "Germany",        flag: "🇩🇪", v: 6,   raw: "0.7 Gt" },
  { rank: 8, name: "Indonesia",      flag: "🇮🇩", v: 6,   raw: "0.7 Gt" },
];

const RENEWABLES_SHARE = [
  { rank: 1, name: "Iceland",        flag: "🇮🇸", v: 100, raw: "~100%" },
  { rank: 2, name: "Paraguay",       flag: "🇵🇾", v: 100, raw: "~100%" },
  { rank: 3, name: "Norway",         flag: "🇳🇴", v: 98,  raw: "98%" },
  { rank: 4, name: "Costa Rica",     flag: "🇨🇷", v: 95,  raw: "95%" },
  { rank: 5, name: "Brazil",         flag: "🇧🇷", v: 84,  raw: "84%" },
  { rank: 6, name: "Denmark",        flag: "🇩🇰", v: 81,  raw: "81%" },
  { rank: 7, name: "New Zealand",    flag: "🇳🇿", v: 81,  raw: "81%" },
  { rank: 8, name: "Portugal",       flag: "🇵🇹", v: 61,  raw: "61%" },
];

const MILESTONES = [
  { year: "1750",   value: "280 ppm", note: "Pre-industrial baseline CO₂" },
  { year: "1958",   value: "315 ppm", note: "Mauna Loa observatory begins continuous measurement" },
  { year: "1988",   value: "351 ppm", note: "James Hansen testifies to U.S. Senate on warming" },
  { year: "2013",   value: "400 ppm", note: "First time crossed at Mauna Loa in modern record" },
  { year: "2024",   value: "424 ppm", note: "Hottest year on record · +1.55°C above pre-industrial" },
  { year: "2026",   value: "425 ppm", note: "Current · highest in 800,000 years" },
];

export default async function ClimatePage() {
  const payload = await getWslPayload();
  const tickers = TICKER_IDS
    .map((id) => payload.tickers.find((t) => t.id === id))
    .filter(Boolean);
  const climateNews = payload.news.filter((n) => n.tag === "climate");

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumb">DATA · CLIMATE & ENERGY</div>
          <h1>The planet&apos;s vital signs.</h1>
          <div className="sub">
            Emissions, energy, forest cover and biodiversity — the slow indicators that shape every other
            system. Every second, the atmosphere absorbs another 1,150 tonnes of CO₂.
          </div>
        </div>
      </div>

      <div className="ticker-grid">
        {tickers.map((t) => t && <Ticker key={t.id} ticker={t} epoch={payload.epoch} />)}
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Top CO₂ emitters</h2>
            <div className="sub">2024 · annual fossil CO₂ · Global Carbon Project</div>
          </div>
        </div>
        <div className="row-2">
          <TopList
            title="Top 8 emitters"
            sub="gigatonnes / year"
            data={TOP_EMITTERS}
            barColor="var(--ws-context)"
          />
          <TopList
            title="Renewables share"
            sub="electricity from renewables, 2024"
            data={RENEWABLES_SHARE}
            barColor="var(--ws-core)"
          />
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Atmospheric CO₂ · key milestones</h2>
            <div className="sub">Mauna Loa observatory · NOAA</div>
          </div>
        </div>
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
        >
          {MILESTONES.map((m, i) => (
            <div
              key={m.year}
              style={{
                display: "grid",
                gridTemplateColumns: "80px 110px 1fr",
                gap: 16,
                padding: "12px 18px",
                borderBottom: i < MILESTONES.length - 1 ? "1px solid var(--border)" : "none",
                alignItems: "center",
                fontSize: 13,
              }}
            >
              <span className="mono" style={{ color: "var(--foreground-muted)" }}>{m.year}</span>
              <span
                className="mono"
                style={{
                  color: "var(--ws-context)",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                }}
              >
                {m.value}
              </span>
              <span style={{ color: "var(--foreground-subtle)" }}>{m.note}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Random fact &amp; latest</h2>
            <div className="sub">From the climate desk</div>
          </div>
        </div>
        <div className="row-2">
          <RandomFact facts={payload.facts} />
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              overflow: "hidden",
            }}
          >
            {climateNews.length === 0 ? (
              <div style={{ padding: 20, fontSize: 12.5, color: "var(--foreground-muted)" }}>
                No climate stories in the feed right now.
              </div>
            ) : (
              climateNews.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 16px",
                    borderBottom: i < climateNews.length - 1 ? "1px solid var(--border)" : "none",
                    fontSize: 13,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: "var(--font-mono)",
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: "var(--muted)",
                      color: "var(--foreground-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      flexShrink: 0,
                    }}
                  >
                    {item.tag}
                  </span>
                  <span style={{ flex: 1, color: "var(--foreground-subtle)" }}>{item.title}</span>
                  <span
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: "var(--foreground-muted)",
                      flexShrink: 0,
                    }}
                  >
                    {item.src} · {item.when}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
