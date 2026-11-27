// Travel videos from Mat's @MatSiems YouTube channel ("Siems Production").
//
// Data contract (shared across six fleet sites — consume only, never change):
//   catalog.json  → { version, generated_at, channel, count, published, videos[] }
//   detail_url    → same fields + hook, segments[], chapters[], attribution
//
// WSL is a country-stats site, so it shows EVERY video and organises them by
// country (catalog `country` name → ISO cca3 via the mledoze dataset the
// /countries pages already use).
//
// Failure mode: any fetch error returns null/[] so pages hide their video
// sections instead of throwing (the catalog can 404/403 while uploads land).

import { getAllCountries } from "@/lib/wsl-v2/country-stats";
import { CHANNEL_FALLBACK, type TravelCard, type TravelCatalog, type TravelVideo, type TravelVideoDetail } from "./travel-videos-shared";

export * from "./travel-videos-shared";

export const TRAVEL_CATALOG_URL =
  process.env.TRAVEL_CATALOG_URL ?? "https://com27.s3.eu-west-2.amazonaws.com/mstravel/catalog.json";

/** Optional override for detail JSON (dev only): `${base}/${id}.json`. */
const TRAVEL_DETAIL_BASE_URL = process.env.TRAVEL_DETAIL_BASE_URL;

export const TRAVEL_REVALIDATE = 900;

export type CountryVideos = {
  country: string;
  cca3: string | null;
  flag: string;
  videos: TravelVideo[];
  shorts: number;
  films: number;
};

// ---------------------------------------------------------------- fetching

export async function getCatalog(): Promise<TravelCatalog | null> {
  try {
    const res = await fetch(TRAVEL_CATALOG_URL, { next: { revalidate: TRAVEL_REVALIDATE } });
    if (!res.ok) return null;
    const json = (await res.json()) as Partial<TravelCatalog>;
    if (!json || !Array.isArray(json.videos)) return null;
    return {
      version: json.version ?? 1,
      generated_at: json.generated_at ?? new Date().toISOString(),
      channel: json.channel ?? CHANNEL_FALLBACK,
      count: json.count ?? json.videos.length,
      published: json.published ?? 0,
      videos: json.videos.filter(isValidVideo),
    };
  } catch {
    return null;
  }
}

function isValidVideo(v: unknown): v is TravelVideo {
  const o = v as TravelVideo;
  return Boolean(o && typeof o.id === "string" && typeof o.title === "string" && typeof o.video_url === "string");
}

/** WSL filter: every video in the catalog (country-stats site covers the world). */
export function filterForSite(videos: TravelVideo[]): TravelVideo[] {
  return videos;
}

/** All site videos, newest published first, then catalog order. */
export async function getTravelVideos(): Promise<TravelVideo[]> {
  const cat = await getCatalog();
  if (!cat) return [];
  return sortNewest(filterForSite(cat.videos));
}

export async function getVideo(id: string): Promise<TravelVideoDetail | null> {
  const videos = await getTravelVideos();
  const base = videos.find((v) => v.id === id);
  if (!base) return null;
  const empty: TravelVideoDetail = { ...base, hook: null, segments: [], chapters: [], attribution: null };
  const url = TRAVEL_DETAIL_BASE_URL ? `${TRAVEL_DETAIL_BASE_URL.replace(/\/$/, "")}/${id}.json` : base.detail_url;
  if (!url) return empty;
  try {
    const res = await fetch(url, { next: { revalidate: TRAVEL_REVALIDATE } });
    if (!res.ok) return empty;
    const d = (await res.json()) as Partial<TravelVideoDetail>;
    return {
      ...empty,
      // Catalog wins for publish state (youtube_id flips there first).
      ...d,
      youtube_id: base.youtube_id ?? d.youtube_id ?? null,
      youtube_url: base.youtube_url ?? d.youtube_url ?? null,
      published_at: base.published_at ?? d.published_at ?? null,
      status: base.status,
      hook: d.hook ?? null,
      segments: Array.isArray(d.segments) ? d.segments : [],
      chapters: Array.isArray(d.chapters) ? d.chapters : [],
      attribution: typeof d.attribution === "string" ? d.attribution : null,
    };
  } catch {
    return empty;
  }
}

// ---------------------------------------------------------------- helpers

export function sortNewest(videos: TravelVideo[]): TravelVideo[] {
  return videos
    .map((v, i) => ({ v, i }))
    .sort((a, b) => {
      const pa = a.v.published_at ? Date.parse(a.v.published_at) : 0;
      const pb = b.v.published_at ? Date.parse(b.v.published_at) : 0;
      if (pa !== pb) return pb - pa;
      return a.i - b.i;
    })
    .map((x) => x.v);
}

export const shortsOf = (videos: TravelVideo[]) => videos.filter((v) => v.kind === "short");
export const filmsOf = (videos: TravelVideo[]) => videos.filter((v) => v.kind === "long");

/** Featured hero: newest published film → newest published video → first film → first video. */
export function pickFeatured(videos: TravelVideo[]): TravelVideo | null {
  const pub = videos.filter((v) => v.youtube_id);
  return filmsOf(pub)[0] ?? pub[0] ?? filmsOf(videos)[0] ?? videos[0] ?? null;
}

export function relatedVideos(video: TravelVideo, all: TravelVideo[], limit = 8): TravelVideo[] {
  const others = all.filter((v) => v.id !== video.id);
  const sameCountry = others.filter((v) => v.country === video.country);
  const rest = others.filter((v) => v.country !== video.country && v.kind === video.kind);
  return [...sameCountry, ...rest].slice(0, limit);
}

export function toCard(v: TravelVideo): TravelCard {
  return {
    id: v.id,
    kind: v.kind,
    title: v.title,
    place: v.place,
    country: v.country,
    duration: v.duration,
    poster_url: v.poster_url,
    status: v.status,
    onYouTube: Boolean(v.youtube_id),
  };
}



// ---------------------------------------------------------------- countries

// Catalog names that differ from mledoze `name.common`.
const COUNTRY_ALIASES: Record<string, string> = {
  "Czech Republic": "CZE",
  "Saint Helena": "SHN",
  Turkey: "TUR",
};

type CountryLookup = { toCca3: (name: string) => string | null; flagOf: (name: string) => string; nameOf: (cca3: string) => string | null };

export async function getCountryLookup(): Promise<CountryLookup> {
  let all: Awaited<ReturnType<typeof getAllCountries>> = [];
  try {
    all = await getAllCountries();
  } catch {
    all = [];
  }
  const byName = new Map(all.map((c) => [c.name.toLowerCase(), c]));
  const byCca3 = new Map(all.map((c) => [c.cca3.toUpperCase(), c]));
  const find = (name: string) => {
    const alias = COUNTRY_ALIASES[name];
    if (alias) return byCca3.get(alias);
    return byName.get(name.toLowerCase());
  };
  return {
    toCca3: (name) => find(name)?.cca3.toUpperCase() ?? null,
    flagOf: (name) => find(name)?.flag ?? "🌍",
    nameOf: (cca3) => byCca3.get(cca3.toUpperCase())?.name ?? null,
  };
}

/** Countries ranked by video count (desc), each with its videos. */
export async function groupByCountry(videos: TravelVideo[]): Promise<CountryVideos[]> {
  const lookup = await getCountryLookup();
  const map = new Map<string, TravelVideo[]>();
  for (const v of videos) {
    const key = v.country || "Unknown";
    map.set(key, [...(map.get(key) ?? []), v]);
  }
  return [...map.entries()]
    .map(([country, vids]) => ({
      country,
      cca3: lookup.toCca3(country),
      flag: lookup.flagOf(country),
      videos: vids,
      shorts: vids.filter((v) => v.kind === "short").length,
      films: vids.filter((v) => v.kind === "long").length,
    }))
    .sort((a, b) => b.videos.length - a.videos.length || a.country.localeCompare(b.country));
}

/** Videos for one country page (by ISO cca3). */
export async function getVideosForCountry(cca3: string): Promise<TravelVideo[]> {
  const videos = await getTravelVideos();
  if (!videos.length) return [];
  const lookup = await getCountryLookup();
  const code = cca3.toUpperCase();
  const vids = videos.filter((v) => lookup.toCca3(v.country) === code);
  // Films first, then shorts.
  return [...filmsOf(vids), ...shortsOf(vids)];
}

export function countryHref(c: Pick<CountryVideos, "cca3" | "country">): string {
  return c.cca3 ? `/countries/${c.cca3}#videos` : `/videos?country=${encodeURIComponent(c.country)}`;
}


