// Pure types + helpers for travel videos — safe to import from client components.
// Server-only fetching lives in ./travel-videos.ts (which re-exports all of this).

export const CHANNEL_FALLBACK: TravelChannel = {
  handle: "@MatSiems",
  name: "Siems Production",
  id: "UCuCR4AsSaHOI3znW690cU8g",
  url: "https://www.youtube.com/@MatSiems",
};

export type TravelChannel = { handle: string; name: string; id: string; url: string };

export type TravelVideo = {
  id: string;
  slug: string;
  kind: "short" | "long";
  title: string;
  place: string;
  place_type: "city" | "country" | null;
  description: string;
  country: string;
  tags: string[];
  duration: number;
  youtube_id: string | null;
  youtube_url: string | null;
  published_at: string | null;
  status: "published" | "queued";
  video_url: string;
  poster_url: string;
  detail_url: string;
  wbp_url: string | null;
  source: string;
};

export type TravelSegment = { kicker: string; big: string; text: string };
export type TravelChapter = { t: string; label: string };

export type TravelVideoDetail = TravelVideo & {
  hook: string | null;
  segments: TravelSegment[];
  chapters: TravelChapter[];
  attribution: string | null;
};

export type TravelCatalog = {
  version: number;
  generated_at: string;
  channel: TravelChannel;
  count: number;
  published: number;
  videos: TravelVideo[];
};

/** Slim shape passed to client components (keeps RSC payload small). */
export type TravelCard = Pick<
  TravelVideo,
  "id" | "kind" | "title" | "place" | "country" | "duration" | "poster_url" | "status"
> & { onYouTube: boolean };

export function formatDuration(sec: number): string {
  const s = Math.max(0, Math.round(sec || 0));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export function isoDuration(sec: number): string {
  const s = Math.max(0, Math.round(sec || 0));
  const m = Math.floor(s / 60);
  return `PT${m ? `${m}M` : ""}${s % 60}S`;
}

/** "1:47" / "1:02:03" → seconds. */
export function chapterSeconds(t: string): number {
  return t
    .split(":")
    .map((p) => Number(p) || 0)
    .reduce((acc, n) => acc * 60 + n, 0);
}

export function subscribeUrl(channel: TravelChannel = CHANNEL_FALLBACK): string {
  return `${channel.url}?sub_confirmation=1`;
}
