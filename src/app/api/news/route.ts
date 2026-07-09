import { NextResponse } from "next/server";
import { getMongoDb, isMongoConfigured } from "@/lib/mongo";

export const runtime = "nodejs";
export const revalidate = 1800;

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
          .collection<NewsItem & { fetchedAt: number }>("wsl_news")
          .find({ fetchedAt: { $gt: now - FRESH_MS } })
          .sort({ pubDate: -1 })
          .limit(6)
          .toArray();
        if (cached.length) {
          return NextResponse.json(
            { items: cached.map(stripId), mode: "cache", updatedAt: now },
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
        const coll = db.collection("wsl_news");
        await coll.deleteMany({ fetchedAt: { $lt: now - FRESH_MS * 4 } });
        await coll.insertMany(items.map((it) => ({ ...it, fetchedAt: now })));
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

function stripId<T extends { _id?: unknown }>(doc: T): Omit<T, "_id"> {
  const { _id, ...rest } = doc;
  void _id;
  return rest;
}
