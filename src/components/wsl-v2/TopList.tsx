import { ChevronRight } from "lucide-react";
import type { RankedCountry } from "@/lib/wsl-v2/types";

type Props = {
  title: string;
  sub?: string;
  data: RankedCountry[];
  barColor?: string;
};

export function TopList({ title, sub, data, barColor = "var(--accent, var(--ws-bo))" }: Props) {
  const max = Math.max(...data.map((d) => d.v));
  return (
    <div>
      <div className="section-head" style={{ marginBottom: 10 }}>
        <div>
          <h2 style={{ fontSize: 16 }}>{title}</h2>
          {sub && <div className="sub">{sub}</div>}
        </div>
        <a className="link" style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--foreground-muted)" }}>
          see all <ChevronRight size={12} />
        </a>
      </div>
      <div className="top-list">
        {data.map((d) => (
          <div key={d.rank} className="top-list-row">
            <span className="rank">{String(d.rank).padStart(2, "0")}</span>
            <div>
              <span className="flag">{d.flag}</span>
              <span className="name">{d.name}</span>
              {d.highlight && (
                <span style={{ marginLeft: 8, fontSize: 10, color: "var(--ws-lists)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  featured
                </span>
              )}
            </div>
            <div className="bar-mini" style={{ background: "var(--muted)" }}>
              <div className="bar-mini-fill" style={{ width: `${(d.v / max) * 100}%`, background: barColor }} />
            </div>
            <span className="v">{d.raw}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
