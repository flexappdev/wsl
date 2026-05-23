// scroller.jsx — scrolling data story.
function Scroller() {
  const [active, setActive] = React.useState(0);
  const refs = React.useRef([]);
  const stageRef = React.useRef(null);

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const scroller = stage.closest('.main');
    const onScroll = () => {
      const mid = (scroller ? scroller.scrollTop + scroller.clientHeight / 2 : window.scrollY + window.innerHeight / 2);
      let best = 0, bestDist = Infinity;
      refs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const parentRect = scroller ? scroller.getBoundingClientRect() : { top: 0 };
        const top = rect.top - parentRect.top + (scroller ? scroller.scrollTop : window.scrollY);
        const center = top + rect.height / 2;
        const dist = Math.abs(center - mid);
        if (dist < bestDist) { bestDist = dist; best = i; }
      });
      setActive(best);
    };
    const target = scroller || window;
    target.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => target.removeEventListener('scroll', onScroll);
  }, []);

  const steps = window.WSL_DATA.scroller;
  const visStep = steps[active];

  return (
    <div className="scroller-stage" ref={stageRef}>
      <div className="scroller-vis">
        <div className="vis-head">
          <h4>Population, in motion</h4>
          <span className="meta">CHAPTER {String(active + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</span>
        </div>
        <div className="vis-body">
          <div className="vis-big">{visStep.bigVal}</div>
          <div className="vis-cap">{visStep.cap}</div>

          <div style={{ marginTop: 28 }}>
            <div className="type-eyebrow" style={{ display: 'block', marginBottom: 8 }}>WORLD POPULATION OVER TIME</div>
            <PopulationCurve active={active} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          {steps.map((_, i) => (
            <div key={i}
                 style={{
                   flex: 1, height: 3, borderRadius: 2,
                   background: i <= active ? 'var(--accent, var(--ws-bo))' : 'var(--muted)',
                   transition: 'background var(--dur-base) var(--ease-out)',
                 }} />
          ))}
        </div>
      </div>

      <div className="scroller-steps">
        {steps.map((s, i) => (
          <div key={i}
               ref={(el) => (refs.current[i] = el)}
               className={'scroller-step' + (i === active ? ' active' : '')}>
            <div className="eye">{s.eye}</div>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PopulationCurve({ active }) {
  // Approximate world population (in billions) from 1700 → 2100 (medium projection).
  const data = [
    { y: 1700, v: 0.6 }, { y: 1800, v: 1.0 }, { y: 1850, v: 1.26 },
    { y: 1900, v: 1.65 }, { y: 1927, v: 2.0 }, { y: 1950, v: 2.5 },
    { y: 1960, v: 3.0 }, { y: 1974, v: 4.0 }, { y: 1987, v: 5.0 },
    { y: 1999, v: 6.0 }, { y: 2011, v: 7.0 }, { y: 2022, v: 8.0 },
    { y: 2026, v: 8.15 }, { y: 2040, v: 9.0 }, { y: 2060, v: 9.7 },
    { y: 2080, v: 10.2 }, { y: 2100, v: 10.4 },
  ];
  const W = 380, H = 140;
  const minY = data[0].y, maxY = data[data.length - 1].y;
  const minV = 0, maxV = 11;
  const xScale = (y) => ((y - minY) / (maxY - minY)) * W;
  const yScale = (v) => H - ((v - minV) / (maxV - minV)) * H;
  const pts = data.map(d => `${xScale(d.y).toFixed(1)},${yScale(d.v).toFixed(1)}`).join(' ');
  const area = `0,${H} ${pts} ${W},${H}`;

  // Highlight a year based on the current chapter
  const focusYears = [2026, 1970, 2026, 2050, 2050];
  const focusY = focusYears[active] ?? 2026;
  const focusV = data.reduce((best, d) => Math.abs(d.y - focusY) < Math.abs(best.y - focusY) ? d : best, data[0]);

  return (
    <svg viewBox={`-10 -10 ${W + 20} ${H + 40}`} width="100%" style={{ display: 'block' }}>
      {/* grid lines */}
      {[0, 2, 4, 6, 8, 10].map((v, i) => (
        <g key={i}>
          <line x1="0" y1={yScale(v)} x2={W} y2={yScale(v)} stroke="var(--border)" strokeWidth="0.5" />
          <text x="-4" y={yScale(v) + 3} fontSize="9" fill="var(--foreground-muted)" textAnchor="end" fontFamily="var(--font-mono)">{v}B</text>
        </g>
      ))}
      {/* x ticks */}
      {[1700, 1800, 1900, 2000, 2100].map((y, i) => (
        <text key={i} x={xScale(y)} y={H + 14} fontSize="9" fill="var(--foreground-muted)" textAnchor="middle" fontFamily="var(--font-mono)">{y}</text>
      ))}
      <polygon points={area} fill="var(--accent, var(--ws-bo))" opacity="0.16" />
      <polyline points={pts} fill="none" stroke="var(--accent, var(--ws-bo))" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <line x1={xScale(focusY)} y1="0" x2={xScale(focusY)} y2={H} stroke="var(--foreground-muted)" strokeWidth="0.5" strokeDasharray="2 2" />
      <circle cx={xScale(focusY)} cy={yScale(focusV.v)} r="3.5" fill="var(--background)" stroke="var(--accent, var(--ws-bo))" strokeWidth="1.5" />
      <text x={xScale(focusY) + 6} y={yScale(focusV.v) - 6} fontSize="9.5" fill="var(--foreground)" fontFamily="var(--font-mono)">{focusY} · {focusV.v.toFixed(1)}B</text>
    </svg>
  );
}

window.Scroller = Scroller;
