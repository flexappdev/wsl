// Server-side data source for the WSL v2 dashboard.
// Tries Mongo first; falls back to the static seed when Mongo is unset or empty.
// Each section is independent — partial Mongo data layers on top of the seed.
// React.cache memoizes per-request so layout + page fetches share one Mongo round-trip.

import { cache } from "react";
import { getMongoDb } from "@/lib/mongo";
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

// Collection names in AIDB (or whichever DB). All lookups are best-effort — if a
// collection doesn't exist or has zero docs, we return the seed slice instead.
const C = {
  tickers: "wsl_tickers",
  currencies: "wsl_currencies",
  cities: "wsl_cities",
  topVisited: "wsl_top_visited",
  fastestGrowing: "wsl_fastest_growing",
  largestGdp: "wsl_largest_gdp",
  countries: "wsl_countries",
  hotels: "wsl_hotels",
  gear: "wsl_gear",
  news: "wsl_news",
  trending: "wsl_trending",
  facts: "wsl_facts",
  videos: "wsl_videos",
  scroller: "wsl_scroller",
} as const;

type Source = "mongo" | "seed";

export type WslPayloadWithMeta = WslPayload & {
  source: {
    overall: Source;
    sections: Partial<Record<keyof typeof C, Source>>;
    dbName: string | null;
  };
};

async function readArray<T>(name: string): Promise<T[] | null> {
  const db = await getMongoDb();
  if (!db) return null;
  try {
    const docs = await db.collection(name).find({}).limit(500).toArray();
    if (!docs.length) return null;
    // Strip _id so it doesn't leak into client serializations.
    return docs.map(({ _id, ...rest }) => rest as T);
  } catch {
    return null;
  }
}

export const getWslPayload = cache(async (): Promise<WslPayloadWithMeta> => {
  const sections: Partial<Record<keyof typeof C, Source>> = {};
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
    readArray<Ticker>(C.tickers),
    readArray<Currency>(C.currencies),
    readArray<City>(C.cities),
    readArray<RankedCountry>(C.topVisited),
    readArray<RankedCountry>(C.fastestGrowing),
    readArray<RankedCountry>(C.largestGdp),
    readArray<Country>(C.countries),
    readArray<GearItem>(C.gear),
    readArray<News>(C.news),
    readArray<Trending>(C.trending),
    readArray<Fact>(C.facts),
    readArray<Video>(C.videos),
    readArray<ScrollerChapter>(C.scroller),
  ]);

  const pick = <T, K extends keyof typeof C>(key: K, mongo: T[] | null, fallback: T[]): T[] => {
    if (mongo && mongo.length) {
      sections[key] = "mongo";
      return mongo;
    }
    sections[key] = "seed";
    return fallback;
  };

  // Hotels are a map keyed by country id — different shape, separate handling.
  let hotels: Record<string, Hotel[]> = SEED.hotels;
  if (db) {
    try {
      const raw = await db
        .collection(C.hotels)
        .find({})
        .limit(500)
        .toArray();
      if (raw.length) {
        const grouped: Record<string, Hotel[]> = {};
        for (const doc of raw) {
          const { _id, countryId, ...rest } = doc as unknown as Hotel & { countryId?: string; _id: unknown };
          const key = countryId ?? "default";
          (grouped[key] ??= []).push(rest);
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
    source: {
      overall: anyMongo ? "mongo" : "seed",
      sections,
      dbName,
    },
  };
});
