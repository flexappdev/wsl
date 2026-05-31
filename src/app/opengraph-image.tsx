import { ImageResponse } from "next/og";
import { OG_SIZE, OG_CONTENT_TYPE, OG_RUNTIME, ogPayload } from "@/lib/og";

export const runtime = OG_RUNTIME;
export const contentType = OG_CONTENT_TYPE;
export const size = OG_SIZE;
export const alt = "WSL";

export default function OpengraphImage() {
  const p = ogPayload({
    title: "WSL",
    subtitle: "World Stats Live · population · GDP · climate",
    brand: "WSL",
    accent: "#10b981",
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #0b1220 0%, #111827 60%, #0b1220 100%)",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, color: "#9ca3af", letterSpacing: 2, textTransform: "uppercase" }}>
          {p.brand}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05 }}>{p.title}</div>
          {p.subtitle && (
            <div style={{ marginTop: 16, fontSize: 36, color: "#d1d5db", lineHeight: 1.25 }}>
              {p.subtitle}
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 22 }}>
          <span style={{ width: 14, height: 14, borderRadius: "9999px", background: p.accent, display: "flex" }} />
          <span style={{ color: "#9ca3af" }}>flexappdev/wsl · localhost:19011</span>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
