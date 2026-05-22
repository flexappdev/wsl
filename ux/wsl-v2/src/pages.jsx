// pages.jsx — page composers for the multi-page prototype.
// Depends on globals from widgets.jsx, scroller.jsx, fmt.js, icons.jsx.

const D = window.WSL_DATA;

function PageHead({ crumb, title, sub, right }) {
  return (
    <div className="page-head">
      <div>
        {crumb && <div className="crumb">{crumb}</div>}
        <h1>{title}</h1>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

function SectionHead({ title, sub, right }) {
  return (
    <div className="section-head">
      <div>
        <h2>{title}</h2>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {right && <div className="right">{right}</div>}
    </div>
  );
}

/* ============================================================
   Home / Dashboard
   ============================================================ */
function HomePage({ now, epoch, onRoute, onCountry, onCity }) {
  const tickerIds = ['flights', 'co2', 'tourism', 'hotels'];
  const featured = D.countries.find(c => c.featured);
  return (
    <div>
      <PageHead
        crumb="DASHBOARD · LIVE"
        title="World stats, live."
        sub="The planet's most-watched indicators, updated in real time. Population, climate, tourism, energy and the economy — one console."
        right={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="source-pill"><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }}></span>14 sources connected</span>
          </div>
        }
      />

      <Hero now={now} epoch={epoch} onCity={onCity} />

      <div className="ticker-grid" style={{ marginTop: 18 }}>
        {tickerIds.map(id => {
          const t = D.tickers.find(x => x.id === id);
          return <Ticker key={id} t={t} now={now} epoch={epoch} />;
        })}
      </div>

      <div style={{ marginTop: 14 }}>
        <CurrencyStrip />
      </div>

      <div className="section">
        <SectionHead title="Right now in the world" sub="A rolling feed of what just happened, anywhere." right={
          <span className="source-pill"><span className="live-pip" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}></span>LIVE</span>
        } />
        <div className="row-2">
          <RightNowFeed now={now} epoch={epoch} />
          <RandomFact />
        </div>
      </div>

      <div className="section">
        <SectionHead title="Top of the world" sub="Where people are going, who's growing fastest, who runs the economy." />
        <div className="row-3">
          <TopList title="Most-visited countries" sub="2024 · international arrivals" data={D.topVisited.slice(0, 8)} barColor="var(--ws-lists)" onCountry={(r) => {
            const c = D.countries.find(c => c.name === r.name);
            if (c) onCountry(c);
          }}/>
          <TopList title="Fastest-growing destinations" sub="YoY · 2025 Q1" data={D.fastestGrowing} barColor="var(--ws-travel)" onCountry={(r) => {
            const c = D.countries.find(c => c.name === r.name);
            if (c) onCountry(c);
          }}/>
          <TopList title="Largest economies" sub="GDP nominal · 2024" data={D.largestGdp} barColor="var(--ws-bo)" />
        </div>
      </div>

      <div className="section">
        <SectionHead title="Featured story" sub="A scrollable look at how 8 billion of us got here." right={
          <button className="btn btn-secondary btn-sm" onClick={() => onRoute('scroller')}>
            Open full story <I.ChevronRight size={12} />
          </button>
        }/>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16,
          padding: 22, background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}>
          <div>
            <div className="type-eyebrow" style={{ display: 'block', marginBottom: 10 }}>CHAPTER 01 · POPULATION</div>
            <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 10 }}>
              8.15 billion humans, right now.
            </div>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--foreground-subtle)', lineHeight: 1.55, maxWidth: 540 }}>
              It took 200,000 years for human population to reach one billion. The next billion took 130 years. The latest took just 12 years. We are living through the steepest demographic curve in our species' history.
            </p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 18 }} onClick={() => onRoute('scroller')}>
              Read the story <I.ArrowRight size={12} />
            </button>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16 }}>
            <div className="type-eyebrow" style={{ display: 'block', marginBottom: 8 }}>WORLD POPULATION OVER TIME</div>
            <PopulationCurve active={0} />
          </div>
        </div>
      </div>

      <div className="section">
        <SectionHead title="Featured videos" sub="Visual explainers from across the data web." right={
          <a className="link">Open video library <I.ArrowUpRight size={12} /></a>
        }/>
        <VideoGrid />
      </div>

      <div className="section">
        <SectionHead title="Featured destination" sub="The fastest-growing tourist destination in North Africa." right={
          <button className="btn btn-secondary btn-sm" onClick={() => onCountry(featured)}>
            Open {featured.name} <I.ChevronRight size={12} />
          </button>
        }/>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16,
          background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, oklch(0.42 0.13 55), oklch(0.18 0.04 30))',
            padding: 28, position: 'relative', minHeight: 280,
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          }}>
            <div style={{ position: 'absolute', top: 22, right: 22, fontSize: 48 }}>{featured.flag}</div>
            <div className="type-eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>{featured.region}</div>
            <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em', color: 'white', marginTop: 6 }}>{featured.name}</div>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13.5, maxWidth: 420, marginTop: 10, lineHeight: 1.5 }}>{featured.blurb}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-primary btn-sm" onClick={() => onCountry(featured)}>Explore <I.ArrowRight size={12} /></button>
              <button className="btn btn-ghost btn-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>See on map <I.MapPin size={12} /></button>
            </div>
          </div>
          <div style={{ padding: 22 }}>
            <div className="type-eyebrow" style={{ display: 'block', marginBottom: 10 }}>FEATURED STAYS</div>
            <HotelList countryId={featured.id} />
          </div>
        </div>
      </div>

      <div className="section">
        <SectionHead title="What the world is searching" sub="Trending queries · last 24h"/>
        <div className="row-2">
          <NewsList limit={6} />
          <TrendingSearches />
        </div>
      </div>

      <div className="section">
        <SectionHead title="Travel gear · curated" sub="Editor picks from Amazon · affiliate"/>
        <GearGrid />
      </div>

      <AboutStrip />
    </div>
  );
}

/* ============================================================
   Population page
   ============================================================ */
function PopulationPage({ now, epoch }) {
  const tickerIds = ['population', 'births', 'deaths', 'internet'];
  return (
    <div>
      <PageHead
        crumb="DATA · POPULATION"
        title="How many of us are there?"
        sub="The world adds a net 2.5 humans every second. Every UN forecast says the curve will bend in this century — but the absolute numbers are still climbing."
      />
      <div className="ticker-grid">
        {tickerIds.map(id => {
          const t = D.tickers.find(x => x.id === id);
          return <Ticker key={id} t={t} now={now} epoch={epoch} />;
        })}
      </div>

      <div className="section">
        <SectionHead title="Population over time" sub="1700 → 2100, medium projection · UN DESA"/>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
          <PopulationCurve active={0} />
        </div>
      </div>

      <div className="section">
        <SectionHead title="Most-populous countries" sub="2025 · UN medium variant" />
        <div className="row-2">
          <TopList title="Top 8 by population" data={[
            { rank: 1, name: 'India',          flag: '🇮🇳', v: 100, raw: '1.45B' },
            { rank: 2, name: 'China',          flag: '🇨🇳', v: 97,  raw: '1.41B' },
            { rank: 3, name: 'United States',  flag: '🇺🇸', v: 23,  raw: '345M' },
            { rank: 4, name: 'Indonesia',      flag: '🇮🇩', v: 19,  raw: '280M' },
            { rank: 5, name: 'Pakistan',       flag: '🇵🇰', v: 17,  raw: '244M' },
            { rank: 6, name: 'Nigeria',        flag: '🇳🇬', v: 16,  raw: '227M' },
            { rank: 7, name: 'Brazil',         flag: '🇧🇷', v: 15,  raw: '217M' },
            { rank: 8, name: 'Bangladesh',     flag: '🇧🇩', v: 12,  raw: '173M' },
          ]} barColor="var(--ws-core)" />
          <RandomFact />
        </div>
      </div>

      <AboutStrip />
    </div>
  );
}

/* ============================================================
   GDP & economy page
   ============================================================ */
function GdpPage({ now, epoch, onCountry }) {
  const tickerIds = ['tourism', 'data', 'hotels', 'flights'];
  // Build an "economy speedometer" — derived per-second pulses.
  const gdpPerSec = 3_000_000;          // ~$3M/sec nominal world GDP growth (per fact in data.js)
  const tradePerSec = 75_000;           // rough trade flow per second
  const stockPerSec = 12_000_000;       // notional global stock turnover per sec
  const tradeToday = Math.floor((now - epoch) / 1000 * tradePerSec);
  const stockToday = Math.floor((now - epoch) / 1000 * stockPerSec);
  const gdpToday   = Math.floor((now - epoch) / 1000 * gdpPerSec);

  return (
    <div>
      <PageHead
        crumb="DATA · GDP & ECONOMY"
        title="What the world is worth."
        sub="Global GDP grew past $110 trillion in 2024. Every second, the world economy adds roughly $3 million in value — and turns over orders of magnitude more."
      />

      <div className="gdp-pulse">
        <div className="gdp-pulse-card">
          <div className="eye"><span className="live-pip"></span>WORLD GDP · ADDED TODAY</div>
          <div className="big-counter">${FMT.int(gdpToday)}</div>
          <div className="sub-counter">at $3M/sec nominal growth · IMF 2024 trajectory</div>
          <div className="splits">
            <div>
              <div className="s-label">Trade flow today</div>
              <div className="s-val">${FMT.short(tradeToday)}</div>
              <div className="s-delta">~$75k/sec</div>
            </div>
            <div>
              <div className="s-label">Stock turnover</div>
              <div className="s-val">${FMT.short(stockToday)}</div>
              <div className="s-delta">~$12M/sec</div>
            </div>
            <div>
              <div className="s-label">Nominal world GDP</div>
              <div className="s-val">$110.5T</div>
              <div className="s-delta">+3.2% YoY · IMF</div>
            </div>
          </div>
        </div>
        <div className="gdp-tickers">
          {tickerIds.map(id => {
            const t = D.tickers.find(x => x.id === id);
            return <Ticker key={id} t={t} now={now} epoch={epoch} />;
          })}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <CurrencyStrip />
      </div>

      <div className="section">
        <SectionHead title="Largest economies" sub="GDP nominal · IMF 2024 estimates" right={
          <span className="source-pill mono">USD · trillions</span>
        } />
        <div className="row-2">
          <TopList title="Top 8 by GDP" sub="Together · 67% of world output" data={D.largestGdp} barColor="var(--ws-bo)" onCountry={(r) => {
            const c = D.countries.find(c => c.name === r.name);
            if (c) onCountry && onCountry(c);
          }}/>
          <div className="gdp-share">
            <div className="type-eyebrow" style={{ display: 'block', marginBottom: 14 }}>WORLD GDP · SHARE BY REGION</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { name: 'Asia-Pacific',    v: 36.4, c: 'var(--ws-core)' },
                { name: 'North America',   v: 27.1, c: 'var(--ws-bo)' },
                { name: 'Europe',          v: 22.0, c: 'var(--ws-context)' },
                { name: 'Latin America',   v: 6.2,  c: 'var(--ws-lists)' },
                { name: 'Middle East',     v: 4.5,  c: 'var(--warning)' },
                { name: 'Africa',          v: 3.0,  c: 'var(--ws-travel)' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 56px', gap: 12, alignItems: 'center' }}>
                  <div style={{ fontSize: 12.5, color: 'var(--foreground-subtle)' }}>{r.name}</div>
                  <div style={{ background: 'var(--muted)', height: 10, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(r.v / 36.4) * 100}%`, height: '100%', background: r.c, borderRadius: 3 }}></div>
                  </div>
                  <div className="mono" style={{ fontSize: 12, color: 'var(--foreground)', textAlign: 'right' }}>{r.v}%</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--foreground-muted)', fontFamily: 'var(--font-mono)' }}>
              Source · World Bank, IMF WEO Oct-2024
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <SectionHead title="Currencies & commodities · live tape" sub="Polled every 30 seconds" />
        <div className="row-2">
          <div className="news-list">
            {D.currencies.map((c, i) => (
              <div key={i} className="news-row" style={{ gridTemplateColumns: '120px 1fr auto auto' }}>
                <div className="mono" style={{ fontSize: 12.5, color: 'var(--foreground)' }}>{c.code}</div>
                <div className="mono" style={{ fontSize: 13, color: 'var(--foreground)' }}>{c.val.toLocaleString('en-US', { maximumFractionDigits: 4 })}</div>
                <div className="mono" style={{ fontSize: 12, color: c.ch >= 0 ? 'var(--success)' : 'var(--destructive)', minWidth: 80, textAlign: 'right' }}>
                  {c.ch >= 0 ? '▲' : '▼'} {Math.abs(c.ch).toLocaleString('en-US', { maximumFractionDigits: 4 })}
                </div>
                <div className="mono" style={{ fontSize: 12, color: c.pct >= 0 ? 'var(--success)' : 'var(--destructive)', opacity: 0.85, minWidth: 60, textAlign: 'right' }}>
                  ({c.pct >= 0 ? '+' : ''}{c.pct.toFixed(2)}%)
                </div>
              </div>
            ))}
          </div>
          <RandomFact />
        </div>
      </div>

      <div className="section">
        <SectionHead title="Latest" sub="Markets & macro desk"/>
        <NewsList limit={6} />
      </div>

      <AboutStrip />
    </div>
  );
}

/* ============================================================
   Country detail page (was: modal)
   ============================================================ */
function CountryPage({ country, onBack, onCountry }) {
  if (!country) return null;
  const c = country;
  const heroBg = {
    morocco:  'linear-gradient(135deg, oklch(0.42 0.13 55), oklch(0.20 0.05 30))',
    japan:    'linear-gradient(135deg, oklch(0.40 0.12 25), oklch(0.20 0.04 350))',
    france:   'linear-gradient(135deg, oklch(0.38 0.12 250), oklch(0.18 0.03 250))',
    iceland:  'linear-gradient(135deg, oklch(0.38 0.06 220), oklch(0.18 0.03 220))',
    thailand: 'linear-gradient(135deg, oklch(0.44 0.13 80), oklch(0.20 0.05 50))',
    portugal: 'linear-gradient(135deg, oklch(0.42 0.10 30), oklch(0.20 0.04 30))',
    turkey:   'linear-gradient(135deg, oklch(0.40 0.12 35), oklch(0.20 0.05 25))',
    mexico:   'linear-gradient(135deg, oklch(0.44 0.14 35), oklch(0.20 0.05 30))',
    norway:   'linear-gradient(135deg, oklch(0.38 0.06 245), oklch(0.18 0.03 240))',
    kenya:    'linear-gradient(135deg, oklch(0.44 0.12 55), oklch(0.20 0.04 40))',
    peru:     'linear-gradient(135deg, oklch(0.42 0.10 50), oklch(0.20 0.04 40))',
    vietnam:  'linear-gradient(135deg, oklch(0.42 0.12 145), oklch(0.18 0.04 145))',
  }[c.id] || 'linear-gradient(135deg, oklch(0.34 0.10 65), oklch(0.20 0.04 30))';

  return (
    <div>
      <div className="country-page-back">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          <I.ArrowLeft size={13} /> All destinations
        </button>
        <div className="crumb mono">DESTINATIONS · {c.code}</div>
      </div>

      <div className="country-hero" style={{ background: heroBg }}>
        <div className="country-hero-art">{c.flag}</div>
        <div className="country-hero-meta">
          <div className="h-region">{c.region} · {c.code}</div>
          <div className="h-name">{c.name}</div>
          <p className="h-blurb">{c.blurb}</p>
        </div>
      </div>

      <div className="modal-kpis" style={{ marginTop: 20 }}>
        <div className="modal-kpi"><div className="lab">Population</div><div className="val">{c.pop.toLocaleString()}</div><div className="sub">UN 2025 est.</div></div>
        <div className="modal-kpi"><div className="lab">GDP (nominal)</div><div className="val">{c.gdp}</div><div className="sub">IMF 2024</div></div>
        <div className="modal-kpi"><div className="lab">Visitors / year</div><div className="val">{c.visitors}</div><div className="sub">UN Tourism</div></div>
        <div className="modal-kpi"><div className="lab">Tourism growth</div><div className="val" style={{ color: 'var(--success)' }}>{c.growth}</div><div className="sub">vs 2023</div></div>
      </div>

      <div className="section">
        <div className="row-2">
          <div>
            <SectionHead title="Featured stays" sub="via Booking · Agoda · Expedia" />
            <HotelList countryId={c.id} />
          </div>
          <div>
            <SectionHead title="At a glance" />
            <div className="facts-table">
              {[
                ['Capital', c.capital],
                ['Currency', c.currency],
                ['Languages', c.langs],
                ['Top cities', (c.cities || ['—']).join(' · ')],
                ['Region', c.region],
              ].map(([k, v], i, arr) => (
                <div key={i} className="facts-row" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span className="k">{k}</span>
                  <span className="v" style={{ fontFamily: (k === 'Capital' || k === 'Currency') ? 'var(--font-mono)' : 'inherit' }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20 }}>
              <SectionHead title="Travel gear picks" sub="via Amazon" />
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

      <div className="section">
        <SectionHead title="More destinations" sub="Same region, similar growth" right={
          <button className="btn btn-ghost btn-sm" onClick={onBack}>All destinations <I.ChevronRight size={12} /></button>
        }/>
        <CountryGrid onOpen={onCountry} filter={(cc) => cc.id !== c.id && (cc.region === c.region || cc.accent === c.accent)} />
      </div>

      <AboutStrip />
    </div>
  );
}

/* ============================================================
   Climate page
   ============================================================ */
function ClimatePage({ now, epoch }) {
  const tickerIds = ['co2', 'energy', 'forest', 'species'];
  return (
    <div>
      <PageHead
        crumb="DATA · CLIMATE & ENERGY"
        title="The planet's vital signs."
        sub="Emissions, energy, forest cover and biodiversity — the slow indicators that shape every other system."
      />
      <div className="ticker-grid">
        {tickerIds.map(id => {
          const t = D.tickers.find(x => x.id === id);
          return <Ticker key={id} t={t} now={now} epoch={epoch} />;
        })}
      </div>

      <div className="section">
        <SectionHead title="Energy mix · 2024" sub="Share of total global electricity generation"/>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 60px', rowGap: 12, columnGap: 16, alignItems: 'center' }}>
            {[
              { name: 'Coal',         v: 35.6, c: 'oklch(0.5 0.04 30)' },
              { name: 'Natural gas',  v: 22.5, c: 'oklch(0.6 0.12 60)' },
              { name: 'Hydro',        v: 14.9, c: 'var(--ws-bo)' },
              { name: 'Wind',         v: 7.8,  c: 'var(--ws-travel)' },
              { name: 'Nuclear',      v: 9.1,  c: 'var(--ws-context)' },
              { name: 'Solar',        v: 5.5,  c: 'var(--warning)' },
              { name: 'Other renew.', v: 4.6,  c: 'oklch(0.62 0.10 145)' },
            ].map((row, i) => (
              <React.Fragment key={i}>
                <div style={{ fontSize: 13, color: 'var(--foreground-subtle)' }}>{row.name}</div>
                <div style={{ background: 'var(--muted)', height: 14, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${(row.v / 36) * 100}%`, height: '100%', background: row.c, borderRadius: 4 }}></div>
                </div>
                <div className="mono" style={{ fontSize: 13, color: 'var(--foreground)', textAlign: 'right' }}>{row.v}%</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <SectionHead title="Latest" sub="Climate & energy news desk"/>
        <NewsList limit={6} />
      </div>

      <AboutStrip />
    </div>
  );
}

/* ============================================================
   Tourism page
   ============================================================ */
function TourismPage({ now, epoch, onCountry }) {
  const tickerIds = ['tourism', 'flights', 'hotels', 'internet'];
  return (
    <div>
      <PageHead
        crumb="DATA · TOURISM & TRAVEL"
        title="Where the world is going."
        sub="$1.7 trillion spent each year, 1.4 billion border crossings, and a map that's redrawn every quarter."
      />
      <div className="ticker-grid">
        {tickerIds.map(id => {
          const t = D.tickers.find(x => x.id === id);
          return <Ticker key={id} t={t} now={now} epoch={epoch} />;
        })}
      </div>

      <div className="section">
        <SectionHead title="Top destinations · 2024–25" sub="By international arrivals"/>
        <div className="row-2">
          <TopList title="Most-visited" data={D.topVisited} barColor="var(--ws-lists)" onCountry={(r) => {
            const c = D.countries.find(c => c.name === r.name);
            if (c) onCountry(c);
          }}/>
          <TopList title="Fastest-growing" data={D.fastestGrowing} barColor="var(--ws-travel)" onCountry={(r) => {
            const c = D.countries.find(c => c.name === r.name);
            if (c) onCountry(c);
          }}/>
        </div>
      </div>

      <div className="section">
        <SectionHead title="Trending searches · 24h" sub="What people are planning right now"/>
        <div className="row-2">
          <TrendingSearches />
          <RandomFact />
        </div>
      </div>

      <AboutStrip />
    </div>
  );
}

/* ============================================================
   Destinations page
   ============================================================ */
function DestinationsPage({ onCountry }) {
  const [region, setRegion] = React.useState('all');
  const regions = ['all', 'North Africa', 'Western Europe', 'East Asia', 'Southeast Asia', 'South America', 'North America', 'Northern Europe', 'East Africa', 'Western Asia'];
  const filter = region === 'all' ? null : (c) => c.region === region;
  return (
    <div>
      <PageHead
        crumb="DESTINATIONS"
        title="195 countries. One console."
        sub="Drill into any country to see population, GDP, visitors, top stays and curated gear. Booking, Agoda and Expedia inventory is aggregated below each hotel."
      />

      <div className="filter-bar" style={{ display: 'flex', gap: 8, padding: '0 0 16px', flexWrap: 'wrap' }}>
        <div className="seg">
          {regions.map(r => (
            <button key={r} className={region === r ? 'active' : ''} onClick={() => setRegion(r)}>
              {r === 'all' ? 'All regions' : r}
            </button>
          ))}
        </div>
      </div>

      <CountryGrid onOpen={onCountry} filter={filter} />

      <div className="section">
        <SectionHead title="Travel gear · curated" sub="Editor picks from Amazon · affiliate"/>
        <GearGrid />
      </div>

      <AboutStrip />
    </div>
  );
}

/* ============================================================
   Scroller page
   ============================================================ */
function ScrollerPage() {
  return (
    <div>
      <PageHead
        crumb="STORY · POPULATION"
        title="Population, in motion."
        sub="Scroll to follow the curve. Every chapter is anchored to a single number — and the chart updates as you go."
      />
      <Scroller />
      <AboutStrip />
    </div>
  );
}

/* ============================================================
   About / Sources page
   ============================================================ */
function AboutPage() {
  const sources = [
    { name: 'UN DESA · World Population Prospects',     url: 'population.un.org', tag: 'pop' },
    { name: 'Our World in Data',                        url: 'github.com/owid',  tag: 'climate' },
    { name: 'World Bank Open Data',                     url: 'data.worldbank.org', tag: 'econ' },
    { name: 'IMF · World Economic Outlook',             url: 'imf.org/data',     tag: 'econ' },
    { name: 'UN Tourism · Barometer',                   url: 'unwto.org',        tag: 'tourism' },
    { name: 'IEA · Global Energy Review',               url: 'iea.org',          tag: 'energy' },
    { name: 'NOAA · Mauna Loa CO₂',                    url: 'gml.noaa.gov',     tag: 'climate' },
    { name: 'Wikivoyage',                               url: 'wikivoyage.org',   tag: 'tourism' },
    { name: 'Wikipedia',                                url: 'wikipedia.org',    tag: 'pop' },
    { name: 'ccmars/world-data',                        url: 'github.com',       tag: 'econ' },
    { name: 'datasets/gdp',                             url: 'github.com',       tag: 'econ' },
    { name: 'Booking, Agoda, Expedia (inventory)',      url: '—',                tag: 'tourism' },
    { name: 'OpenSky · ADS-B',                          url: 'opensky-network.org', tag: 'tourism' },
    { name: 'Mastercard GDCI',                          url: 'mastercard.com',   tag: 'tourism' },
  ];
  return (
    <div>
      <PageHead
        crumb="ABOUT"
        title="Where the numbers come from."
        sub="World Stats Live aggregates open data from international bodies, peer-reviewed datasets, OTAs and the live transport network. Every ticker is anchored to a public source — no estimates without provenance."
      />

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 20 }}>
        <div className="type-eyebrow" style={{ display: 'block', marginBottom: 14 }}>SOURCES · 14 ACTIVE</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {sources.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <span className={'feed-tag ' + s.tag}>{s.tag}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--foreground)', fontWeight: 500 }}>{s.name}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--foreground-muted)', marginTop: 2 }}>{s.url}</div>
              </div>
              <I.ArrowUpRight size={14} style={{ color: 'var(--foreground-muted)' }} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
        <div className="type-eyebrow" style={{ display: 'block', marginBottom: 10 }}>METHOD</div>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--foreground-subtle)', lineHeight: 1.6, maxWidth: 760 }}>
          Tickers are derived from published annual or monthly figures, divided down to per-second rates and anchored to a known UTC epoch. They are not measurements — they are projections from the latest official trajectory. Hotel inventory, prices and review scores are aggregated from public OTA endpoints. Visitor counts, GDP and population figures are taken from the most recent IMF, UN and World Bank releases.
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   About strip — appears at the bottom of most pages
   ============================================================ */
function AboutStrip() {
  return (
    <div className="section">
      <div className="about-strip">
        <div>
          <h3>Where this data comes from</h3>
          <p>Aggregated from open datasets and live feeds. Tickers are projections from published rates; nothing here is invented. Every number traces back to a public source.</p>
        </div>
        <div className="sources">
          {['UN DESA','OWID','World Bank','IMF','UN Tourism','IEA','NOAA','Wikivoyage','Wikipedia','Booking','Agoda','Expedia','Mastercard GDCI','OpenSky'].map((s, i) => (
            <span key={i} className="source-pill">{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  PageHead, SectionHead,
  HomePage, PopulationPage, GdpPage, ClimatePage, TourismPage,
  DestinationsPage, ScrollerPage, AboutPage, AboutStrip,
  CountryPage,
});
