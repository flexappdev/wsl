import { getWslPayload } from "@/lib/wsl-v2/dataSource";

export const dynamic = "force-dynamic";

const SECTION_LABELS: Record<string, string> = {
  tickers: "Tickers",
  currencies: "Currencies",
  cities: "Cities (world map)",
  topVisited: "Top visited countries",
  fastestGrowing: "Fastest growing destinations",
  largestGdp: "Largest economies",
  countries: "Countries (detail)",
  hotels: "Hotels (by country)",
  gear: "Travel gear",
  news: "News feed",
  trending: "Trending searches",
  facts: "Did-you-know facts",
  videos: "Featured videos",
  scroller: "Scroller chapters",
};

export default async function SiteDataPage() {
  const p = await getWslPayload();
  const entries = Object.entries(SECTION_LABELS) as [keyof typeof p.source.sections, string][];

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumb">ADMIN · SITE DATA</div>
          <h1>Site data shape</h1>
          <div className="sub">
            What the dashboard renders today. Each section either reads from Mongo (when a matching <code>wsl_*</code> collection
            exists and has rows) or falls back to the static seed. Use this view to verify your collection shapes.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="source-pill">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)" }} />
            overall · {p.source.overall === "mongo" ? `mongo · ${p.source.dbName}` : "seed"}
          </span>
        </div>
      </div>

      <div className="top-list" style={{ marginTop: 18 }}>
        {entries.map(([key, label]) => {
          const src = p.source.sections[key] ?? "seed";
          return (
            <div key={key as string} className="top-list-row">
              <span className="rank mono">{(key as string).slice(0, 3).toUpperCase()}</span>
              <div>
                <span className="name">{label}</span>
                <span className="mono" style={{ marginLeft: 8, fontSize: 11, color: "var(--foreground-muted)" }}>wsl_{String(key).toLowerCase()}</span>
              </div>
              <span
                className={"feed-tag " + (src === "mongo" ? "tech" : "pop")}
                style={{ minWidth: 64, justifyContent: "center", display: "inline-flex", alignItems: "center" }}
              >
                {src}
              </span>
              <span className="v">{Array.isArray(p[key as keyof typeof p]) ? (p[key as keyof typeof p] as unknown[]).length : "—"}</span>
            </div>
          );
        })}
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Raw payload</h2>
            <div className="sub">The exact JSON the dashboard renders. Strip <code>_id</code> server-side.</div>
          </div>
        </div>
        <div className="card" style={{ padding: 0 }}>
          <pre
            className="mono"
            style={{
              margin: 0,
              padding: "16px 20px",
              fontSize: 11.5,
              lineHeight: 1.5,
              color: "var(--foreground-subtle)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxHeight: "70vh",
              overflow: "auto",
            }}
          >
            {JSON.stringify(p, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
