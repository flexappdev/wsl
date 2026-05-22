// app.jsx — main shell + router.
const { useState, useEffect, useMemo, useCallback } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "lists",
  "tickerSpeed": 1,
  "density": "default",
  "showPings": true
}/*EDITMODE-END*/;

const THEME_KEY = 'wsl.theme';
function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) || 'dark'; }
    catch (e) { return 'dark'; }
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }, [theme]);
  return [theme, setTheme];
}

function Sidebar({ route, onRoute, now, epoch }) {
  const items = [
    { id: 'home',         label: 'Dashboard',       Icon: I.Activity },
    { id: 'population',   label: 'Population',      Icon: I.Users },
    { id: 'gdp',          label: 'GDP & economy',   Icon: I.DollarSign },
    { id: 'climate',      label: 'Climate & energy',Icon: I.Cloud },
    { id: 'tourism',      label: 'Tourism',         Icon: I.Plane },
    { id: 'destinations', label: 'Destinations',    Icon: I.MapPin },
    { id: 'scroller',     label: 'The big story',   Icon: I.FileText },
    { id: 'about',        label: 'About & sources', Icon: I.Settings },
  ];
  const pop = D.tickers.find(t => t.id === 'population');
  const co2 = D.tickers.find(t => t.id === 'co2');
  const tour = D.tickers.find(t => t.id === 'tourism');
  return (
    <aside className="sb">
      <div className="sb-brand">
        <div className="sb-mark"><I.Globe size={18} /></div>
        <div className="sb-name">World Stats <span>Live · v2.0</span></div>
      </div>

      <div className="sb-group">
        <div className="type-eyebrow" style={{ padding: '0 10px 6px' }}>MAIN</div>
        {items.map(({ id, label, Icon }) => (
          <a key={id}
             className={'nav-item' + (route === id ? ' active' : '')}
             onClick={() => onRoute(id)}>
            <Icon size={16} /> {label}
          </a>
        ))}
      </div>

      <div className="sb-group">
        <div className="type-eyebrow" style={{ padding: '0 10px 6px' }}>LIVE</div>
        <div className="sb-mini">
          <div className="sb-mini-row"><span>POP</span><span className="v">{FMT.short(computeTicker(pop, now, epoch))}</span></div>
          <div className="sb-mini-row"><span>CO₂ today</span><span className="v down">{(computeTicker(co2, now, epoch) / 1e6).toFixed(2)} Mt</span></div>
          <div className="sb-mini-row"><span>$ tourism</span><span className="v up">${FMT.short(computeTicker(tour, now, epoch))}</span></div>
        </div>
      </div>

      <div className="sb-group">
        <div className="type-eyebrow" style={{ padding: '0 10px 6px' }}>FEATURED</div>
        {D.countries.slice(0, 5).map((c) => (
          <a key={c.id}
             className={'nav-item' + (route === 'country:' + c.id ? ' active' : '')}
             style={{ fontSize: 12.5 }}
             onClick={() => onRoute('country:' + c.id)}>
            <span style={{ fontSize: 14 }}>{c.flag}</span>{c.name}
          </a>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <div className="sb-group">
        <a className="nav-item" onClick={() => onRoute('about')}>
          <I.Settings size={16} /> Sources & method
        </a>
      </div>
    </aside>
  );
}

function Header({ now, theme, onTheme, onSearch, onTweaks }) {
  const date = new Date(now);
  const time = `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}:${String(date.getUTCSeconds()).padStart(2, '0')}`;
  const isDark = theme === 'dark';
  return (
    <header className="hd">
      <div className="hd-globe">
        <span className="dot"></span>
        Live · global
      </div>
      <div className="hd-clock mono">{time} UTC · 20 MAY 2026</div>
      <div className="hd-search">
        <I.Search size={14} className="ico" />
        <input className="input" placeholder="Search countries, cities, indicators…"
               onFocus={onSearch} readOnly />
        <span className="kbd">⌘ K</span>
      </div>
      <div className="hd-actions">
        <button className="btn btn-ghost btn-sm theme-toggle" onClick={() => onTheme(isDark ? 'light' : 'dark')}
                title={isDark ? 'Switch to light' : 'Switch to dark'}
                aria-label="Toggle theme">
          {isDark ? <I.Sun size={13} /> : <I.Moon size={13} />}
          <span className="theme-toggle-label">{isDark ? 'Light' : 'Dark'}</span>
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onTweaks}>
          <I.Settings size={13} /> Customize
        </button>
        <button className="btn btn-ghost btn-icon" title="Notifications">
          <I.Bell size={14} />
        </button>
        <button className="btn btn-ghost btn-icon" title="Saved">
          <I.Bookmark size={14} />
        </button>
        <div className="avatar">M</div>
      </div>
    </header>
  );
}

function Footer({ now }) {
  return (
    <footer className="ft">
      <span>worldstatslive · v2.0.0 · build {new Date(now).toUTCString().slice(0,16)}</span>
      <div className="ft-sources">
        <a>UN DESA</a><a>OWID</a><a>World Bank</a><a>IMF</a><a>UN Tourism</a><a>IEA</a><a>NOAA</a><a>Wikivoyage</a><a>Booking</a><a>Agoda</a>
      </div>
      <span>updated · {new Date(now).toISOString().slice(11, 19)} UTC</span>
    </footer>
  );
}

/* ============================================================
   App root
   ============================================================ */
function App() {
  const [route, setRoute] = useState('home');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [tweak, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [theme, setTheme] = useTheme();
  const now = useNow(tweak.tickerSpeed);
  const epoch = D.epoch;

  // Cmd-K opens search
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onRoute = useCallback((r) => {
    setRoute(r);
    const main = document.querySelector('.main');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const onCountry = useCallback((c) => {
    if (!c) return;
    onRoute('country:' + c.id);
  }, [onRoute]);
  const onCity = useCallback((c) => {
    const co = D.countries.find(cc => cc.name.toLowerCase().includes(c.country.toLowerCase()))
            || D.countries.find(cc => cc.code === c.country);
    if (co) onCountry(co);
  }, [onCountry]);

  let page = null;
  if (route === 'home')         page = <HomePage now={now} epoch={epoch} onRoute={onRoute} onCountry={onCountry} onCity={onCity} />;
  else if (route === 'population')   page = <PopulationPage now={now} epoch={epoch} />;
  else if (route === 'gdp')          page = <GdpPage now={now} epoch={epoch} onCountry={onCountry} />;
  else if (route === 'climate')      page = <ClimatePage now={now} epoch={epoch} />;
  else if (route === 'tourism')      page = <TourismPage now={now} epoch={epoch} onCountry={onCountry} />;
  else if (route === 'destinations') page = <DestinationsPage onCountry={onCountry} />;
  else if (route === 'scroller')     page = <ScrollerPage />;
  else if (route === 'about')        page = <AboutPage />;
  else if (route.startsWith && route.startsWith('country:')) {
    const id = route.slice('country:'.length);
    const c = D.countries.find(cc => cc.id === id);
    page = c ? <CountryPage country={c} onBack={() => onRoute('destinations')} onCountry={onCountry} /> : <div>Country not found.</div>;
  }

  return (
    <div className="shell" data-accent={tweak.accent}>
      <Sidebar route={route} onRoute={onRoute} now={now} epoch={epoch} />
      <Header now={now}
              theme={theme}
              onTheme={setTheme}
              onSearch={() => setPaletteOpen(true)}
              onTweaks={() => window.postMessage({ type: '__activate_edit_mode' }, '*')} />
      <main className="main">
        <div className="main-inner">
          {page}
        </div>
      </main>
      <Footer now={now} />

      <SearchPalette open={paletteOpen}
                     onClose={() => setPaletteOpen(false)}
                     onRoute={onRoute}
                     onCountry={onCountry} />

      <TweaksPanel title="Tweaks">
        <TweakRadio label="Theme"
          value={theme}
          onChange={(v) => setTheme(v)}
          options={['dark','light']} />
        <TweakRadio label="Accent"
          value={tweak.accent}
          onChange={(v) => setTweak('accent', v)}
          options={['core','lists','travel','bo','context']} />
        <TweakSlider label="Ticker speed"
          value={tweak.tickerSpeed}
          onChange={(v) => setTweak('tickerSpeed', v)}
          min={0.25} max={60} step={0.25} unit="×" />
        <TweakToggle label="Animate map pings"
          value={tweak.showPings}
          onChange={(v) => setTweak('showPings', v)} />
        <TweakRadio label="Density"
          value={tweak.density}
          onChange={(v) => setTweak('density', v)}
          options={['compact','default']} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
