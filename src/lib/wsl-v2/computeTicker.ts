// Ticker math — ported from ux/wsl-v2/src/fmt.js (computeTicker).

import type { Ticker } from "./types";

export function computeTicker(t: Ticker, now: number, epoch: number): number {
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
      v += t.oscillate.amp * Math.sin((secsSinceEpoch / t.oscillate.period) * Math.PI * 2);
    }
  }
  return v;
}
