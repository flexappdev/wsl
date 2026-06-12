// MediaWiki bulk-fetch helpers for Wikivoyage.
// Adapted from ~/APPS/lituk/src/lib/wikivoyage.ts (UK pass) and stripped to
// the two primitives WSL needs: list a category, bulk-fetch pages.
//
// API contract: 50 titles per call, 1200px thumbnails, intro extract, coords.

import { promises as fs } from "node:fs";
import path from "node:path";

const API_BASE = "https://en.wikivoyage.org/w/api.php";
const USER_AGENT =
  process.env.MEDIAWIKI_USER_AGENT ?? "WSL/1.0 (mat@cleverfox-ai.com)";

const CACHE_DIR = path.resolve(process.cwd(), ".cache/wikivoyage");

export type CategoryMember = {
  title: string;
  pageid: number;
  ns?: number;
  type?: "page" | "subcat" | "file";
};

export type BulkPage = {
  title: string;
  pageid: number;
  extract?: string;
  thumbnail?: { source: string; width: number; height: number };
  original?: { source: string; width: number; height: number };
  coordinates?: { lat: number; lon: number };
  wikivoyage_url: string;
  cached?: boolean;
};

async function readCache<T>(file: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(path.join(CACHE_DIR, file), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeCache(file: string, data: unknown): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(path.join(CACHE_DIR, file), JSON.stringify(data, null, 2));
  } catch {
    // best-effort
  }
}

async function apiFetch<T>(params: Record<string, string>): Promise<T | null> {
  const url = `${API_BASE}?${new URLSearchParams({
    ...params,
    format: "json",
    formatversion: "2",
    origin: "*",
  })}`;
  let attempt = 0;
  while (attempt < 4) {
    try {
      const r = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, accept: "application/json" },
      });
      if (r.status === 429) {
        await new Promise((res) => setTimeout(res, 1000 * 2 ** attempt));
        attempt += 1;
        continue;
      }
      if (!r.ok) return null;
      return (await r.json()) as T;
    } catch {
      attempt += 1;
      await new Promise((res) => setTimeout(res, 500 * 2 ** attempt));
    }
  }
  return null;
}

type CategoryMembersResponse = {
  query?: { categorymembers?: CategoryMember[] };
  continue?: { cmcontinue?: string };
};

export async function listCategoryMembers(
  category: string,
  {
    limit = 500,
    refresh = false,
    types = "page|subcat",
  }: { limit?: number; refresh?: boolean; types?: string } = {},
): Promise<CategoryMember[]> {
  const cacheFile = `category__${category.replace(/[^a-z0-9-]+/gi, "_").toLowerCase()}__${types}.json`;
  if (!refresh) {
    const cached = await readCache<CategoryMember[]>(cacheFile);
    if (cached) return cached;
  }
  const members: CategoryMember[] = [];
  let cmcontinue: string | undefined;
  let pages = 0;
  do {
    const params: Record<string, string> = {
      action: "query",
      list: "categorymembers",
      cmtitle: category.startsWith("Category:") ? category : `Category:${category}`,
      cmlimit: String(limit),
      cmtype: types,
    };
    if (cmcontinue) params.cmcontinue = cmcontinue;
    const r = await apiFetch<CategoryMembersResponse>(params);
    if (!r) break;
    const batch = r.query?.categorymembers ?? [];
    members.push(...batch);
    cmcontinue = r.continue?.cmcontinue;
    pages += 1;
    if (pages > 50) break;
  } while (cmcontinue);
  await writeCache(cacheFile, members);
  return members;
}

type BulkPagesResponse = {
  query?: {
    pages?: Array<{
      title: string;
      pageid: number;
      extract?: string;
      thumbnail?: { source: string; width: number; height: number };
      original?: { source: string; width: number; height: number };
      coordinates?: Array<{ lat: number; lon: number; primary?: boolean }>;
      missing?: boolean;
    }>;
  };
};

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function bulkFetchPages(
  titles: string[],
  { refresh = false }: { refresh?: boolean } = {},
): Promise<BulkPage[]> {
  if (titles.length === 0) return [];
  const out: BulkPage[] = [];
  const toFetch: string[] = [];
  for (const t of titles) {
    const cacheFile = `page__${t.replace(/[^a-z0-9-]+/gi, "_").slice(0, 80).toLowerCase()}.json`;
    if (!refresh) {
      const cached = await readCache<BulkPage>(cacheFile);
      if (cached) {
        out.push({ ...cached, cached: true });
        continue;
      }
    }
    toFetch.push(t);
  }
  for (const batch of chunk(toFetch, 50)) {
    const r = await apiFetch<BulkPagesResponse>({
      action: "query",
      prop: "extracts|pageimages|coordinates",
      exintro: "1",
      explaintext: "1",
      piprop: "thumbnail|original",
      pithumbsize: "1200",
      coprop: "type|name|country",
      colimit: "1",
      titles: batch.join("|"),
    });
    if (!r?.query?.pages) continue;
    for (const p of r.query.pages) {
      if (p.missing) continue;
      const page: BulkPage = {
        title: p.title,
        pageid: p.pageid,
        extract: p.extract,
        thumbnail: p.thumbnail,
        original: p.original,
        coordinates: p.coordinates?.[0]
          ? { lat: p.coordinates[0].lat, lon: p.coordinates[0].lon }
          : undefined,
        wikivoyage_url: `https://en.wikivoyage.org/wiki/${encodeURIComponent(p.title.replace(/ /g, "_"))}`,
      };
      out.push(page);
      const cacheFile = `page__${p.title.replace(/[^a-z0-9-]+/gi, "_").slice(0, 80).toLowerCase()}.json`;
      await writeCache(cacheFile, page);
    }
  }
  return out;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

// Wikipedia REST summary — fallback when Wikivoyage extract is empty.
// Pattern from ~/APPS/wikai/lib/wiki.ts.
const WIKIPEDIA_SUMMARY = "https://en.wikipedia.org/api/rest_v1/page/summary/";
const MIN_EXTRACT_LEN = 120;

export type WikipediaSummary = {
  title: string;
  pageid: number;
  extract: string;
  thumbnail?: { source: string; width: number; height: number };
  original?: { source: string; width: number; height: number };
  coordinates?: { lat: number; lon: number };
  url: string;
};

export async function fetchWikipediaSummary(
  title: string,
  { refresh = false }: { refresh?: boolean } = {},
): Promise<WikipediaSummary | null> {
  const cacheFile = `wp__${title.replace(/[^a-z0-9-]+/gi, "_").slice(0, 80).toLowerCase()}.json`;
  if (!refresh) {
    const cached = await readCache<WikipediaSummary>(cacheFile);
    if (cached) return cached;
  }
  const url = WIKIPEDIA_SUMMARY + encodeURIComponent(title.replace(/ /g, "_"));
  let attempt = 0;
  while (attempt < 2) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const r = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, accept: "application/json" },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!r.ok) {
        attempt += 1;
        continue;
      }
      const j = (await r.json()) as {
        title?: string;
        pageid?: number;
        extract?: string;
        thumbnail?: { source: string; width: number; height: number };
        originalimage?: { source: string; width: number; height: number };
        coordinates?: { lat: number; lon: number };
        content_urls?: { desktop?: { page?: string } };
      };
      if (!j.extract || j.extract.length < MIN_EXTRACT_LEN) return null;
      const summary: WikipediaSummary = {
        title: j.title ?? title,
        pageid: j.pageid ?? 0,
        extract: j.extract,
        thumbnail: j.thumbnail,
        original: j.originalimage,
        coordinates: j.coordinates,
        url: j.content_urls?.desktop?.page ??
          `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
      };
      await writeCache(cacheFile, summary);
      return summary;
    } catch {
      attempt += 1;
    }
  }
  return null;
}
