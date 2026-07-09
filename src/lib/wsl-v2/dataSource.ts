// Server-side data source for the WSL v2 dashboard.
// Tries Mongo first; falls back to the static seed when Mongo is unset or empty.
// Each section is independent — partial Mongo data layers on top of the seed.
// React.cache memoizes per-request so layout + page fetches share one Mongo round-trip.
//
// FLEET migration (2026-07-09): the 14 bespoke `wsl_*` collections in AIDB have
// been consolidated into shared FLEET collections with an `{app:'wsl', kind}`
// discriminator. Reads now target FLEET.items / FLEET.lists / FLEET.videos /
// FLEET.media with the kind filter that matches each section.

import { cache } from "react";
import { getMongoDb, APP_FILTER } from "@/lib/mongo";
import { SEED } from "./seed";
import type {
  WslPayload,
  Ticker,
  Currency,
  City,
  RankedCountry,
  Country,
  Hotel,
  GearItem,
  News,
  Trending,
  Fact,
  Video,
  ScrollerChapter,
} from "./types";

// FLEET collection + kind pairs for each dashboard section. Reads filter on
// `{app:'wsl', kind}`. Slugs were namespaced at fold time (see
// scripts/fold-wsl-to-fleet.mjs) so `{app, slug}` stays unique across kinds.
const SECTIONS = {
  tickers:        { coll: "lists",  kind: "ticker"          },
  currencies:     { coll: "lists",  kind: "currency"        },
  cities:         { coll: "items",  kind: "city"            },
  topVisited:     { coll: "lists",  kind: "top-visited"     },
  fastestGrowing: { coll: "lists",  kind: "fastest-growing" },
  largestGdp:     { coll: "lists",  kind: "largest-gdp"     },
  countries:      { coll: "items",  kind: "country"         },
  hotels:         { coll: "items",  kind: "hotel"           },
  gear:           { coll: "lists",  kind: "gear"            },
  news:           { coll: "lists",  kind: "news"            },
  trending:       { coll: "lists",  kind: "trending"        },
  facts:          { coll: "lists",  kind: "fact"            },
  videos:         { coll: "videos", kind: null              },
  scroller:       { coll: "media",  kind: "scroller"        },
} as const;

type Source = "mongo" | "seed";

export type WslPayloadWithMeta = WslPayload & {
  source: {
    overall: Source;
    sections: Partial<Record<keyof typeof SECTIONS, Source>>;
    dbName: string | null;
  };
};

// Fields we synthesise at fold time and don't want leaking to serialised
// client payloads (they're index-side scaffolding, not view data).
const STRIP_KEYS = ["_id", "app", "kind", "slug", "s3_key"] as const;

function stripSynthetic<T>(doc: Record<string, unknown>): T {
  const out = { ...doc };
  for (const k of STRIP_KEYS) delete out[k as string];
  return out as T;
}

async function readSection<T>(
  key: keyof typeof SECTIONS,
): Promise<T[] | null> {
  const db = await getMongoDb();
  if (!db) return null;
  const { coll, kind } = SECTIONS[key];
  try {
    const filter: Record<string, unknown> = { ...APP_FILTER };
    if (kind) filter.kind = kind;
    const docs = await db.collection(coll).find(filter).limit(500).toArray();
    if (!docs.length) return null;
    return docs.map((d) => stripSynthetic<T>(d as Record<string, unknown>));
  } catch {
    return null;
  }
}

export const getWslPayload = cache(async (): Promise<WslPayloadWithMeta> => {
  const sections: Partial<Record<keyof typeof SECTIONS, Source>> = {};
  const db = await getMongoDb();
  const dbName = db ? db.databaseName : null;

  const [
    tickers,
    currencies,
    cities,
    topVisited,
    fastestGrowing,
    largestGdp,
    countries,
    gear,
    news,
    trending,
    facts,
    videos,
    scroller,
  ] = await Promise.all([
    readSection<Ticker>("tickers"),
    readSection<Currency>("currencies"),
    readSection<City>("cities"),
    readSection<RankedCountry>("topVisited"),
    readSection<RankedCountry>("fastestGrowing"),
    readSection<RankedCountry>("largestGdp"),
    readSection<Country>("countries"),
    readSection<GearItem>("gear"),
    readSection<News>("news"),
    readSection<Trending>("trending"),
    readSection<Fact>("facts"),
    readSection<Video>("videos"),
    readSection<ScrollerChapter>("scroller"),
  ]);

  const pick = <T, K extends keyof typeof SECTIONS>(
    key: K,
    mongo: T[] | null,
    fallback: T[],
  ): T[] => {
    if (mongo && mongo.length) {
      sections[key] = "mongo";
      return mongo;
    }
    sections[key] = "seed";
    return fallback;
  };

  // Hotels are exposed to the UI as a map keyed by country id — different
  // shape, separate handling. Docs are stored flat in FLEET.items with a
  // `countryId` field carried through the fold.
  let hotels: Record<string, Hotel[]> = SEED.hotels;
  if (db) {
    try {
      const raw = await db
        .collection("items")
        .find({ ...APP_FILTER, kind: "hotel" })
        .limit(500)
        .toArray();
      if (raw.length) {
        const grouped: Record<string, Hotel[]> = {};
        for (const doc of raw) {
          const stripped = stripSynthetic<Hotel & { countryId?: string }>(
            doc as Record<string, unknown>,
          );
          const { countryId, ...rest } = stripped;
          const key = countryId ?? "default";
          (grouped[key] ??= []).push(rest as Hotel);
        }
        if (Object.keys(grouped).length) {
          hotels = grouped;
          sections.hotels = "mongo";
        }
      }
    } catch {
      /* fall through to seed */
    }
  }
  if (sections.hotels === undefined) sections.hotels = "seed";

  const anyMongo = Object.values(sections).some((s) => s === "mongo");

  return {
    epoch: SEED.epoch,
    tickers: pick("tickers", tickers, SEED.tickers),
    currencies: pick("currencies", currencies, SEED.currencies),
    cities: pick("cities", cities, SEED.cities),
    topVisited: pick("topVisited", topVisited, SEED.topVisited),
    fastestGrowing: pick("fastestGrowing", fastestGrowing, SEED.fastestGrowing),
    largestGdp: pick("largestGdp", largestGdp, SEED.largestGdp),
    countries: pick("countries", countries, SEED.countries),
    hotels,
    gear: pick("gear", gear, SEED.gear),
    feedTemplates: SEED.feedTemplates,
    feedCities: SEED.feedCities,
    facts: pick("facts", facts, SEED.facts),
    videos: pick("videos", videos, SEED.videos),
    news: pick("news", news, SEED.news),
    trending: pick("trending", trending, SEED.trending),
    scroller: pick("scroller", scroller, SEED.scroller),
    allCountries: SEED.allCountries,
    source: {
      overall: anyMongo ? "mongo" : "seed",
      sections,
      dbName,
    },
  };
});
