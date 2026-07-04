import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Data downloads",
  description:
    "Machine-readable dumps of every WSL dataset — 250-country register, 198-country travel guide, plus 14 topical rankings. CSV or JSON, no auth required.",
  openGraph: {
    title: "Data downloads · World Stats Live",
    description: "CSV + JSON exports of every dataset. Free, no auth.",
  },
};

const TOPICS: { id: string; title: string; description: string; rows: number }[] = [
  { id: "countries",            title: "Countries register",         description: "250 countries × 10 columns (cca3, name, capital, region, population, area, languages, currencies)", rows: 250 },
  { id: "wikivoyage",           title: "Travel guides",              description: "198 wikivoyage/wikipedia country articles with hero image flag, coordinates, pageid, extract preview", rows: 198 },
  { id: "top-populous",         title: "Top populous countries",     description: "Top 50 by UN population estimate", rows: 50 },
  { id: "top-gdp",              title: "Top GDP",                    description: "Top 8 economies · IMF WEO 2024", rows: 8 },
  { id: "top-emitters",         title: "Top CO₂ emitters",           description: "Top 8 · Global Carbon Project 2024", rows: 8 },
  { id: "top-visited",          title: "Top-visited countries",      description: "Top 10 tourism arrivals · UNWTO 2024", rows: 10 },
  { id: "top-fastest-growing",  title: "Fastest-growing destinations", description: "Top 8 by year-over-year visitor growth", rows: 8 },
  { id: "top-life-expectancy",  title: "Life expectancy leaders",    description: "Top 8 · WHO 2024", rows: 8 },
  { id: "top-renewables",       title: "Renewables share leaders",   description: "Top 8 by % electricity from renewables · IRENA 2024", rows: 8 },
  { id: "top-military-spending", title: "Military spending",         description: "Top 8 · SIPRI 2024", rows: 8 },
  { id: "top-refugee-hosts",    title: "Refugee-hosting nations",    description: "Top 8 · UNHCR 2024", rows: 8 },
  { id: "top-remittances",      title: "Remittance receivers",       description: "Top 8 · World Bank 2024", rows: 8 },
  { id: "top-internet",         title: "Internet penetration",       description: "Top 8 · ITU 2024", rows: 8 },
  { id: "top-literacy",         title: "Literacy rate",              description: "Top 8 · UNESCO 2024", rows: 8 },
  { id: "top-species-richness", title: "Species richness",           description: "Top 8 · IUCN + WWF 2024", rows: 8 },
  { id: "top-airports",         title: "Busiest airports",           description: "Top 8 · ACI World 2024", rows: 8 },
];

export default function DataPage() {
  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumb">DATA · DOWNLOADS</div>
          <h1>Every dataset, machine-readable.</h1>
          <div className="sub">
            All the seed data that powers World Stats Live, exposed as CSV and JSON. Free,
            no auth, no rate limit. Attribution appreciated but not required.
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Endpoint</h2>
            <div className="sub">
              GET <code style={{ background: "var(--muted)", padding: "2px 8px", borderRadius: 4 }}>/api/export?topic=&lt;id&gt;&amp;format=json|csv</code>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Datasets ({TOPICS.length})</h2>
            <div className="sub">Click JSON or CSV to download</div>
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
          {TOPICS.map((t, i) => (
            <div
              key={t.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                gap: 12,
                alignItems: "center",
                padding: "14px 18px",
                borderBottom: i < TOPICS.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{t.title}</span>
                  <span
                    className="mono"
                    style={{
                      fontSize: 10,
                      color: "var(--foreground-muted)",
                      background: "var(--muted)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    {t.rows} rows
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--foreground-subtle)", marginTop: 3 }}>
                  {t.description}
                </div>
              </div>
              <Link
                href={`/api/export?topic=${t.id}&format=json`}
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  padding: "5px 10px",
                  borderRadius: 4,
                  border: "1px solid var(--border)",
                  color: "var(--foreground-subtle)",
                  textDecoration: "none",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                JSON
              </Link>
              <Link
                href={`/api/export?topic=${t.id}&format=csv`}
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  padding: "5px 10px",
                  borderRadius: 4,
                  border: "1px solid var(--border)",
                  background: "var(--foreground)",
                  color: "var(--background)",
                  textDecoration: "none",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                CSV
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Attribution</h2>
            <div className="sub">Where the numbers come from</div>
          </div>
        </div>
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: 16,
            fontSize: 12.5,
            color: "var(--foreground-subtle)",
            lineHeight: 1.7,
          }}
        >
          Country register from{" "}
          <a href="https://github.com/mledoze/countries" target="_blank" rel="noopener noreferrer" style={{ color: "var(--foreground)" }}>
            mledoze/countries
          </a>{" "}
          (ODbL). Travel guides extracted from{" "}
          <a href="https://en.wikivoyage.org" target="_blank" rel="noopener noreferrer" style={{ color: "var(--foreground)" }}>
            Wikivoyage
          </a>{" "}
          and{" "}
          <a href="https://en.wikipedia.org" target="_blank" rel="noopener noreferrer" style={{ color: "var(--foreground)" }}>
            Wikipedia
          </a>{" "}
          (CC BY-SA 4.0). Rankings assembled from UN DESA, IMF, World Bank, WHO, UNESCO, FAO, UNHCR, IEA, IRENA, SIPRI, IUCN, ITU, ACI, and the Global Carbon Project. See{" "}
          <Link href="/about" style={{ color: "var(--foreground)" }}>
            /about
          </Link>{" "}
          for the full source list.
        </div>
      </div>
    </div>
  );
}
