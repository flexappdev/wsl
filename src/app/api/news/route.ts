import { NextResponse } from "next/server";
import { getMongoDb, isMongoConfigured, APP, APP_FILTER } from "@/lib/mongo";

export const runtime = "nodejs";
export const revalidate = 1800;

// FLEET migration (2026-07-09): news cache moved from AIDB.wsl_news to
// FLEET.lists with `{app:'wsl', kind:'news'}`. Each item is upserted by
// `slug = news-<pubDate>-<title-hash>` so the same headline from two feeds
// doesn't duplicate.

type NewsItem = {
  title: string;
  src: string;
  url?: string;
  pubDate: number;
  tag: "tourism" | "climate" | "pop" | "energy" | "world";
};

const FEEDS: Array<{ url: string; src: string; tag: NewsItem["tag"] }> = [
  { url: "https://feeds.reuters.com/reuters/worldNews", src: "Reuters", tag: "world" },
  { url: "https://www.noaa.gov/news-release/rss.xml", src: "NOAA", tag: "climate" },
  { url: "https://www.unwto.org/rss.xml", src: "UNWTO", tag: "tourism" },
];

const FRESH_MS = 30 * 60 * 1000;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function extractItems(xml: string, src: string, tag: NewsItem["tag"]): NewsItem[] {
  const out: NewsItem[] = [];
  const itemRe = /<item[^>]*>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(xml)) && out.length < 8) {
    const block = m[1];
    const title =
      (/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>/.exec(block)?.[1] ||
        /<title[^>]*>([\s\S]*?)<\/title>/.exec(block)?.[1] ||
        "").trim();
    const link =
      (/<link[^>]*>([\s\S]*?)<\/link>/.exec(block)?.[1] || "").trim();
    const date = (/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/.exec(block)?.[1] || "").trim();
    if (!title) continue;
    const t = Date.parse(date);
    out.push({ title, src, url: link, pubDate: Number.isFinite(t) ? t : Date.now(), tag });
  }
  return out;
}

async function fetchFeed(url: string, src: string, tag: NewsItem["tag"]): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "WSL/1.0 (+worldstatslive.org)" },
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return extractItems(xml, src, tag);
  } catch {
    return [];
  }
}

export async function GET() {
  const now = Date.now();

  // Try Mongo cache first
  if (isMongoConfigured()) {
    const db = await getMongoDb();
    if (db) {
      try {
        const cached = await db
          .collection<NewsItem & { fetchedAt: number }>("lists")
          .find({ ...APP_FILTER, kind: "news", fetchedAt: { $gt: now - FRESH_MS } })
          .sort({ pubDate: -1 })
          .limit(6)
          .toArray();
        if (cached.length) {
          return NextResponse.json(
            { items: cached.map(strip), mode: "cache", updatedAt: now },
            { headers: { "Cache-Control": "public, max-age=1800, s-maxage=1800" } },
          );
        }
      } catch {
        // fall through
      }
    }
  }

  // Live fetch
  const settled = await Promise.allSettled(FEEDS.map((f) => fetchFeed(f.url, f.src, f.tag)));
  const items = settled
    .filter((s): s is PromiseFulfilledResult<NewsItem[]> => s.status === "fulfilled")
    .flatMap((s) => s.value)
    .sort((a, b) => b.pubDate - a.pubDate)
    .slice(0, 6);

  // Best-effort write-through cache
  if (items.length && isMongoConfigured()) {
    const db = await getMongoDb();
    if (db) {
      try {
        const coll = db.collection("lists");
        // Prune stale wsl news rows only — never touch other apps' data.
        await coll.deleteMany({
          ...APP_FILTER,
          kind: "news",
          fetchedAt: { $lt: now - FRESH_MS * 4 },
        });
        // Upsert by slug so re-runs don't duplicate.
        const bulk = items.map((it) => {
          const slug = `news-${it.pubDate}-${slugify(it.title)}`;
          return {
            updateOne: {
              filter: { ...APP_FILTER, kind: "news", slug },
              update: {
                $set: {
                  app: APP,
                  kind: "news",
                  slug,
                  ...it,
                  fetchedAt: now,
                },
              },
              upsert: true,
            },
          };
        });
        if (bulk.length) await coll.bulkWrite(bulk);
      } catch {
        // ignore
      }
    }
  }

  return NextResponse.json(
    { items, mode: items.length ? "live" : "empty", updatedAt: now },
    { headers: { "Cache-Control": "public, max-age=1800, s-maxage=1800" } },
  );
}

// Strip Mongo `_id` + FLEET-synthetic keys before returning to the client.
function strip<T extends Record<string, unknown>>(doc: T): Omit<T, "_id" | "app" | "kind" | "slug"> {
  const { _id, app, kind, slug, ...rest } = doc as Record<string, unknown>;
  void _id;
  void app;
  void kind;
  void slug;
  return rest as Omit<T, "_id" | "app" | "kind" | "slug">;
}
