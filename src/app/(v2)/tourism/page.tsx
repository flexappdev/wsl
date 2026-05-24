import { Ticker } from "@/components/wsl-v2/Ticker";
import { TopList } from "@/components/wsl-v2/TopList";
import { RandomFact } from "@/components/wsl-v2/RandomFact";
import { getWslPayload } from "@/lib/wsl-v2/dataSource";

export const revalidate = 300;

const TICKER_IDS = ["tourism", "hotels", "flights"];

const TOP_AIRPORTS = [
  { rank: 1, name: "Atlanta · ATL",     flag: "🇺🇸", v: 100, raw: "104.7M pax" },
  { rank: 2, name: "Dubai · DXB",       flag: "🇦🇪", v: 88,  raw: "92.3M pax" },
  { rank: 3, name: "Dallas · DFW",      flag: "🇺🇸", v: 80,  raw: "83.6M pax" },
  { rank: 4, name: "Tokyo · HND",       flag: "🇯🇵", v: 75,  raw: "78.7M pax" },
  { rank: 5, name: "London · LHR",      flag: "🇬🇧", v: 74,  raw: "77.8M pax" },
  { rank: 6, name: "Denver · DEN",      flag: "🇺🇸", v: 73,  raw: "77.1M pax" },
  { rank: 7, name: "Istanbul · IST",    flag: "🇹🇷", v: 71,  raw: "75.0M pax" },
  { rank: 8, name: "Los Angeles · LAX", flag: "🇺🇸", v: 70,  raw: "74.0M pax" },
];

export default async function TourismPage() {
  const payload = await getWslPayload();
  const tickers = TICKER_IDS
    .map((id) => payload.tickers.find((t) => t.id === id))
    .filter(Boolean);
  const tourismNews = payload.news.filter((n) => n.tag === "tourism");

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumb">DATA · TOURISM & TRAVEL</div>
          <h1>The world on the move.</h1>
          <div className="sub">
            Global tourism crossed $1.7 trillion in 2024 and is still climbing. Every minute, ~9,400 new
            hotel rooms are booked somewhere on Earth.
          </div>
        </div>
      </div>

      <div className="ticker-grid">
        {tickers.map((t) => t && <Ticker key={t.id} ticker={t} epoch={payload.epoch} />)}
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Most-visited countries</h2>
            <div className="sub">International arrivals · 2024 · UNWTO</div>
          </div>
        </div>
        <div className="row-2">
          <TopList
            title="Top by arrivals"
            sub="2024 · millions of visitors"
            data={payload.topVisited}
            barColor="var(--ws-lists)"
          />
          <TopList
            title="Fastest-growing"
            sub="YoY change in international arrivals"
            data={payload.fastestGrowing}
            barColor="var(--ws-core)"
          />
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Busiest airports</h2>
            <div className="sub">Passenger traffic · 2024 · ACI World</div>
          </div>
        </div>
        <div className="row-2">
          <TopList
            title="Top 8 airports"
            sub="annual passengers"
            data={TOP_AIRPORTS}
            barColor="var(--ws-bo)"
          />
          <RandomFact facts={payload.facts} />
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Tourism wire</h2>
            <div className="sub">Latest from the travel desk</div>
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
          {tourismNews.length === 0 ? (
            <div style={{ padding: 20, fontSize: 12.5, color: "var(--foreground-muted)" }}>
              No tourism stories in the feed right now.
            </div>
          ) : (
            tourismNews.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 16px",
                  borderBottom: i < tourismNews.length - 1 ? "1px solid var(--border)" : "none",
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
  );
}
