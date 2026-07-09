import { computeTicker } from "@/lib/wsl-v2/computeTicker";
import { FMT } from "@/lib/wsl-v2/fmt";
import type { FeedTemplate, Ticker } from "@/lib/wsl-v2/types";

export type FeedItem = {
  k: string;
  html: string;
  tag: string;
  time: string;
  projection: true;
};

function fmtClock(d: Date): string {
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}:${String(d.getUTCSeconds()).padStart(2, "0")}`;
}

export function makeFeedItem(
  ts: number,
  templates: FeedTemplate[],
  cityPool: string[],
  popTicker: Ticker | undefined,
  epoch: number,
  rand: () => number = Math.random,
): FeedItem {
  const tpl = templates[Math.floor(rand() * templates.length)];
  const city = cityPool[Math.floor(rand() * cityPool.length)];
  const n = Math.floor(rand() * 9000 + 1000);
  const popVal = popTicker ? FMT.int(computeTicker(popTicker, ts, epoch)) : "—";
  const html = tpl.tpl
    .replace("{city}", city)
    .replace("{n}", n.toLocaleString())
    .replace("{pop}", popVal);
  return {
    k: `${ts}_${Math.floor(rand() * 1e6)}`,
    html,
    tag: tpl.tag,
    time: fmtClock(new Date(ts)),
    projection: true,
  };
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeInitialFeed(
  templates: FeedTemplate[],
  cities: string[],
  popTicker: Ticker | undefined,
  epoch: number,
  now: number,
  count = 6,
): FeedItem[] {
  const rand = mulberry32(Math.floor(now / 60000));
  return Array.from({ length: count }, (_, i) => makeFeedItem(now - i * 5000, templates, cities, popTicker, epoch, rand));
}
