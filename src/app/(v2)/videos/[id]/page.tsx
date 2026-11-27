import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronLeft, MapPin } from "lucide-react";
import { VideoPlayer } from "@/components/travel/VideoPlayer";
import { Attribution } from "@/components/travel/Attribution";
import { SubscribeCTA } from "@/components/travel/SubscribeCTA";
import { VideoRail } from "@/components/travel/ShortsRail";
import {
  formatDuration,
  getCatalog,
  getCountryLookup,
  getTravelVideos,
  getVideo,
  isoDuration,
  relatedVideos,
  toCard,
  CHANNEL_FALLBACK,
} from "@/lib/travel-videos";

export const revalidate = 900;
export const dynamicParams = true;

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  // Dynamic + ISR: pages render on first request and revalidate every 15 min.
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const v = await getVideo(id);
  if (!v) return { title: "Video not found" };
  const description = `${v.description || v.title} — ${v.kind === "long" ? "travel film" : "travel short"} about ${v.place}, ${v.country}.`;
  return {
    title: v.title,
    description,
    alternates: { canonical: `/videos/${v.id}` },
    openGraph: {
      type: "video.other",
      title: v.title,
      description,
      url: `/videos/${v.id}`,
      images: [{ url: v.poster_url, alt: v.title }],
      videos: v.youtube_id ? [{ url: `https://www.youtube.com/embed/${v.youtube_id}` }] : [{ url: v.video_url, type: "video/mp4" }],
    },
    twitter: { card: "summary_large_image", title: v.title, description, images: [v.poster_url] },
  };
}

export default async function VideoPage({ params }: Props) {
  const { id } = await params;
  const [v, all, catalog, lookup] = await Promise.all([getVideo(id), getTravelVideos(), getCatalog(), getCountryLookup()]);
  if (!v) notFound();

  const channel = catalog?.channel ?? CHANNEL_FALLBACK;
  const cca3 = lookup.toCca3(v.country);
  const flag = lookup.flagOf(v.country);
  const related = relatedVideos(v, all, 12);
  const sameCountryCount = all.filter((x) => x.country === v.country).length;
  const film = v.kind === "long";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: v.title,
    description: v.description || v.title,
    thumbnailUrl: [v.poster_url],
    uploadDate: v.published_at ?? catalog?.generated_at ?? new Date().toISOString(),
    duration: isoDuration(v.duration),
    contentUrl: v.video_url,
    ...(v.youtube_id ? { embedUrl: `https://www.youtube.com/embed/${v.youtube_id}` } : {}),
    contentLocation: { "@type": "Place", name: `${v.place}, ${v.country}` },
    author: { "@type": "Person", name: "Mat Siems", url: channel.url },
    publisher: { "@type": "Organization", name: channel.name, url: channel.url },
    license: "https://creativecommons.org/licenses/by-sa/4.0/",
    ...(v.chapters.length
      ? {
          hasPart: v.chapters.map((c) => ({
            "@type": "Clip",
            name: c.label,
            startOffset: c.t.split(":").reduce((a, n) => a * 60 + (Number(n) || 0), 0),
            url: v.youtube_url ?? undefined,
          })),
        }
      : {}),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="page-head" style={{ marginBottom: 14 }}>
        <div>
          <div className="crumb">
            <Link href="/videos" style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
              <ChevronLeft size={12} /> VIDEOS
            </Link>{" "}
            · {film ? "FILM" : "SHORT"} · {v.country.toUpperCase()}
          </div>
        </div>
      </div>

      <div className={"tv-page " + (film ? "film" : "short")}>
        <VideoPlayer
          youtubeId={v.youtube_id}
          videoUrl={v.video_url}
          posterUrl={v.poster_url}
          title={v.title}
          kind={v.kind}
          chapters={v.chapters}
        />

        <div className="tv-info">
          <div className="tv-chips">
            <span className={"badge " + (v.youtube_id ? "fail" : "live")}>{v.youtube_id ? "On YouTube" : "New"}</span>
            <span className="badge neutral">{formatDuration(v.duration)}</span>
            <span className="badge neutral">
              <MapPin size={11} /> {v.place}
            </span>
            <span className="badge neutral">
              {flag} {v.country}
            </span>
          </div>
          <h1>{v.title}</h1>
          {v.hook && !film && <p className="tv-hook">{v.hook}</p>}
          {v.description && <p className="desc">{v.description}</p>}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {cca3 && (
              <Link href={`/countries/${cca3}`} className="btn btn-primary btn-sm">
                {flag} {v.country} — stats &amp; {sameCountryCount} video{sameCountryCount === 1 ? "" : "s"}
              </Link>
            )}
            {v.wbp_url && (
              <a href={v.wbp_url} className="btn btn-secondary btn-sm" target="_blank" rel="noreferrer">
                {v.place} guide <ArrowUpRight size={12} />
              </a>
            )}
            {v.youtube_url && (
              <a href={v.youtube_url} className="btn btn-secondary btn-sm" target="_blank" rel="noreferrer">
                Watch on YouTube <ArrowUpRight size={12} />
              </a>
            )}
          </div>

          {v.segments.length > 0 && (
            <>
              <div className="type-eyebrow" style={{ display: "block", margin: "6px 0 10px" }}>
                IN THIS VIDEO
              </div>
              <div className="tv-segs">
                {v.segments.map((s, i) => (
                  <div key={i} className="tv-seg-card">
                    <div className="k">{s.kicker}</div>
                    <div className="b">{s.big}</div>
                    <div className="x">{s.text}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {film && v.chapters.length > 0 && (
            <p style={{ fontSize: 12, color: "var(--foreground-muted)", marginTop: 12 }}>
              {v.chapters.length} chapters — tap a timestamp under the player to jump.
            </p>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="section">
          <div className="section-head">
            <div>
              <h2>More from {v.country}</h2>
              <div className="sub">Same country first, then other destinations.</div>
            </div>
            <div className="right">
              <Link href={`/videos?country=${encodeURIComponent(v.country)}`} className="btn btn-ghost btn-sm">
                All {v.country} videos
              </Link>
            </div>
          </div>
          <VideoRail cards={related.map(toCard)} />
        </div>
      )}

      <div className="section">
        <SubscribeCTA channel={channel} count={all.length} />
      </div>

      <Attribution text={v.attribution} place={v.place} />
    </div>
  );
}
