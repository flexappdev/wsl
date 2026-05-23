import { Ticker } from "@/components/wsl-v2/Ticker";
import { TopList } from "@/components/wsl-v2/TopList";
import { RandomFact } from "@/components/wsl-v2/RandomFact";
import { PopulationCurve } from "@/components/wsl-v2/PopulationCurve";
import { getWslPayload } from "@/lib/wsl-v2/dataSource";

export const revalidate = 300;

const TICKER_IDS = ["population", "births", "deaths", "internet"];

const MOST_POPULOUS = [
  { rank: 1, name: "India",         flag: "🇮🇳", v: 100, raw: "1.45B" },
  { rank: 2, name: "China",         flag: "🇨🇳", v: 97,  raw: "1.41B" },
  { rank: 3, name: "United States", flag: "🇺🇸", v: 23,  raw: "345M" },
  { rank: 4, name: "Indonesia",     flag: "🇮🇩", v: 19,  raw: "280M" },
  { rank: 5, name: "Pakistan",      flag: "🇵🇰", v: 17,  raw: "244M" },
  { rank: 6, name: "Nigeria",       flag: "🇳🇬", v: 16,  raw: "227M" },
  { rank: 7, name: "Brazil",        flag: "🇧🇷", v: 15,  raw: "217M" },
  { rank: 8, name: "Bangladesh",    flag: "🇧🇩", v: 12,  raw: "173M" },
];

export default async function PopulationPage() {
  const payload = await getWslPayload();
  const tickers = TICKER_IDS
    .map((id) => payload.tickers.find((t) => t.id === id))
    .filter(Boolean);

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumb">DATA · POPULATION</div>
          <h1>How many of us are there?</h1>
          <div className="sub">
            The world adds a net 2.5 humans every second. Every UN forecast says the curve will bend
            this century — but the absolute numbers are still climbing.
          </div>
        </div>
      </div>

      <div className="ticker-grid">
        {tickers.map((t) => t && <Ticker key={t.id} ticker={t} epoch={payload.epoch} />)}
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Population over time</h2>
            <div className="sub">1700 → 2100, medium projection · UN DESA</div>
          </div>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24 }}>
          <PopulationCurve />
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Most-populous countries</h2>
            <div className="sub">2025 · UN medium variant</div>
          </div>
        </div>
        <div className="row-2">
          <TopList
            title="Top 8 by population"
            sub="UN 2025 estimates"
            data={MOST_POPULOUS}
            barColor="var(--ws-core)"
          />
          <RandomFact facts={payload.facts} />
        </div>
      </div>
    </div>
  );
}
