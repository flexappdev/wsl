/**
 * One-shot seeder for the WSL Mongo collections.
 *
 *   pnpm tsx scripts/seed-mongo.ts        (default — upsert + wipe)
 *   pnpm tsx scripts/seed-mongo.ts --dry  (read-only, log what would happen)
 *
 * Env required:
 *   MONGO_URI  — connection string
 *   MONGO_DB   — defaults to AIDB
 *
 * The seeder mirrors src/lib/wsl-v2/dataSource.ts. The 14 collections it writes:
 *   wsl_tickers · wsl_currencies · wsl_cities · wsl_top_visited
 *   wsl_fastest_growing · wsl_largest_gdp · wsl_countries · wsl_hotels
 *   wsl_gear · wsl_news · wsl_trending · wsl_facts · wsl_videos · wsl_scroller
 *
 * Hotels are written as one document per { countryId, ...hotel } so the same
 * shape the data source expects on read.
 */

import { MongoClient } from "mongodb";
import { SEED } from "../src/lib/wsl-v2/seed";

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB ?? "AIDB";
const dryRun = process.argv.includes("--dry");

if (!uri) {
  console.error("[seed-mongo] MONGO_URI is not set — aborting.");
  process.exit(1);
}

const COLLECTIONS = {
  wsl_tickers: SEED.tickers,
  wsl_currencies: SEED.currencies,
  wsl_cities: SEED.cities,
  wsl_top_visited: SEED.topVisited,
  wsl_fastest_growing: SEED.fastestGrowing,
  wsl_largest_gdp: SEED.largestGdp,
  wsl_countries: SEED.countries,
  wsl_gear: SEED.gear,
  wsl_news: SEED.news,
  wsl_trending: SEED.trending,
  wsl_facts: SEED.facts,
  wsl_videos: SEED.videos,
  wsl_scroller: SEED.scroller,
} as const;

async function main() {
  console.log(`[seed-mongo] connecting to ${dbName} (dry=${dryRun})`);
  const client = await new MongoClient(uri!, {
    serverSelectionTimeoutMS: 5000,
  }).connect();
  const db = client.db(dbName);

  try {
    for (const [name, docs] of Object.entries(COLLECTIONS)) {
      if (!Array.isArray(docs) || docs.length === 0) {
        console.warn(`[seed-mongo] skip ${name} — empty`);
        continue;
      }
      console.log(`[seed-mongo] ${name} → ${docs.length} docs`);
      if (dryRun) continue;
      const col = db.collection(name);
      await col.deleteMany({});
      await col.insertMany(docs as object[]);
    }

    // Hotels: flatten the SEED.hotels keyed-map into { countryId, ...hotel } docs.
    const hotelDocs = Object.entries(SEED.hotels).flatMap(([countryId, list]) =>
      list.map((h) => ({ countryId, ...h }))
    );
    console.log(`[seed-mongo] wsl_hotels → ${hotelDocs.length} docs`);
    if (!dryRun) {
      const col = db.collection("wsl_hotels");
      await col.deleteMany({});
      await col.insertMany(hotelDocs);
    }

    console.log(`[seed-mongo] done.`);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("[seed-mongo] failed:", err);
  process.exit(1);
});
