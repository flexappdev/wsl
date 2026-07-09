import { ImageResponse } from "next/og";

export const runtime = "edge";

const ACCENT = "#10b981";

type OgType = "population" | "co2" | "tourism" | "country" | "default";

const PRESETS: Record<OgType, { title: string; subtitle: string; big?: string }> = {
  population: { title: "World population, live.", subtitle: "births · deaths · net · projected 2050", big: "8.15B" },
  co2:        { title: "CO₂ in the atmosphere.",   subtitle: "NOAA Mauna Loa · updated hourly",     big: "424 ppm" },
  tourism:    { title: "Global tourism, live.",    subtitle: "arrivals · fastest-growing · airports", big: "1.5B/yr" },
  country:    { title: "Country profile",          subtitle: "population · GDP · tourism · live" },
  default:    { title: "World Stats Live",         subtitle: "the planet's vital signs — one console" },
};

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawType = (searchParams.get("type") || "default").toLowerCase() as OgType;
  const type: OgType = (["population", "co2", "tourism", "country", "default"] as OgType[]).includes(rawType)
    ? rawType
    : "default";
  const slug = searchParams.get("slug") || "";

  const preset = PRESETS[type];
  const title = type === "country" && slug
    ? decodeURIComponent(slug).replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : preset.title;
  const subtitle = preset.subtitle;
  const big = preset.big;

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
          background: "linear-gradient(135deg, #0b1220 0%, #111827 60%, #0b1220 100%)",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, letterSpacing: 3, textTransform: "uppercase", color: "#9ca3af" }}>
          <span style={{ width: 14, height: 14, borderRadius: "9999px", background: ACCENT, display: "flex" }} />
          WSL · World Stats Live
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {big && (
            <div style={{ fontSize: 128, fontWeight: 800, lineHeight: 1, color: ACCENT, letterSpacing: "-0.03em" }}>
              {big}
            </div>
          )}
          <div style={{ fontSize: big ? 56 : 84, fontWeight: 700, lineHeight: 1.05, marginTop: big ? 8 : 0 }}>
            {title}
          </div>
          <div style={{ marginTop: 12, fontSize: 30, color: "#d1d5db", lineHeight: 1.25 }}>
            {subtitle}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 22, color: "#9ca3af" }}>
          worldstatslive.org
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
