import { RandomFact } from "@/components/wsl-v2/RandomFact";
import { getWslPayload } from "@/lib/wsl-v2/dataSource";

export const revalidate = 300;

export default async function DestinationsPage() {
  const payload = await getWslPayload();
  const featured = payload.countries.find((c) => c.featured) ?? payload.countries[0];
  const others = payload.countries.filter((c) => c.id !== featured.id);
  const featuredHotels = payload.hotels[featured.id] ?? payload.hotels.default ?? [];

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumb">DESTINATIONS</div>
          <h1>195 countries. One console.</h1>
          <div className="sub">
            Drill into any country to see population, GDP, visitors, top stays and curated gear.
            Booking, Agoda and Expedia inventory is aggregated below each hotel.
          </div>
        </div>
      </div>

      {/* Featured country */}
      <div className="section">
        <div className="section-head">
          <div>
            <h2>Featured · {featured.name}</h2>
            <div className="sub">{featured.region} · {featured.capital}</div>
          </div>
          <div className="right">
            <span className="source-pill">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ws-lists)" }} />
              tourism {featured.growth} YoY
            </span>
          </div>
        </div>
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: 24,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)",
            gap: 24,
          }}
        >
          <div>
            <div style={{ fontSize: 56, lineHeight: 1 }}>{featured.flag}</div>
            <div style={{ marginTop: 16, fontSize: 22, fontWeight: 600 }}>{featured.name}</div>
            <div className="sub" style={{ marginTop: 6 }}>{featured.blurb}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
              <Stat label="POPULATION" value={(featured.pop / 1_000_000).toFixed(1) + "M"} />
              <Stat label="GDP" value={featured.gdp} />
              <Stat label="VISITORS / YR" value={featured.visitors} />
              <Stat label="GROWTH" value={featured.growth} positive={featured.up} />
              <Stat label="CURRENCY" value={featured.currency} />
              <Stat label="LANGUAGES" value={featured.langs} />
            </div>
            {featured.cities && featured.cities.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="type-eyebrow" style={{ marginBottom: 6 }}>KEY CITIES</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {featured.cities.map((c) => (
                    <span
                      key={c}
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 999,
                        background: "var(--muted)",
                        color: "var(--foreground-subtle)",
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div>
            <div className="type-eyebrow" style={{ marginBottom: 10 }}>TOP STAYS · {featured.name.toUpperCase()}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {featuredHotels.slice(0, 6).map((h, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "44px 1fr auto",
                    gap: 12,
                    alignItems: "center",
                    padding: "10px 12px",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    background: "var(--background)",
                  }}
                >
                  <div style={{ fontSize: 28 }}>{h.art}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{h.name}</div>
                    <div style={{ fontSize: 11, color: "var(--foreground-muted)" }}>
                      {h.city} · {"★".repeat(h.stars)} · {h.score.toFixed(1)} · {h.reviews.toLocaleString()} reviews
                    </div>
                  </div>
                  <div
                    className="mono"
                    style={{ fontSize: 13, fontWeight: 600, color: "var(--ws-core)" }}
                  >
                    ${h.price}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* All countries grid */}
      <div className="section">
        <div className="section-head">
          <div>
            <h2>All destinations</h2>
            <div className="sub">{payload.countries.length} country profiles · expanding</div>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 12,
          }}
        >
          {others.map((c) => (
            <div
              key={c.id}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 28, lineHeight: 1 }}>{c.flag}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "var(--foreground-muted)" }}>{c.region}</div>
                </div>
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: "var(--foreground-subtle)",
                  lineHeight: 1.4,
                  minHeight: 36,
                }}
              >
                {c.blurb}
              </div>
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: "var(--foreground-muted)",
                }}
              >
                <span>{c.visitors} visitors</span>
                <span style={{ color: c.up ? "var(--success)" : "var(--destructive)" }}>
                  {c.growth}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Trending searches</h2>
            <div className="sub">Across booking, search and aggregator partners</div>
          </div>
        </div>
        <div className="row-2">
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              overflow: "hidden",
            }}
          >
            {payload.trending.map((t, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 16px",
                  borderBottom: i < payload.trending.length - 1 ? "1px solid var(--border)" : "none",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "var(--foreground-subtle)" }}>{t.q}</span>
                <span className="mono" style={{ color: "var(--success)", fontSize: 12 }}>{t.v}</span>
              </div>
            ))}
          </div>
          <RandomFact facts={payload.facts} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div
      style={{
        background: "var(--background)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "8px 12px",
      }}
    >
      <div className="type-eyebrow" style={{ fontSize: 9 }}>{label}</div>
      <div
        className="mono"
        style={{
          marginTop: 2,
          fontSize: 14,
          fontWeight: 600,
          color: positive === undefined
            ? "var(--foreground)"
            : positive
            ? "var(--success)"
            : "var(--destructive)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
