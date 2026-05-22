// widgets.jsx — shared visual widgets.
// Depends on global: I (icons), FMT, useNow, computeTicker, WorldMap, WSL_DATA.

const D = window.WSL_DATA;

/* ============================================================
   Sparkline — small inline SVG
   ============================================================ */
function Sparkline({ values, color = 'var(--accent, var(--ws-bo))', w = 80, h = 22 }) {
  const max = Math.max(...values), min = Math.min(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / range) * (h - 2) - 1).toFixed(1)}`).join(' ');
  return (
    <svg className="spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" opacity="0.8"/>
    </svg>
  );
}

/* ============================================================
   Ticker — small live counter card
   ============================================================ */
function Ticker({ t, now, epoch, density = 'default' }) {
  const v = computeTicker(t, now, epoch);
  const IconCmp = I[t.icon] || I.Activity;
  const sparkData = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < 24; i++) arr.push(70 + Math.sin(i * 0.7 + (t.id?.length || 1)) * 14 + (i / 24) * 18);
    return arr;
  }, [t.id]);
  return (
    <div className="ticker" data-accent={t.accent} style={density === 'compact' ? { padding: '10px 12px' } : {}}>
      <div className="ticker-accent"></div>
      <div className="ticker-head">
        <div className="ticker-label">
          <IconCmp size={13} /> {t.label}
        </div>
      </div>
      <div className={'ticker-value' + (density === 'compact' ? '' : '')}>
        {FMT[t.fmt](v)}
      </div>
      <div className={'ticker-delta' + (t.deltaDown ? ' down' : ' up')}>
        {t.deltaDown
          ? <I.TrendingDown size={11} />
          : <I.TrendingUp size={11} />}
        {t.delta}
      </div>
      <div className="ticker-spark">
        <Sparkline values={sparkData} w={100} h={32}/>
      </div>
    </div>
  );
}

/* ============================================================
   Hero — featured big counter + map
   ============================================================ */
function Hero({ now, epoch, onCity }) {
  const pop = D.tickers.find(t => t.id === 'population');
  const births = D.tickers.find(t => t.id === 'births');
  const deaths = D.tickers.find(t => t.id === 'deaths');
  const internet = D.tickers.find(t => t.id === 'internet');
  const v = computeTicker(pop, now, epoch);
  const b = computeTicker(births, now, epoch);
  const d = computeTicker(deaths, now, epoch);
  const net = b - d;
  return (
    <div className="hero">
      <div className="hero-feature">
        <div className="eye"><span className="live-pip"></span>WORLD POPULATION · LIVE</div>
        <div>
          <div className="big-counter">{FMT.int(v)}</div>
          <div className="sub-counter" style={{ marginTop: 8 }}>
            Net change today: <span style={{ color: 'var(--success)' }}>+{FMT.int(net)}</span>
          </div>
        </div>
        <div className="splits">
          <div>
            <div className="s-label">Births today</div>
            <div className="s-val">+{FMT.int(b)}</div>
            <div className="s-delta">↑ 4.3 / sec</div>
          </div>
          <div>
            <div className="s-label">Deaths today</div>
            <div className="s-val">−{FMT.int(d)}</div>
            <div className="s-delta down">↓ 1.86 / sec</div>
          </div>
          <div>
            <div className="s-label">Online now</div>
            <div className="s-val">{FMT.short(computeTicker(internet, now, epoch))}</div>
            <div className="s-delta">↑ 5.2k / sec</div>
          </div>
        </div>
      </div>
      <div className="hero-map">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <div className="eye" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>
              <span className="live-pip" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}></span>
              GLOBAL ACTIVITY · NOW
            </div>
            <div style={{ fontSize: 12, color: 'var(--foreground-muted)', marginTop: 4 }}>
              Hover any city for live metrics
            </div>
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--foreground-muted)' }}>
            {D.cities.length} cities · refreshing
          </div>
        </div>
        <WorldMap cities={D.cities} accent="lists" onCity={onCity} />
        <div className="map-legend">
          <span><span className="lg-dot" style={{ background: 'var(--ws-lists)' }}></span>major metro</span>
          <span><span className="lg-dot" style={{ background: 'oklch(0.42 0 0)' }}></span>landmass</span>
          <span style={{ marginLeft: 'auto', textTransform: 'none', letterSpacing: 0 }} className="mono">{new Date(now).toUTCString().slice(17, 25)} UTC</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Currency strip — horizontally scrolling tape
   ============================================================ */
function CurrencyStrip() {
  // Render twice for seamless loop
  const items = [...D.currencies, ...D.currencies];
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
      padding: '8px 0', overflow: 'hidden', position: 'relative',
    }}>
      <div style={{
        display: 'flex', gap: 28, whiteSpace: 'nowrap',
        animation: 'tape 60s linear infinite',
      }}>
        {items.map((c, i) => (
          <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontFamily: 'var(--font-mono)', paddingLeft: i === 0 ? 18 : 0 }}>
            <span style={{ color: 'var(--foreground-muted)' }}>{c.code}</span>
            <span style={{ color: 'var(--foreground)' }}>{c.val.toLocaleString('en-US', { maximumFractionDigits: 4 })}</span>
            <span style={{ color: c.ch >= 0 ? 'var(--success)' : 'var(--destructive)' }}>
              {c.ch >= 0 ? '▲' : '▼'} {Math.abs(c.ch).toLocaleString('en-US', { maximumFractionDigits: 4 })}
            </span>
            <span style={{ color: c.pct >= 0 ? 'var(--success)' : 'var(--destructive)', opacity: 0.7 }}>
              ({c.pct >= 0 ? '+' : ''}{c.pct.toFixed(2)}%)
            </span>
          </div>
        ))}
      </div>
      <style>{`@keyframes tape { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

/* ============================================================
   Top list — ranked countries
   ============================================================ */
function TopList({ title, sub, data, unit = '', barColor = 'var(--accent, var(--ws-bo))', onCountry }) {
  const max = Math.max(...data.map(d => d.v));
  return (
    <div>
      <div className="section-head" style={{ marginBottom: 10 }}>
        <div>
          <h2 style={{ fontSize: 16 }}>{title}</h2>
          {sub && <div className="sub">{sub}</div>}
        </div>
        <a className="link" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}>see all<I.ChevronRight size={12} /></a>
      </div>
      <div className="top-list">
        {data.map((d) => (
          <div key={d.rank} className="top-list-row" onClick={() => onCountry && onCountry(d)}>
            <span className="rank">{String(d.rank).padStart(2, '0')}</span>
            <div>
              <span className="flag">{d.flag}</span>
              <span className="name">{d.name}</span>
              {d.highlight && <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--ws-lists)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>featured</span>}
            </div>
            <div className="bar-mini" style={{ background: 'var(--muted)' }}>
              <div className="bar-mini-fill" style={{ width: `${(d.v / max) * 100}%`, background: barColor }}></div>
            </div>
            <span className="v">{d.raw}{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Right-now feed
   ============================================================ */
function RightNowFeed({ now, epoch }) {
  const [items, setItems] = React.useState(() => {
    return Array.from({ length: 6 }, (_, i) => makeFeedItem(now - i * 5000, epoch));
  });
  React.useEffect(() => {
    const id = setInterval(() => {
      setItems((cur) => [makeFeedItem(Date.now(), epoch), ...cur].slice(0, 8));
    }, 3200);
    return () => clearInterval(id);
  }, [epoch]);
  return (
    <div className="feed">
      {items.map((it, i) => (
        <div key={it.k} className="feed-row">
          <div className="feed-time">{it.time}</div>
          <div className="feed-text" dangerouslySetInnerHTML={{ __html: it.html }} />
          <span className={'feed-tag ' + it.tag}>{it.tag}</span>
        </div>
      ))}
    </div>
  );
}
function makeFeedItem(ts, epoch) {
  const tpl = D.feedTemplates[Math.floor(Math.random() * D.feedTemplates.length)];
  const city = D.feedCities[Math.floor(Math.random() * D.feedCities.length)];
  const pop = D.tickers.find(t => t.id === 'population');
  const n = Math.floor(Math.random() * 9000 + 1000);
  let html = tpl.tpl
    .replace('{city}', city)
    .replace('{n}', n.toLocaleString())
    .replace('{pop}', FMT.int(computeTicker(pop, ts, epoch)));
  const d = new Date(ts);
  const time = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')}`;
  return { k: ts + '_' + Math.random().toFixed(4), html, tag: tpl.tag, time };
}

/* ============================================================
   Random fact card with roll
   ============================================================ */
function RandomFact() {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % D.facts.length), 9000);
    return () => clearInterval(id);
  }, []);
  const f = D.facts[idx];
  return (
    <div className="fact-card" data-accent="lists">
      <div className="ticker-accent" style={{ background: 'var(--ws-lists)' }}></div>
      <div className="eye"><span className="pip"></span>RIGHT NOW IN THE WORLD</div>
      <div className="fact-text" dangerouslySetInnerHTML={{ __html: f.text }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div className="fact-meta">source · {f.src}</div>
        <button className="btn btn-secondary btn-sm roll" onClick={() => setIdx((i) => (i + 1) % D.facts.length)}>
          <I.Refresh size={12} /> Another
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   News list
   ============================================================ */
function NewsList({ limit = 8 }) {
  return (
    <div className="news-list">
      {D.news.slice(0, limit).map((n, i) => (
        <div key={i} className="news-row">
          <div>
            <div className="news-title">{n.title}</div>
            <div className="news-meta">
              <span className="src">{n.src}</span>
              <span>·</span>
              <span>{n.when} ago</span>
              <span style={{ marginLeft: 4 }}>
                <span className={'feed-tag ' + n.tag}>{n.tag}</span>
              </span>
            </div>
          </div>
          <I.ArrowUpRight size={14} style={{ color: 'var(--foreground-muted)' }} />
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Trending searches
   ============================================================ */
function TrendingSearches() {
  return (
    <div className="trending">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div className="type-eyebrow" style={{ color: 'var(--foreground-muted)' }}>TRENDING SEARCHES · 24H</div>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--foreground-muted)' }}>via Google Trends</span>
      </div>
      {D.trending.map((t, i) => (
        <div key={i} className="trending-row">
          <span className="rank">{String(i + 1).padStart(2, '0')}</span>
          <span className="q">{t.q}</span>
          <span className="v">{t.v}</span>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Video grid
   ============================================================ */
function VideoGrid() {
  return (
    <div className="video-grid">
      {D.videos.map((v, i) => (
        <div key={i} className={'video-card' + (v.big ? ' big' : '')}>
          <div className="video-thumb">
            <div className="vt-art">{v.art}</div>
            <div className="vt-grad"></div>
            <div className="duration mono">{v.duration}</div>
            <div className="play"><I.Play size={v.big ? 18 : 14} /></div>
          </div>
          <div className="video-meta">
            <div className="video-title">{v.title}</div>
            <div className="video-meta-row">
              <span>{v.views} views</span>
              <span>·</span>
              <span>{v.when}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Hotel listings — with subtle Booking/Agoda/Expedia links
   ============================================================ */
function HotelList({ countryId = 'morocco' }) {
  const list = D.hotels[countryId] || D.hotels.default;
  return (
    <div className="hotel-list">
      {list.map((h, i) => (
        <div key={i} className="hotel-row">
          <div className="hotel-thumb">{h.art}</div>
          <div>
            <div className="hotel-name">{h.name}</div>
            <div className="hotel-meta">
              <span className="stars">{'★'.repeat(h.stars)}</span>
              <span className="city">{h.city}</span>
              <span>·</span>
              <span className="review">
                <span className="hotel-review-score">{h.score}</span>
                <span>{h.reviews.toLocaleString()} reviews</span>
              </span>
            </div>
            <div className="hotel-providers">
              <a><I.ExternalLink /> Booking</a>
              <a><I.ExternalLink /> Agoda</a>
              <a><I.ExternalLink /> Expedia</a>
            </div>
          </div>
          <div className="hotel-price">
            <div className="from">from / night</div>
            <div className="amt">${h.price}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Travel gear (Amazon affiliate)
   ============================================================ */
function GearGrid() {
  return (
    <div className="gear-grid">
      {D.gear.map((g, i) => (
        <div key={i} className="gear-card">
          <div className="gear-art">{g.art}</div>
          <div className="gear-name">{g.name}</div>
          <div className="gear-price">
            <span className="am">{g.price}</span>
            <a className="link" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              Amazon <I.ArrowUpRight size={10} />
            </a>
          </div>
          {g.tag && (
            <span className="feed-tag" style={{ alignSelf: 'flex-start', marginTop: -2 }}>{g.tag}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Country card + grid
   ============================================================ */
function CountryCard({ c, onOpen }) {
  return (
    <div className="country-card" onClick={() => onOpen(c)} data-accent={c.accent}>
      <div className="ticker-accent" style={{ background: `var(--ws-${c.accent})` }}></div>
      <div className="cc-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="flag">{c.flag}</span>
          <div>
            <div className="cc-name">{c.name}</div>
            <div className="cc-region">{c.region}</div>
          </div>
        </div>
      </div>
      <div className="cc-stats">
        <div className="cc-stat">visitors/yr<b>{c.visitors}</b></div>
        <div className="cc-stat">population<b>{FMT.short(c.pop)}</b></div>
        <div className="cc-stat">GDP<b>{c.gdp}</b></div>
        <div className="cc-stat">growth<b style={{ color: c.up ? 'var(--success)' : 'var(--destructive)' }}>{c.growth}</b></div>
      </div>
    </div>
  );
}

function CountryGrid({ onOpen, filter }) {
  const list = filter ? D.countries.filter(filter) : D.countries;
  return (
    <div className="country-grid">
      {list.map((c) => <CountryCard key={c.id} c={c} onOpen={onOpen} />)}
    </div>
  );
}

/* ============================================================
   Country Modal — detail drilldown
   ============================================================ */
function CountryModal({ country, onClose }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);
  if (!country) return null;
  const c = country;
  const hotels = D.hotels[c.id] || D.hotels.default;
  // accent gradient for hero
  const heroBg = {
    morocco:  'linear-gradient(135deg, oklch(0.40 0.13 55), oklch(0.18 0.04 30))',
    japan:    'linear-gradient(135deg, oklch(0.38 0.12 25), oklch(0.18 0.03 350))',
    france:   'linear-gradient(135deg, oklch(0.36 0.12 250), oklch(0.16 0.02 250))',
    iceland:  'linear-gradient(135deg, oklch(0.36 0.06 220), oklch(0.16 0.02 220))',
    thailand: 'linear-gradient(135deg, oklch(0.42 0.13 80), oklch(0.18 0.04 50))',
    portugal: 'linear-gradient(135deg, oklch(0.40 0.10 30), oklch(0.18 0.03 30))',
    turkey:   'linear-gradient(135deg, oklch(0.38 0.12 35), oklch(0.18 0.04 25))',
    mexico:   'linear-gradient(135deg, oklch(0.42 0.14 35), oklch(0.18 0.04 30))',
    norway:   'linear-gradient(135deg, oklch(0.36 0.06 245), oklch(0.16 0.02 240))',
    kenya:    'linear-gradient(135deg, oklch(0.42 0.12 55), oklch(0.18 0.03 40))',
    peru:     'linear-gradient(135deg, oklch(0.40 0.10 50), oklch(0.18 0.03 40))',
    vietnam:  'linear-gradient(135deg, oklch(0.40 0.12 145), oklch(0.16 0.03 145))',
  }[c.id] || 'linear-gradient(135deg, oklch(0.32 0.10 65), oklch(0.18 0.04 30))';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-hero" style={{ background: heroBg }}>
          <div className="h-flag">{c.flag}</div>
          <button className="close" onClick={onClose}><I.X size={14} /></button>
          <div>
            <div className="h-region">{c.region} · {c.code}</div>
            <div className="h-name">{c.name}</div>
          </div>
        </div>
        <div className="modal-body">
          <p style={{ margin: '0 0 18px', fontSize: 14, lineHeight: 1.55, color: 'var(--foreground-subtle)', maxWidth: 680 }}>
            {c.blurb}
          </p>
          <div className="modal-kpis">
            <div className="modal-kpi"><div className="lab">Population</div><div className="val">{c.pop.toLocaleString()}</div><div className="sub">UN 2025 est.</div></div>
            <div className="modal-kpi"><div className="lab">GDP (nominal)</div><div className="val">{c.gdp}</div><div className="sub">IMF 2024</div></div>
            <div className="modal-kpi"><div className="lab">Visitors / year</div><div className="val">{c.visitors}</div><div className="sub">UN Tourism</div></div>
            <div className="modal-kpi"><div className="lab">Tourism growth</div><div className="val" style={{ color: 'var(--success)' }}>{c.growth}</div><div className="sub">vs 2023</div></div>
          </div>

          <div className="row-2" style={{ marginBottom: 22 }}>
            <div>
              <div className="section-head" style={{ marginBottom: 10 }}>
                <h2 style={{ fontSize: 16 }}>Featured stays</h2>
                <div className="sub">via Booking · Agoda · Expedia</div>
              </div>
              <HotelList countryId={c.id} />
            </div>
            <div>
              <div className="section-head" style={{ marginBottom: 10 }}>
                <h2 style={{ fontSize: 16 }}>At a glance</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                {[
                  ['Capital', c.capital],
                  ['Currency', c.currency],
                  ['Languages', c.langs],
                  ['Top cities', (c.cities || ['—']).join(' · ')],
                  ['Region', c.region],
                ].map(([k, v], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: i < 4 ? '1px solid var(--border)' : 'none', fontSize: 12.5 }}>
                    <span style={{ color: 'var(--foreground-muted)' }}>{k}</span>
                    <span style={{ color: 'var(--foreground)', fontFamily: k === 'Capital' || k === 'Currency' ? 'var(--font-mono)' : 'inherit', textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
              </div>

              <div className="section-head" style={{ marginBottom: 10, marginTop: 18 }}>
                <h2 style={{ fontSize: 16 }}>Travel gear picks</h2>
                <div className="sub">via Amazon</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {D.gear.slice(0, 4).map((g, i) => (
                  <div key={i} className="gear-card" style={{ padding: '10px 12px' }}>
                    <div className="gear-art" style={{ height: 50, fontSize: 24 }}>{g.art}</div>
                    <div className="gear-name" style={{ fontSize: 11.5 }}>{g.name}</div>
                    <div className="gear-price" style={{ fontSize: 11 }}><span className="am">{g.price}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  Sparkline, Ticker, Hero, CurrencyStrip, TopList, RightNowFeed, RandomFact,
  NewsList, TrendingSearches, VideoGrid, HotelList, GearGrid, CountryCard,
  CountryGrid, CountryModal,
});
