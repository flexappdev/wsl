import type { Currency } from "@/lib/wsl-v2/types";

export function CurrencyStrip({ currencies }: { currencies: Currency[] }) {
  const items = [...currencies, ...currencies];
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "8px 0",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div className="wsl-currency-tape" style={{ display: "flex", gap: 28, whiteSpace: "nowrap" }}>
        {items.map((c, i) => (
          <div
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12.5,
              fontFamily: "var(--font-mono)",
              paddingLeft: i === 0 ? 18 : 0,
            }}
          >
            <span style={{ color: "var(--foreground-muted)" }}>{c.code}</span>
            <span style={{ color: "var(--foreground)" }}>
              {c.val.toLocaleString("en-US", { maximumFractionDigits: 4 })}
            </span>
            <span style={{ color: c.ch >= 0 ? "var(--success)" : "var(--destructive)" }}>
              {c.ch >= 0 ? "▲" : "▼"} {Math.abs(c.ch).toLocaleString("en-US", { maximumFractionDigits: 4 })}
            </span>
            <span style={{ color: c.pct >= 0 ? "var(--success)" : "var(--destructive)", opacity: 0.7 }}>
              ({c.pct >= 0 ? "+" : ""}{c.pct.toFixed(2)}%)
            </span>
          </div>
        ))}
      </div>
      <style>{`@keyframes wsl-tape { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.wsl-currency-tape { animation: wsl-tape 60s linear infinite; }`}</style>
    </div>
  );
}
