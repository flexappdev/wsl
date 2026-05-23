// world-map.jsx — Dot map of the world. Equirectangular projection at 100x60.
// Continents are an explicit dot grid baked in; cities are overlaid as accent pings.

// Dense dot grid representing landmass — hand-tuned for an equirectangular projection.
// Each row is one latitude band; values are 0 or 1 per longitude bucket.
// 100 cols × 50 rows. Built up from familiar continent outlines.
const LAND_GRID = (() => {
  // Build via a programmatic approximation of continent silhouettes.
  // We define rough ellipses/regions for each continent.
  const W = 100, H = 50;
  const grid = Array.from({ length: H }, () => Array(W).fill(0));
  const regions = [
    // North America
    { type: 'blob', cx: 22, cy: 22, rx: 11, ry: 9, j: 1.0 },
    { type: 'blob', cx: 19, cy: 33, rx: 6, ry: 4, j: 0.8 },
    { type: 'blob', cx: 14, cy: 14, rx: 8, ry: 5, j: 0.7 },
    { type: 'blob', cx: 23, cy: 39, rx: 3.5, ry: 2.5, j: 0.7 },
    // South America
    { type: 'blob', cx: 31, cy: 50, rx: 5.5, ry: 9, j: 0.95 },
    { type: 'blob', cx: 33, cy: 60, rx: 3, ry: 5, j: 0.85 },
    // Europe
    { type: 'blob', cx: 50, cy: 26, rx: 7, ry: 4.5, j: 0.9 },
    { type: 'blob', cx: 47, cy: 30, rx: 5, ry: 3, j: 0.7 },
    // Africa
    { type: 'blob', cx: 51, cy: 44, rx: 7, ry: 7, j: 1.0 },
    { type: 'blob', cx: 53, cy: 53, rx: 4, ry: 5, j: 0.85 },
    // Middle East
    { type: 'blob', cx: 57, cy: 37, rx: 5, ry: 4, j: 0.7 },
    // Asia
    { type: 'blob', cx: 70, cy: 28, rx: 13, ry: 9, j: 1.0 },
    { type: 'blob', cx: 78, cy: 38, rx: 8, ry: 5, j: 0.9 },
    { type: 'blob', cx: 65, cy: 42, rx: 5, ry: 4, j: 0.85 }, // India
    { type: 'blob', cx: 77, cy: 50, rx: 4, ry: 4, j: 0.7 }, // SE Asia
    { type: 'blob', cx: 73, cy: 53, rx: 3, ry: 2, j: 0.6 }, // archipelago bits
    { type: 'blob', cx: 80, cy: 56, rx: 3, ry: 3, j: 0.55 },
    { type: 'blob', cx: 84, cy: 36, rx: 2, ry: 4, j: 0.65 }, // Japan
    // Australia
    { type: 'blob', cx: 86, cy: 67, rx: 6, ry: 4, j: 1.0 },
    // NZ
    { type: 'blob', cx: 92, cy: 73, rx: 2, ry: 2, j: 0.7 },
    // Greenland / Iceland
    { type: 'blob', cx: 38, cy: 12, rx: 5, ry: 4, j: 0.6 },
  ];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      for (const r of regions) {
        const dx = (x - r.cx) / r.rx, dy = (y - r.cy) / r.ry;
        const d = dx * dx + dy * dy;
        if (d <= 1) {
          // Some randomness for coastline jitter
          const seed = (x * 73856093 ^ y * 19349663) >>> 0;
          const rnd = ((seed % 1000) / 1000);
          if (rnd < r.j) grid[y][x] = 1;
        }
      }
    }
  }
  return grid;
})();

function WorldMap({ cities = [], accent = 'core', height = 320, showPing = true, onCity }) {
  const [hover, setHover] = React.useState(null);
  const [tipPos, setTipPos] = React.useState(null);
  const ref = React.useRef(null);

  // Accent → CSS var color name (resolves at render via getComputedStyle)
  const accentVar = {
    core: 'var(--ws-core)',
    lists: 'var(--ws-lists)',
    travel: 'var(--ws-travel)',
    bo: 'var(--ws-bo)',
    context: 'var(--ws-context)',
  }[accent] || 'var(--ws-bo)';

  return (
    <div className="dot-map" ref={ref}
         style={{ minHeight: height }}
         onMouseLeave={() => { setHover(null); setTipPos(null); }}>
      <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet">
        {/* land grid */}
        {LAND_GRID.flatMap((row, y) =>
          row.map((v, x) => v ? (
            <circle key={x + ',' + y} className="land-dot" cx={x + 0.5} cy={y + 5} r={0.32}
                    fill="oklch(0.42 0 0)" opacity="0.55" />
          ) : null)
        )}
        {/* city dots — accent + ping */}
        {cities.map((c) => (
          <g key={c.id}
             onMouseEnter={(e) => {
               setHover(c);
               const rect = ref.current.getBoundingClientRect();
               setTipPos({ x: (c.x / 100) * rect.width, y: (c.y / 100) * rect.height });
             }}
             onClick={() => onCity && onCity(c)}
             style={{ cursor: 'pointer' }}>
            {showPing && (
              <circle className="ping" cx={c.x} cy={c.y} r={1.2}
                      fill="none" stroke={accentVar} strokeWidth="0.4" opacity="0.6" />
            )}
            <circle className="dot"
                    cx={c.x} cy={c.y} r={hover && hover.id === c.id ? 1.6 : 1.0}
                    fill={accentVar} opacity={0.95} />
          </g>
        ))}
      </svg>
      {hover && tipPos && (
        <div className="map-tooltip"
             style={{
               left: tipPos.x + 12,
               top: tipPos.y - 8,
               transform: tipPos.x > (ref.current?.clientWidth || 0) - 160 ? 'translateX(-100%) translateX(-24px)' : 'none',
             }}>
          <div className="tt-city">{hover.name}, {hover.country}</div>
          <div className="tt-meta">{FMT.short(hover.pop * 1e6)} pop · {hover.metric}</div>
        </div>
      )}
    </div>
  );
}

window.WorldMap = WorldMap;
