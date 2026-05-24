import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getWslPayload } from "@/lib/wsl-v2/dataSource";

export const revalidate = 300;

const SOURCES = [
  { tag: "POPULATION", name: "UN DESA · World Population Prospects", url: "https://population.un.org/wpp/" },
  { tag: "POPULATION", name: "Worldometer · live counters", url: "https://www.worldometers.info/" },
  { tag: "ECONOMY",    name: "IMF · World Economic Outlook",        url: "https://www.imf.org/en/Publications/WEO" },
  { tag: "ECONOMY",    name: "World Bank · Open Data",              url: "https://data.worldbank.org/" },
  { tag: "TOURISM",    name: "UN Tourism (UNWTO) · Barometer",      url: "https://www.unwto.org/" },
  { tag: "TOURISM",    name: "ACI World · Airport rankings",        url: "https://aci.aero/" },
  { tag: "CLIMATE",    name: "NOAA · Mauna Loa CO₂",                url: "https://gml.noaa.gov/ccgg/trends/" },
  { tag: "CLIMATE",    name: "Global Carbon Project",               url: "https://www.globalcarbonproject.org/" },
  { tag: "CLIMATE",    name: "WRI · Global Forest Watch",           url: "https://www.globalforestwatch.org/" },
  { tag: "FLIGHTS",    name: "ADS-B Exchange · live traffic",       url: "https://www.adsbexchange.com/" },
  { tag: "HOTELS",     name: "Booking · Agoda · Expedia (OTAs)",    url: "https://partners.booking.com/" },
  { tag: "BIODIVERSITY", name: "IUCN Red List of Threatened Species", url: "https://www.iucnredlist.org/" },
];

const STACK = [
  { label: "Frontend",  value: "Next.js 15 · React 19 · App Router" },
  { label: "Styling",   value: "Tailwind v3 · CSS variables · radix primitives" },
  { label: "Data",      value: "MongoDB (read-only) · seed fallback" },
  { label: "Auth",      value: "Supabase (single-user allowlist)" },
  { label: "Hosting",   value: "Vercel · edge + node runtimes" },
  { label: "Repo",      value: "github.com/flexappdev/wsl" },
];

const FAQ = [
  {
    q: "Are the live tickers actually live?",
    a: "They're anchored to a known epoch and tick at the source's reported rate. The base values are refreshed from authoritative sources every few hours — between refreshes, what you see is a faithful extrapolation, not a guess.",
  },
  {
    q: "How is the country list curated?",
    a: "We start with the 195 UN-recognised states. Featured country profiles get a full data card (population, GDP, top stays, currency). The rest expand over time — open an issue on GitHub to request a country.",
  },
  {
    q: "Where do the hotel prices come from?",
    a: "Median nightly rate over the next 30 days, aggregated across Booking, Agoda and Expedia partner feeds. Prices update daily and exclude taxes / fees.",
  },
  {
    q: "How do I get the underlying data?",
    a: "Every collection is exposed read-only at /api (coming soon). Snapshots are also dumped weekly to the GitHub repo. For commercial use, get in touch.",
  },
];

export default async function AboutPage() {
  const payload = await getWslPayload();

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumb">ABOUT</div>
          <h1>Where the numbers come from.</h1>
          <div className="sub">
            World Stats Live aggregates open data from international bodies, peer-reviewed datasets,
            OTAs and the live transport network. Every ticker is anchored to a public source — no
            estimates without provenance.
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Data sources</h2>
            <div className="sub">{SOURCES.length} primary sources · refreshed continuously</div>
          </div>
          <div className="right">
            <span className="source-pill">
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: payload.source.overall === "mongo" ? "var(--success)" : "var(--foreground-muted)",
                }}
              />
              {payload.source.overall === "mongo"
                ? `mongo · ${payload.source.dbName}`
                : "seed data"}
            </span>
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
          {SOURCES.map((s, i) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr 24px",
                gap: 12,
                alignItems: "center",
                padding: "12px 18px",
                borderBottom: i < SOURCES.length - 1 ? "1px solid var(--border)" : "none",
                fontSize: 13,
                color: "var(--foreground-subtle)",
                textDecoration: "none",
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
                  justifySelf: "start",
                }}
              >
                {s.tag}
              </span>
              <span>{s.name}</span>
              <ArrowUpRight size={14} style={{ color: "var(--foreground-muted)" }} />
            </a>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Stack</h2>
            <div className="sub">How this site is built</div>
          </div>
        </div>
        <div className="row-2">
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: 16,
            }}
          >
            {STACK.map((row, i) => (
              <div
                key={row.label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr",
                  gap: 12,
                  padding: "8px 0",
                  borderBottom: i < STACK.length - 1 ? "1px solid var(--border)" : "none",
                  fontSize: 13,
                }}
              >
                <span
                  className="type-eyebrow"
                  style={{ fontSize: 10, alignSelf: "center" }}
                >
                  {row.label}
                </span>
                <span style={{ color: "var(--foreground-subtle)" }}>{row.value}</span>
              </div>
            ))}
          </div>
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: 20,
            }}
          >
            <div className="type-eyebrow">METHODOLOGY</div>
            <p style={{ marginTop: 10, fontSize: 13, lineHeight: 1.55, color: "var(--foreground-subtle)" }}>
              Tickers use a fixed epoch and a constant rate to extrapolate between refreshes — so
              the numbers you see are deterministic given a timestamp, not random. When a source
              publishes a new annual figure, we update the base and re-anchor.
            </p>
            <p style={{ marginTop: 10, fontSize: 13, lineHeight: 1.55, color: "var(--foreground-subtle)" }}>
              Country profiles, top-lists and currencies are refreshed quarterly. Live currency
              and commodity prices are a stub today — wire-up to a free FX API is on the roadmap.
            </p>
            <Link
              href="https://github.com/flexappdev/wsl"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 14, display: "inline-flex", gap: 6 }}
            >
              View on GitHub <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <h2>FAQ</h2>
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
          {FAQ.map((item, i) => (
            <div
              key={i}
              style={{
                padding: "16px 20px",
                borderBottom: i < FAQ.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>{item.q}</div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: "var(--foreground-subtle)",
                }}
              >
                {item.a}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
