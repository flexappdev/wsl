/**
 * One-shot seeder for the WSL FLEET collections.
 *
 *   pnpm tsx scripts/seed-mongo.ts        (default — upsert into FLEET)
 *   pnpm tsx scripts/seed-mongo.ts --dry  (read-only, log what would happen)
 *
 * Env required:
 *   MONGO_URI  — connection string
 *   MONGO_DB   — defaults to FLEET (post-migration)
 *
 * FLEET migration (2026-07-09): the 14 legacy `wsl_*` collections in AIDB were
 * consolidated into shared FLEET collections (items / lists / videos / media)
 * with an `{app:'wsl', kind}` discriminator. Slugs are namespaced by kind at
 * seed/fold time (city-*, country-*, hotel-*, top-visited-*, ...) so
 * `{app, slug}` stays unique across the folded kinds.
 *
 * The seeder writes into:
 *   FLEET.items   kind ∈ {city, country, hotel}
 *   FLEET.lists   kind ∈ {ticker, currency, top-visited, fastest-growing,
 *                         largest-gdp, gear, news, trending, fact}
 *   FLEET.videos  (kind field on the video type is optional)
 *   FLEET.media   kind = scroller
 *
 * Legacy `wsl_*` collections in AIDB are NOT touched — drop them manually
 * after the 7-day soak.
 */

import { MongoClient } from "mongodb";
import { SEED } from "../src/lib/wsl-v2/seed";
import type { WslKind } from "../src/lib/wsl-v2/types";

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB ?? "FLEET";
const dryRun = process.argv.includes("--dry");

if (!uri) {
  console.error("[seed-mongo] MONGO_URI is not set — aborting.");
  process.exit(1);
}

const APP = "wsl" as const;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

type WslDoc = Record<string, unknown> & {
  app: typeof APP;
  kind: WslKind;
  slug: string;
};

function withApp<T extends Record<string, unknown>>(
  doc: T,
  kind: WslKind,
  slug: string,
): WslDoc {
  return { ...doc, app: APP, kind, slug };
}

// The set of upserts to perform, grouped by FLEET collection.
type FleetTarget = { coll: string; docs: WslDoc[] };

function buildTargets(): FleetTarget[] {
  const targets: FleetTarget[] = [];

  // ---------- FLEET.items ----------
  const items: WslDoc[] = [];

  for (const city of SEED.cities) {
    items.push(withApp(city, "city", `city-${slugify(city.id)}`));
  }
  for (const country of SEED.countries) {
    items.push(withApp(country, "country", `country-${slugify(country.id)}`));
  }
  // Hotels are exposed as a keyed map in-app; we flatten to one doc per hotel
  // with a `countryId` field so dataSource.ts can regroup on read.
  for (const [countryId, hotels] of Object.entries(SEED.hotels)) {
    for (const hotel of hotels) {
      const slug = `hotel-${slugify(countryId)}-${slugify(hotel.city)}-${slugify(hotel.name)}`;
      items.push(withApp({ ...hotel, countryId }, "hotel", slug));
    }
  }
  targets.push({ coll: "items", docs: items });

  // ---------- FLEET.lists ----------
  const lists: WslDoc[] = [];

  for (const t of SEED.tickers) {
    lists.push(withApp(t, "ticker", `ticker-${slugify(t.id)}`));
  }
  for (const c of SEED.currencies) {
    lists.push(withApp(c, "currency", `currency-${slugify(c.code)}`));
  }
  for (const r of SEED.topVisited) {
    lists.push(withApp(r, "top-visited", `top-visited-${slugify(r.name)}`));
  }
  for (const r of SEED.fastestGrowing) {
    lists.push(
      withApp(r, "fastest-growing", `fastest-growing-${slugify(r.name)}`),
    );
  }
  for (const r of SEED.largestGdp) {
    lists.push(withApp(r, "largest-gdp", `largest-gdp-${slugify(r.name)}`));
  }
  for (const g of SEED.gear) {
    lists.push(withApp(g, "gear", `gear-${slugify(g.name)}`));
  }
  SEED.facts.forEach((f, idx) => {
    lists.push(withApp(f, "fact", `fact-${String(idx + 1).padStart(3, "0")}`));
  });
  for (const n of SEED.news) {
    lists.push(withApp(n, "news", `news-${slugify(n.title)}`));
  }
  for (const t of SEED.trending) {
    lists.push(withApp(t, "trending", `trending-${slugify(t.q)}`));
  }
  targets.push({ coll: "lists", docs: lists });

  // ---------- FLEET.videos ----------
  const videos: WslDoc[] = [];
  for (const v of SEED.videos) {
    videos.push(withApp(v, "video", `video-${slugify(v.title)}`));
  }
  targets.push({ coll: "videos", docs: videos });

  // ---------- FLEET.media (kind='scroller') ----------
  // FLEET.media uses `s3_key` as the composite key with `app`. Editorial
  // scroller chapters aren't S3-backed, so we synthesise `s3_key` from
  // the chapter eye string ("CHAPTER 01" → "scroller-chapter-01") to
  // satisfy the {app, s3_key} unique index.
  const media: WslDoc[] = [];
  for (const chap of SEED.scroller) {
    const key = `scroller-${slugify(chap.eye)}`;
    media.push({
      ...chap,
      app: APP,
      kind: "scroller",
      slug: key,
      s3_key: key,
    });
  }
  targets.push({ coll: "media", docs: media });

  return targets;
}

async function main() {
  console.log(`[seed-mongo] connecting to ${dbName} (dry=${dryRun})`);
  const client = await new MongoClient(uri!, {
    serverSelectionTimeoutMS: 5000,
  }).connect();
  const db = client.db(dbName);

  try {
    const targets = buildTargets();
    for (const { coll, docs } of targets) {
      const byKind = docs.reduce<Record<string, number>>((acc, d) => {
        acc[d.kind] = (acc[d.kind] ?? 0) + 1;
        return acc;
      }, {});
      const summary = Object.entries(byKind)
        .map(([k, v]) => `${k}=${v}`)
        .join(" ");
      console.log(
        `[seed-mongo] FLEET.${coll} → ${docs.length} docs (${summary})`,
      );
      if (dryRun) continue;

      const col = db.collection(coll);
      // Wipe only wsl-scoped docs — never touch other apps' rows.
      const del = await col.deleteMany({ app: APP });
      console.log(
        `[seed-mongo]   deleted ${del.deletedCount} existing wsl docs in FLEET.${coll}`,
      );
      if (docs.length) {
        await col.insertMany(docs);
      }
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
