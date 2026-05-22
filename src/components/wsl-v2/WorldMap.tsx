"use client";

import { useRef, useState } from "react";
import { FMT } from "@/lib/wsl-v2/fmt";
import type { AccentName, City } from "@/lib/wsl-v2/types";

const LAND_GRID = (() => {
  const W = 100;
  const H = 50;
  const grid: number[][] = Array.from({ length: H }, () => Array(W).fill(0));
  const regions = [
    { cx: 22, cy: 22, rx: 11, ry: 9, j: 1.0 },
    { cx: 19, cy: 33, rx: 6, ry: 4, j: 0.8 },
    { cx: 14, cy: 14, rx: 8, ry: 5, j: 0.7 },
    { cx: 23, cy: 39, rx: 3.5, ry: 2.5, j: 0.7 },
    { cx: 31, cy: 50, rx: 5.5, ry: 9, j: 0.95 },
    { cx: 33, cy: 60, rx: 3, ry: 5, j: 0.85 },
    { cx: 50, cy: 26, rx: 7, ry: 4.5, j: 0.9 },
    { cx: 47, cy: 30, rx: 5, ry: 3, j: 0.7 },
    { cx: 51, cy: 44, rx: 7, ry: 7, j: 1.0 },
    { cx: 53, cy: 53, rx: 4, ry: 5, j: 0.85 },
    { cx: 57, cy: 37, rx: 5, ry: 4, j: 0.7 },
    { cx: 70, cy: 28, rx: 13, ry: 9, j: 1.0 },
    { cx: 78, cy: 38, rx: 8, ry: 5, j: 0.9 },
    { cx: 65, cy: 42, rx: 5, ry: 4, j: 0.85 },
    { cx: 77, cy: 50, rx: 4, ry: 4, j: 0.7 },
    { cx: 73, cy: 53, rx: 3, ry: 2, j: 0.6 },
    { cx: 80, cy: 56, rx: 3, ry: 3, j: 0.55 },
    { cx: 84, cy: 36, rx: 2, ry: 4, j: 0.65 },
    { cx: 86, cy: 67, rx: 6, ry: 4, j: 1.0 },
    { cx: 92, cy: 73, rx: 2, ry: 2, j: 0.7 },
    { cx: 38, cy: 12, rx: 5, ry: 4, j: 0.6 },
  ];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      for (const r of regions) {
        const dx = (x - r.cx) / r.rx;
        const dy = (y - r.cy) / r.ry;
        if (dx * dx + dy * dy <= 1) {
          const seed = (x * 73856093) ^ (y * 19349663);
          const rnd = (Math.abs(seed) % 1000) / 1000;
          if (rnd < r.j) grid[y][x] = 1;
        }
      }
    }
  }
  return grid;
})();

const ACCENT_VARS: Record<AccentName, string> = {
  core: "var(--ws-core)",
  lists: "var(--ws-lists)",
  travel: "var(--ws-travel)",
  bo: "var(--ws-bo)",
  context: "var(--ws-context)",
};

type Props = {
  cities: City[];
  accent?: AccentName;
  height?: number;
  showPing?: boolean;
};

export function WorldMap({ cities, accent = "lists", height = 320, showPing = true }: Props) {
  const [hover, setHover] = useState<City | null>(null);
  const [tipPos, setTipPos] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const accentVar = ACCENT_VARS[accent];

  return (
    <div
      className="dot-map"
      ref={ref}
      style={{ minHeight: height }}
      onMouseLeave={() => {
        setHover(null);
        setTipPos(null);
      }}
    >
      <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet">
        {LAND_GRID.flatMap((row, y) =>
          row.map((v, x) =>
            v ? (
              <circle
                key={`${x},${y}`}
                className="land-dot"
                cx={x + 0.5}
                cy={y + 5}
                r={0.32}
                fill="oklch(0.42 0 0)"
                opacity="0.55"
              />
            ) : null
          )
        )}
        {cities.map((c) => (
          <g
            key={c.id}
            onMouseEnter={() => {
              setHover(c);
              const rect = ref.current?.getBoundingClientRect();
              if (rect) setTipPos({ x: (c.x / 100) * rect.width, y: (c.y / 100) * rect.height });
            }}
            style={{ cursor: "pointer" }}
          >
            {showPing && (
              <circle className="ping" cx={c.x} cy={c.y} r={1.2} fill="none" stroke={accentVar} strokeWidth="0.4" opacity="0.6" />
            )}
            <circle
              className="dot"
              cx={c.x}
              cy={c.y}
              r={hover?.id === c.id ? 1.6 : 1.0}
              fill={accentVar}
              opacity={0.95}
            />
          </g>
        ))}
      </svg>
      {hover && tipPos && (
        <div
          className="map-tooltip"
          style={{
            left: tipPos.x + 12,
            top: tipPos.y - 8,
            transform: tipPos.x > (ref.current?.clientWidth ?? 0) - 160 ? "translateX(-100%) translateX(-24px)" : "none",
          }}
        >
          <div className="tt-city">
            {hover.name}, {hover.country}
          </div>
          <div className="tt-meta">
            {FMT.short(hover.pop * 1e6)} pop · {hover.metric}
          </div>
        </div>
      )}
    </div>
  );
}
