// fmt.js — number/currency formatting helpers
const FMT = {
  int:   (n) => Math.floor(n).toLocaleString('en-US'),
  int2:  (n) => n.toFixed(2),
  usd:   (n) => '$' + Math.floor(n).toLocaleString('en-US'),
  tonnes:(n) => Math.floor(n).toLocaleString('en-US') + ' t',
  kwh:   (n) => {
    if (n > 1e9) return (n/1e9).toFixed(2) + ' TWh';
    if (n > 1e6) return (n/1e6).toFixed(2) + ' GWh';
    return (n/1e3).toFixed(2) + ' MWh';
  },
  bytes: (n) => {
    if (n > 1e18) return (n/1e18).toFixed(2) + ' EB';
    if (n > 1e15) return (n/1e15).toFixed(2) + ' PB';
    if (n > 1e12) return (n/1e12).toFixed(2) + ' TB';
    if (n > 1e9)  return (n/1e9).toFixed(2)  + ' GB';
    return Math.floor(n).toLocaleString('en-US') + ' B';
  },
  sqm: (n) => {
    if (n > 1e6) return (n/1e6).toFixed(2) + ' km²';
    return Math.floor(n).toLocaleString('en-US') + ' m²';
  },
  short: (n) => {
    if (n >= 1e9) return (n/1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n/1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n/1e3).toFixed(0) + 'k';
    return n.toString();
  },
};

// useNow — global ticking time
function useNow(speed = 1) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    let raf, last = performance.now(), virtual = Date.now();
    const tick = (t) => {
      const dt = t - last; last = t;
      virtual += dt * speed;
      setNow(virtual);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed]);
  return now;
}

// computeTicker — returns the current value of a ticker given `now` ms.
function computeTicker(t, now, epoch) {
  // For "today" counters (base 0), use seconds since UTC midnight.
  // For absolute counters, use seconds since the data epoch.
  const date = new Date(now);
  const utcMidnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const secsToday = (now - utcMidnight) / 1000;
  const secsSinceEpoch = (now - epoch) / 1000;
  let v = t.base;
  if (t.base === 0) {
    v = t.rate * secsToday;
  } else {
    v += t.rate * secsSinceEpoch;
    if (t.oscillate) {
      v += t.oscillate.amp * Math.sin(secsSinceEpoch / t.oscillate.period * Math.PI * 2);
    }
  }
  return v;
}

window.FMT = FMT;
window.useNow = useNow;
window.computeTicker = computeTicker;
