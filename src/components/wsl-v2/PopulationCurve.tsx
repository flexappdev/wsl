// PopulationCurve — ported from ux/wsl-v2.1/src/scroller.jsx (lines 77-120).
// Always focuses on year 2026 (no active-chapter scrolling needed here).

type Props = {
  className?: string;
};

const DATA = [
  { y: 1700, v: 0.6 }, { y: 1800, v: 1.0 }, { y: 1850, v: 1.26 },
  { y: 1900, v: 1.65 }, { y: 1927, v: 2.0 }, { y: 1950, v: 2.5 },
  { y: 1960, v: 3.0 }, { y: 1974, v: 4.0 }, { y: 1987, v: 5.0 },
  { y: 1999, v: 6.0 }, { y: 2011, v: 7.0 }, { y: 2022, v: 8.0 },
  { y: 2026, v: 8.15 }, { y: 2040, v: 9.0 }, { y: 2060, v: 9.7 },
  { y: 2080, v: 10.2 }, { y: 2100, v: 10.4 },
];

const W = 380;
const H = 140;
const MIN_Y = DATA[0].y;
const MAX_Y = DATA[DATA.length - 1].y;
const MIN_V = 0;
const MAX_V = 11;

const xScale = (y: number) => ((y - MIN_Y) / (MAX_Y - MIN_Y)) * W;
const yScale = (v: number) => H - ((v - MIN_V) / (MAX_V - MIN_V)) * H;

const FOCUS_YEAR = 2026;
const focusPoint = DATA.reduce((best, d) =>
  Math.abs(d.y - FOCUS_YEAR) < Math.abs(best.y - FOCUS_YEAR) ? d : best,
  DATA[0]
);

const pts = DATA.map((d) => `${xScale(d.y).toFixed(1)},${yScale(d.v).toFixed(1)}`).join(" ");
const area = `0,${H} ${pts} ${W},${H}`;

export function PopulationCurve({ className }: Props) {
  return (
    <svg
      viewBox={`-10 -10 ${W + 20} ${H + 40}`}
      width="100%"
      style={{ display: "block" }}
      className={className}
    >
      {/* Grid lines */}
      {[0, 2, 4, 6, 8, 10].map((v) => (
        <g key={v}>
          <line
            x1="0" y1={yScale(v)} x2={W} y2={yScale(v)}
            stroke="var(--border)" strokeWidth="0.5"
          />
          <text
            x="-4" y={yScale(v) + 3}
            fontSize="9" fill="var(--foreground-muted)"
            textAnchor="end" fontFamily="var(--font-mono)"
          >
            {v}B
          </text>
        </g>
      ))}
      {/* X-axis ticks */}
      {[1700, 1800, 1900, 2000, 2100].map((y) => (
        <text
          key={y}
          x={xScale(y)} y={H + 14}
          fontSize="9" fill="var(--foreground-muted)"
          textAnchor="middle" fontFamily="var(--font-mono)"
        >
          {y}
        </text>
      ))}
      {/* Area fill */}
      <polygon points={area} fill="var(--accent, var(--ws-bo))" opacity="0.16" />
      {/* Line */}
      <polyline
        points={pts}
        fill="none"
        stroke="var(--accent, var(--ws-bo))"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Focus marker */}
      <line
        x1={xScale(FOCUS_YEAR)} y1="0"
        x2={xScale(FOCUS_YEAR)} y2={H}
        stroke="var(--foreground-muted)" strokeWidth="0.5" strokeDasharray="2 2"
      />
      <circle
        cx={xScale(FOCUS_YEAR)} cy={yScale(focusPoint.v)}
        r="3.5"
        fill="var(--background)"
        stroke="var(--accent, var(--ws-bo))" strokeWidth="1.5"
      />
      <text
        x={xScale(FOCUS_YEAR) + 6} y={yScale(focusPoint.v) - 6}
        fontSize="9.5" fill="var(--foreground)" fontFamily="var(--font-mono)"
      >
        {FOCUS_YEAR} · {focusPoint.v.toFixed(2)}B
      </text>
    </svg>
  );
}
