import type { Metadata } from "next";
import Link from "next/link";
import { getPickerCountries, getCompareRows } from "@/lib/wsl-v2/compare-server";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Compare countries",
  description:
    "Side-by-side comparison of up to 4 countries across 12+ metrics — population, GDP, CO₂ emissions, tourism, life expectancy, internet access, and more.",
  openGraph: {
    title: "Compare countries · World Stats Live",
    description: "Pick up to 4 countries. See them side by side.",
  },
};

type Props = {
  searchParams: Promise<{ ids?: string | string[] }>;
};

const DEFAULT_IDS = ["USA", "CHN", "IND"];
const MAX_COUNTRIES = 4;

function parseIds(raw: string | string[] | undefined): string[] {
  if (!raw) return DEFAULT_IDS;
  const arr = Array.isArray(raw) ? raw : raw.split(",");
  return arr
    .map((s) => s.trim().toUpperCase())
    .filter((s) => /^[A-Z]{3}$/.test(s))
    .slice(0, MAX_COUNTRIES);
}

export default async function ComparePage({ searchParams }: Props) {
  const params = await searchParams;
  const ids = parseIds(params.ids);
  const [rows, picker] = await Promise.all([getCompareRows(ids), getPickerCountries()]);

  // Union of all stat labels across rows, preserving order from the first row.
  const labels = new Set<string>();
  for (const r of rows) for (const s of r.stats) labels.add(s.label);
  const labelList = Array.from(labels);

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumb">DATA · COMPARE</div>
          <h1>Countries, side by side.</h1>
          <div className="sub">
            Pick up to {MAX_COUNTRIES} countries. Add or remove by editing the URL — <code>?ids=USA,CHN,IND</code> — or use the quick presets below.
          </div>
        </div>
      </div>

      {/* Preset chips */}
      <div className="section">
        <div className="section-head">
          <div>
            <h2>Presets</h2>
            <div className="sub">Common comparisons</div>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            { label: "G7", ids: "USA,GBR,DEU,FRA,ITA" },
            { label: "BRICS", ids: "BRA,RUS,IND,CHN,ZAF" },
            { label: "Nordic", ids: "NOR,SWE,FIN,DNK" },
            { label: "Maghreb", ids: "MAR,DZA,TUN,LBY" },
            { label: "ASEAN core", ids: "IDN,THA,VNM,PHL" },
            { label: "USA vs China", ids: "USA,CHN" },
          ].map((p) => (
            <Link
              key={p.label}
              href={`/compare?ids=${p.ids}`}
              style={{
                padding: "6px 12px",
                border: "1px solid var(--border)",
                borderRadius: 999,
                background: "var(--card)",
                color: "var(--foreground-subtle)",
                fontSize: 12,
                textDecoration: "none",
              }}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Compare table */}
      {rows.length === 0 ? (
        <div style={{ padding: 24, color: "var(--foreground-muted)" }}>
          No valid country codes. Try{" "}
          <Link href="/compare?ids=USA,CHN,IND" style={{ color: "var(--foreground)" }}>
            /compare?ids=USA,CHN,IND
          </Link>
        </div>
      ) : (
        <div className="section">
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              overflow: "auto",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 640 }}>
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "14px 16px",
                      color: "var(--foreground-muted)",
                      fontWeight: 500,
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    Metric
                  </th>
                  {rows.map((r) => (
                    <th
                      key={r.cca3}
                      style={{
                        textAlign: "left",
                        padding: "14px 16px",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <Link
                        href={`/countries/${r.cca3}`}
                        style={{ color: "var(--foreground)", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}
                      >
                        <span style={{ fontSize: 20 }}>{r.flag}</span>
                        <span>{r.name}</span>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {labelList.map((label, i) => (
                  <tr key={label}>
                    <td
                      style={{
                        padding: "10px 16px",
                        color: "var(--foreground-muted)",
                        fontSize: 11.5,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        borderBottom: i < labelList.length - 1 ? "1px solid var(--border)" : "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </td>
                    {rows.map((r) => {
                      const s = r.stats.find((x) => x.label === label);
                      return (
                        <td
                          key={r.cca3}
                          style={{
                            padding: "10px 16px",
                            color: "var(--foreground)",
                            borderBottom: i < labelList.length - 1 ? "1px solid var(--border)" : "none",
                          }}
                        >
                          {s ? (
                            <>
                              <span>{s.value}</span>
                              {s.raw && s.raw !== s.value && (
                                <span style={{ marginLeft: 8, color: "var(--foreground-muted)", fontSize: 11.5 }}>
                                  {s.raw}
                                </span>
                              )}
                            </>
                          ) : (
                            <span style={{ color: "var(--foreground-muted)" }}>—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Country picker (server-rendered link grid; no client JS needed) */}
      <div className="section">
        <div className="section-head">
          <div>
            <h2>Add a country</h2>
            <div className="sub">Click to swap into the last slot ({picker.length} countries indexed)</div>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 4,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: 8,
            maxHeight: 320,
            overflow: "auto",
          }}
        >
          {picker.map((p) => {
            const nextIds = [...ids];
            if (nextIds.length >= MAX_COUNTRIES) nextIds.pop();
            nextIds.push(p.cca3);
            const href = `/compare?ids=${nextIds.join(",")}`;
            const active = ids.includes(p.cca3);
            return (
              <Link
                key={p.cca3}
                href={href}
                style={{
                  padding: "6px 10px",
                  fontSize: 12,
                  color: active ? "var(--foreground-muted)" : "var(--foreground-subtle)",
                  textDecoration: "none",
                  borderRadius: 4,
                  background: active ? "var(--muted)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{p.flag}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
