"use client";

import { useEffect, useState } from "react";

// Returns a ticking "now" timestamp driven by requestAnimationFrame.
// `speed` multiplies real time — 1 = real time, 2 = double-speed for demos.
export function useNow(speed = 1): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let virtual = Date.now();
    const tick = (t: number) => {
      const dt = t - last;
      last = t;
      virtual += dt * speed;
      setNow(virtual);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  return now;
}
