import { NextResponse } from "next/server";
import { getMongoDb, isMongoConfigured, APP, APP_FILTER } from "@/lib/mongo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// FLEET migration (2026-07-09): live ingest writes now target FLEET.lists
// with `{app:'wsl', kind: <currency|ticker|flights|climate>}`. Currency and
// ticker rows are keyed by their existing identifier (currency `code`, ticker
// `id`); flights and climate are time-series so they get one row per fetch
// keyed by `fetchedAt`. No writes go to AIDB.wsl_* anymore.

async function retryFetch(url: string, tries = 3): Promise<Response | null> {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
      if (res.ok) return res;
    } catch {
      // fall through to retry
    }
    await new Promise((r) => setTimeout(r, 250 * Math.pow(2, i)));
  }
  return null;
}

type IngestReport = {
  ok: boolean;
  writes: Record<string, number>;
  errors: string[];
  ts: number;
};

async function ingestFx() {
  const res = await retryFetch("https://api.exchangerate.host/latest?base=USD&symbols=EUR,GBP,JPY,CNY,INR,BRL,ZAR,AUD");
  if (!res) return null;
  const j = (await res.json()) as { rates?: Record<string, number> };
  if (!j?.rates) return null;
  return Object.entries(j.rates).map(([code, rate]) => ({ code, rate: Number(rate) || 0 }));
}

async function ingestBtc() {
  const res = await retryFetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd");
  if (!res) return null;
  const j = (await res.json()) as { bitcoin?: { usd?: number }; ethereum?: { usd?: number } };
  return {
    btc: Number(j?.bitcoin?.usd) || 0,
    eth: Number(j?.ethereum?.usd) || 0,
  };
}

async function ingestFlights() {
  const res = await retryFetch("https://opensky-network.org/api/states/all");
  if (!res) return null;
  const j = (await res.json()) as { states?: unknown[] };
  return Array.isArray(j?.states) ? j.states.length : null;
}

async function ingestCo2() {
  const res = await retryFetch("https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_trend_mlo.csv");
  if (!res) return null;
  const text = await res.text();
  const lines = text.split("\n").filter((l) => l && !l.startsWith("#")).reverse();
  for (const line of lines) {
    const parts = line.split(",").map((s) => s.trim());
    const ppm = Number(parts[4]);
    if (ppm > 300 && ppm < 600) return ppm;
  }
  return null;
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization") || "";
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  const report: IngestReport = { ok: false, writes: {}, errors: [], ts: Date.now() };

  if (!isMongoConfigured()) {
    report.errors.push("MONGO_URI not configured");
    return NextResponse.json(report, { status: 200 });
  }

  const db = await getMongoDb();
  if (!db) {
    report.errors.push("mongo connect failed");
    return NextResponse.json(report, { status: 200 });
  }

  const now = Date.now();
  const lists = db.collection("lists");

  const [fx, coins, flights, co2] = await Promise.allSettled([
    ingestFx(),
    ingestBtc(),
    ingestFlights(),
    ingestCo2(),
  ]);

  if (fx.status === "fulfilled" && fx.value) {
    const rows = fx.value;
    const bulk = rows.map((r) => ({
      updateOne: {
        filter: { ...APP_FILTER, kind: "currency", slug: `currency-${slug(r.code)}` },
        update: {
          $set: {
            app: APP,
            kind: "currency",
            slug: `currency-${slug(r.code)}`,
            code: r.code,
            rate: r.rate,
            fetchedAt: now,
          },
        },
        upsert: true,
      },
    }));
    if (bulk.length) {
      const r = await lists.bulkWrite(bulk);
      report.writes.currencies = (r.upsertedCount || 0) + (r.modifiedCount || 0);
    }
  } else if (fx.status === "rejected") report.errors.push("fx:" + String(fx.reason));

  if (coins.status === "fulfilled" && coins.value) {
    const { btc, eth } = coins.value;
    const tickers = [
      { id: "btc", value: btc, unit: "USD", fetchedAt: now },
      { id: "eth", value: eth, unit: "USD", fetchedAt: now },
    ];
    const bulk = tickers.map((t) => ({
      updateOne: {
        filter: { ...APP_FILTER, kind: "ticker", slug: `ticker-${slug(t.id)}` },
        update: {
          $set: {
            app: APP,
            kind: "ticker",
            slug: `ticker-${slug(t.id)}`,
            ...t,
          },
        },
        upsert: true,
      },
    }));
    const r = await lists.bulkWrite(bulk);
    report.writes.tickers = (r.upsertedCount || 0) + (r.modifiedCount || 0);
  } else if (coins.status === "rejected") report.errors.push("btc:" + String(coins.reason));

  if (flights.status === "fulfilled" && typeof flights.value === "number") {
    // Time-series: one row per fetch keyed by fetchedAt.
    await lists.insertOne({
      app: APP,
      kind: "flights",
      slug: `flights-${now}`,
      inAir: flights.value,
      fetchedAt: now,
    });
    report.writes.flights = 1;
  } else if (flights.status === "rejected") report.errors.push("flights:" + String(flights.reason));

  if (co2.status === "fulfilled" && co2.value) {
    await lists.insertOne({
      app: APP,
      kind: "climate",
      slug: `climate-${now}`,
      co2Ppm: co2.value,
      fetchedAt: now,
    });
    report.writes.climate = 1;
  } else if (co2.status === "rejected") report.errors.push("co2:" + String(co2.reason));

  report.ok = Object.keys(report.writes).length > 0;
  return NextResponse.json(report);
}
