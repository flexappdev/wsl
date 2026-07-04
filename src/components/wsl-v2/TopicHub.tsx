// Shared topic-hub layout used by /energy /health /education /migration /technology
// /hunger /conflict /biodiversity. Renders eyebrow + title + lede + optional tickers +
// two side-by-side TopLists + optional sources footer.

import { Ticker } from "@/components/wsl-v2/Ticker";
import { TopList } from "@/components/wsl-v2/TopList";
import type { Ticker as TickerType } from "@/lib/wsl-v2/types";
import type { RankedRow } from "@/lib/wsl-v2/rankings";

type Source = { name: string; url?: string };

type Props = {
  crumb: string;
  title: string;
  lede: React.ReactNode;
  tickers?: TickerType[];
  epoch?: number;
  leftList: { title: string; sub: string; data: RankedRow[]; color?: string };
  rightList: { title: string; sub: string; data: RankedRow[]; color?: string };
  sources?: Source[];
};

export function TopicHub({
  crumb,
  title,
  lede,
  tickers = [],
  epoch = Date.now(),
  leftList,
  rightList,
  sources = [],
}: Props) {
  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumb">{crumb}</div>
          <h1>{title}</h1>
          <div className="sub">{lede}</div>
        </div>
      </div>

      {tickers.length > 0 && (
        <div className="ticker-grid">
          {tickers.map((t) => (
            <Ticker key={t.id} ticker={t} epoch={epoch} />
          ))}
        </div>
      )}

      <div className="section">
        <div className="row-2">
          <TopList
            title={leftList.title}
            sub={leftList.sub}
            data={leftList.data}
            barColor={leftList.color ?? "var(--ws-core)"}
          />
          <TopList
            title={rightList.title}
            sub={rightList.sub}
            data={rightList.data}
            barColor={rightList.color ?? "var(--ws-lists)"}
          />
        </div>
      </div>

      {sources.length > 0 && (
        <div className="section">
          <div className="section-head">
            <div>
              <h2>Sources</h2>
              <div className="sub">Where the numbers come from</div>
            </div>
          </div>
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: 16,
              fontSize: 13,
              color: "var(--foreground-subtle)",
              lineHeight: 1.8,
            }}
          >
            {sources.map((s, i) => (
              <span key={s.name}>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--foreground)" }}>
                    {s.name}
                  </a>
                ) : (
                  s.name
                )}
                {i < sources.length - 1 && <span style={{ color: "var(--foreground-muted)" }}> · </span>}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
