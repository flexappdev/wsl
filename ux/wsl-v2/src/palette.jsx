// palette.jsx — command palette / search.
function SearchPalette({ open, onClose, onRoute, onCountry }) {
  const [q, setQ] = React.useState('');
  const [idx, setIdx] = React.useState(0);
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
      setQ(''); setIdx(0);
    }
  }, [open]);

  const D = window.WSL_DATA;
  const pages = [
    { id: 'home',       label: 'Dashboard',     hint: '/', route: 'home' },
    { id: 'population', label: 'Population',    hint: '/population', route: 'population' },
    { id: 'gdp',        label: 'GDP & economy', hint: '/gdp',     route: 'gdp' },
    { id: 'climate',    label: 'Climate & energy', hint: '/climate', route: 'climate' },
    { id: 'tourism',    label: 'Tourism',       hint: '/tourism', route: 'tourism' },
    { id: 'destinations',label: 'Destinations', hint: '/destinations', route: 'destinations' },
    { id: 'scroller',   label: 'The big story', hint: '/story', route: 'scroller' },
    { id: 'about',      label: 'About & sources', hint: '/about', route: 'about' },
  ];
  const filterText = (s) => s.toLowerCase().includes(q.toLowerCase());
  const pageHits = q ? pages.filter(p => filterText(p.label)) : pages;
  const countryHits = q ? D.countries.filter(c => filterText(c.name) || filterText(c.capital || '')) : D.countries.slice(0, 6);
  const cityHits = q ? D.cities.filter(c => filterText(c.name)) : [];

  const flat = [
    ...pageHits.map(p => ({ kind: 'page', it: p })),
    ...countryHits.map(c => ({ kind: 'country', it: c })),
    ...cityHits.map(c => ({ kind: 'city', it: c })),
  ];
  React.useEffect(() => { if (idx >= flat.length) setIdx(0); }, [flat.length, idx]);

  const onKey = (e) => {
    if (e.key === 'Escape') { onClose(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(flat.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Enter') {
      const hit = flat[idx];
      if (!hit) return;
      if (hit.kind === 'page') { onRoute(hit.it.route); onClose(); }
      else if (hit.kind === 'country') { onCountry(hit.it); onClose(); }
    }
  };

  if (!open) return null;
  return (
    <div className="palette-overlay" onClick={onClose}>
      <div className="palette" onClick={(e) => e.stopPropagation()}>
        <div className="palette-input">
          <I.Search size={16} />
          <input ref={inputRef} value={q} placeholder="Search countries, cities, pages…"
                 onChange={(e) => { setQ(e.target.value); setIdx(0); }}
                 onKeyDown={onKey} />
          <span className="esc">esc</span>
        </div>
        <div className="palette-list">
          {pageHits.length > 0 && <div className="palette-group">PAGES</div>}
          {pageHits.map((p, i) => {
            const globalIdx = i;
            return (
              <div key={p.id}
                   className={'palette-item' + (idx === globalIdx ? ' active' : '')}
                   onMouseEnter={() => setIdx(globalIdx)}
                   onClick={() => { onRoute(p.route); onClose(); }}>
                <I.Layers size={14} />
                {p.label}
                <span className="pi-meta">{p.hint}</span>
              </div>
            );
          })}
          {countryHits.length > 0 && <div className="palette-group">COUNTRIES</div>}
          {countryHits.map((c, i) => {
            const globalIdx = pageHits.length + i;
            return (
              <div key={c.id}
                   className={'palette-item' + (idx === globalIdx ? ' active' : '')}
                   onMouseEnter={() => setIdx(globalIdx)}
                   onClick={() => { onCountry(c); onClose(); }}>
                <span style={{ fontSize: 14 }}>{c.flag}</span>
                {c.name}
                <span className="pi-meta">{c.region}</span>
              </div>
            );
          })}
          {cityHits.length > 0 && <div className="palette-group">CITIES</div>}
          {cityHits.map((c, i) => {
            const globalIdx = pageHits.length + countryHits.length + i;
            return (
              <div key={c.id}
                   className={'palette-item' + (idx === globalIdx ? ' active' : '')}
                   onMouseEnter={() => setIdx(globalIdx)}
                   onClick={() => { onClose(); }}>
                <I.MapPin size={14} />
                {c.name}
                <span className="pi-meta">{c.country}</span>
              </div>
            );
          })}
          {flat.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--foreground-muted)', fontSize: 13 }}>
              No matches for "{q}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
window.SearchPalette = SearchPalette;
