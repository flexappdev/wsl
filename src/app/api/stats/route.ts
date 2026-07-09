import { NextResponse } from "next/server";
import { getMongoDb, isMongoConfigured, APP_FILTER } from "@/lib/mongo";
import { SEED } from "@/lib/wsl-v2/seed";

export const runtime = "nodejs";
export const revalidate = 60;

// FLEET migration (2026-07-09): reads shifted from AIDB.{wsl_tickers,
// wsl_currencies, wsl_climate, wsl_flights} to FLEET.lists filtered by
// `{app:'wsl', kind}`. Climate + flights are time-series (one row per fetch);
// tickers + currencies are keyed on their identifier.

type Mode = "live" | "stale" | "seed";

const STALE_AFTER_MS = 45 * 60 * 1000;

type StatsPayload = {
  tickers: Array<{ id: string; value: number; unit?: string; fetchedAt?: number; stale?: boolean }>;
  currencies: Array<{ code: string; rate: number; fetchedAt?: number }>;
  climate: { co2Ppm?: number; fetchedAt?: number };
  flights: { inAir?: number; fetchedAt?: number };
  updatedAt: number;
  mode: Mode;
};

export async function GET() {
  const now = Date.now();
  if (!isMongoConfigured()) {
    return NextResponse.json(seedPayload(now), {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=60" },
    });
  }

  const db = await getMongoDb();
  if (!db) {
    return NextResponse.json(seedPayload(now), {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=60" },
    });
  }

  try {
    const lists = db.collection("lists");
    const [tickers, currencies, climate, flights] = await Promise.all([
      lists.find({ ...APP_FILTER, kind: "ticker" }).limit(50).toArray(),
      lists.find({ ...APP_FILTER, kind: "currency" }).limit(50).toArray(),
      lists.find({ ...APP_FILTER, kind: "climate" }).sort({ fetchedAt: -1 }).limit(1).toArray(),
      lists.find({ ...APP_FILTER, kind: "flights" }).sort({ fetchedAt: -1 }).limit(1).toArray(),
    ]);

    let anyLive = false;
    let anyStale = false;

    const tickerOut = tickers.map((t) => {
      const fetchedAt = Number(t.fetchedAt) || 0;
      const stale = fetchedAt > 0 && now - fetchedAt > STALE_AFTER_MS;
      if (fetchedAt > 0 && !stale) anyLive = true;
      if (stale) anyStale = true;
      return {
        id: String(t.id ?? ""),
        value: Number(t.value ?? t.perSec ?? 0),
        unit: t.unit ? String(t.unit) : undefined,
        fetchedAt: fetchedAt || undefined,
        stale: stale || undefined,
      };
    });

    const currencyOut = currencies.map((c) => {
      const fetchedAt = Number(c.fetchedAt) || 0;
      return {
        code: String(c.code ?? ""),
        rate: Number(c.rate ?? 0),
        fetchedAt: fetchedAt || undefined,
      };
    });

    const climateDoc = climate[0];
    const flightsDoc = flights[0];

    const mode: Mode =
      tickerOut.length === 0 && currencyOut.length === 0
        ? "seed"
        : anyLive && !anyStale
          ? "live"
          : anyStale
            ? "stale"
            : tickerOut.length === 0
              ? "seed"
              : "live";

    const payload: StatsPayload = {
      tickers: tickerOut.length ? tickerOut : seedTickers(),
      currencies: currencyOut.length ? currencyOut : seedCurrencies(),
      climate: climateDoc
        ? { co2Ppm: Number(climateDoc.co2Ppm ?? 0) || undefined, fetchedAt: Number(climateDoc.fetchedAt) || undefined }
        : { co2Ppm: 424.1 },
      flights: flightsDoc
        ? { inAir: Number(flightsDoc.inAir ?? 0) || undefined, fetchedAt: Number(flightsDoc.fetchedAt) || undefined }
        : { inAir: 12500 },
      updatedAt: now,
      mode: mode,
    };
    return NextResponse.json(payload, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=60" },
    });
  } catch {
    return NextResponse.json(seedPayload(now), {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=60" },
    });
  }
}

function seedTickers() {
  // SEED tickers are projected via base + rate * elapsed. For /api/stats we snapshot at "now".
  const now = Date.now();
  const midnight = new Date();
  midnight.setUTCHours(0, 0, 0, 0);
  const elapsedSec = (now - midnight.getTime()) / 1000;
  return SEED.tickers.map((t) => ({
    id: t.id,
    value: Math.round(t.base + t.rate * elapsedSec),
  }));
}

function seedCurrencies() {
  return SEED.currencies.map((c) => ({ code: c.code, rate: c.val }));
}

function seedPayload(now: number): StatsPayload {
  return {
    tickers: seedTickers(),
    currencies: seedCurrencies(),
    climate: { co2Ppm: 424.1 },
    flights: { inAir: 12500 },
    updatedAt: now,
    mode: "seed",
  };
}
