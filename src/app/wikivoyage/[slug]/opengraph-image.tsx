import { ImageResponse } from "next/og";
import { getWikivoyageBySlug, getWikivoyageDataset } from "@/lib/wikivoyage/data";

// nodejs runtime — bundle exceeds Vercel Edge 1MB cap (see feedback_og_edge_size_cap)
export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = "Country travel guide";

export async function generateImageMetadata() {
  const ds = await getWikivoyageDataset();
  return ds.entries.map((e) => ({
    id: e.slug,
    contentType,
    size,
    alt: `${e.title} travel guide`,
  }));
}

type Props = { params: Promise<{ slug: string }> };

export default async function CountryOgImage({ params }: Props) {
  const { slug } = await params;
  const entry = await getWikivoyageBySlug(slug);
  if (!entry) {
    return new ImageResponse(<div />, { ...size });
  }

  const accent = "#10b981";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0a0a0a 0%, #111827 50%, #0a0a0a 100%)",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: accent,
            display: "flex",
          }}
        />

        {/* Top eyebrow */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#9ca3af",
          }}
        >
          <span style={{ display: "flex" }}>WORLD STATS LIVE · TRAVEL</span>
          <span style={{ display: "flex", color: accent }}>{entry.region}</span>
        </div>

        {/* Center: flag + name */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 180, lineHeight: 1, display: "flex" }}>{entry.flag}</div>
          <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1.05, display: "flex" }}>
            {entry.title}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#d1d5db",
              lineHeight: 1.4,
              maxWidth: 980,
              display: "flex",
            }}
          >
            {entry.extract.slice(0, 140).replace(/\n+/g, " ").trim()}…
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#9ca3af",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 9999,
                background: accent,
                display: "flex",
              }}
            />
            <span style={{ display: "flex" }}>worldstats.live/wikivoyage/{entry.slug}</span>
          </div>
          {entry.coordinates && (
            <div style={{ display: "flex", color: "#6b7280" }}>
              {entry.coordinates.lat.toFixed(1)}°, {entry.coordinates.lon.toFixed(1)}°
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
