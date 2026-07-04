import type { Metadata } from "next";
import { getWikivoyageDataset } from "@/lib/wikivoyage/data";
import { getWslPayload } from "@/lib/wsl-v2/dataSource";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "World map",
  description:
    "Interactive world map — 198 countries with hero images, coordinates plotted from Wikivoyage, plus the 20 seed cities that anchor the WSL scroller feed.",
  openGraph: {
    title: "World map · World Stats Live",
    description: "Where the 198 countries are.",
  },
};

// Simple equirectangular projection into a 1600×800 SVG viewport.
// x = (lon + 180) / 360 * 1600; y = (90 - lat) / 180 * 800
function project(lat: number, lon: number): { x: number; y: number } {
  return {
    x: ((lon + 180) / 360) * 1600,
    y: ((90 - lat) / 180) * 800,
  };
}

export default async function WorldMapPage() {
  const [ds, payload] = await Promise.all([getWikivoyageDataset(), getWslPayload()]);
  const wvPoints = ds.entries
    .filter((e) => e.coordinates)
    .map((e) => ({
      slug: e.slug,
      title: e.title,
      flag: e.flag,
      ...project(e.coordinates!.lat, e.coordinates!.lon),
    }));

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumb">DATA · MAP</div>
          <h1>The whole planet, at a glance.</h1>
          <div className="sub">
            {wvPoints.length} of {ds.count} countries plotted from Wikivoyage coordinates, plus the {payload.cities.length} seed cities that anchor the live feed. Equirectangular projection — hover a dot for the country name; click to open its travel guide.
          </div>
        </div>
      </div>

      <div className="section">
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: 8,
            overflow: "auto",
          }}
        >
          <svg
            viewBox="0 0 1600 800"
            role="img"
            aria-label="World map with country markers"
            style={{ width: "100%", height: "auto", display: "block" }}
          >
            {/* Sea */}
            <rect x="0" y="0" width="1600" height="800" fill="var(--muted)" />

            {/* Very rough continent shapes as visual guides (rectangles per lat/lon quadrant) */}
            <g opacity="0.15">
              {/* North America — 15N-70N, -170W to -50W */}
              <path d="M 44 89 L 578 89 L 578 333 L 44 333 Z" fill="var(--foreground)" />
              {/* South America — -55S to 15N, -80W to -35W */}
              <path d="M 444 333 L 644 333 L 644 644 L 444 644 Z" fill="var(--foreground)" />
              {/* Europe — 35N to 71N, -10W to 60E */}
              <path d="M 756 84 L 1067 84 L 1067 244 L 756 244 Z" fill="var(--foreground)" />
              {/* Africa — -35S to 37N, -20W to 55E */}
              <path d="M 711 236 L 1044 236 L 1044 556 L 711 556 Z" fill="var(--foreground)" />
              {/* Asia — 10N to 78N, 40E to 180E */}
              <path d="M 978 53 L 1600 53 L 1600 356 L 978 356 Z" fill="var(--foreground)" />
              {/* Oceania — -47S to -10S, 110E to 180E */}
              <path d="M 1289 445 L 1600 445 L 1600 609 L 1289 609 Z" fill="var(--foreground)" />
            </g>

            {/* Wikivoyage country dots — use SVG <a> not Next Link (SVG-child limitation) */}
            {wvPoints.map((p) => (
              <a key={p.slug} href={`/wikivoyage/${p.slug}`} style={{ cursor: "pointer" }}>
                <circle cx={p.x} cy={p.y} r="6" fill="var(--ws-core)" opacity="0.7">
                  <title>
                    {p.flag} {p.title}
                  </title>
                </circle>
              </a>
            ))}

            {/* Seed cities — seed uses x/y as percentages of a 100×100 canvas.
                Scale to the 1600×800 viewport. */}
            {payload.cities.map((c) => {
              const cx = (c.x / 100) * 1600;
              const cy = (c.y / 100) * 800;
              return (
                <g key={c.name}>
                  <circle cx={cx} cy={cy} r="4" fill="var(--ws-context)">
                    <title>{c.name}</title>
                  </circle>
                  <text
                    x={cx + 8}
                    y={cy + 3}
                    fontSize="10"
                    fill="var(--foreground)"
                    style={{ fontFamily: "var(--font-mono)", pointerEvents: "none" }}
                  >
                    {c.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Legend</h2>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 24,
            fontSize: 12,
            color: "var(--foreground-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "var(--ws-core)",
                opacity: 0.7,
              }}
            />
            Wikivoyage country ({wvPoints.length}) — click to open guide
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "var(--ws-context)",
              }}
            />
            Seed city ({payload.cities.length}) — anchored to live feed
          </div>
        </div>
      </div>
    </div>
  );
}
