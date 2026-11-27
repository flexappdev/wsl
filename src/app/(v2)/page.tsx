import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronRight } from "lucide-react";
import { Hero } from "@/components/wsl-v2/Hero";
import { Ticker } from "@/components/wsl-v2/Ticker";
import { CurrencyStrip } from "@/components/wsl-v2/CurrencyStrip";
import { TopList } from "@/components/wsl-v2/TopList";
import { RightNowFeed } from "@/components/wsl-v2/RightNowFeed";
import { RandomFact } from "@/components/wsl-v2/RandomFact";
import { AboutStrip } from "@/components/wsl-v2/AboutStrip";
import { LatestNews } from "@/components/wsl-v2/LatestNews";
import { getWslPayload } from "@/lib/wsl-v2/dataSource";
import { VideoPlayer } from "@/components/travel/VideoPlayer";
import { VideoRail } from "@/components/travel/ShortsRail";
import { CountriesOnVideo } from "@/components/travel/CountriesOnVideo";
import { SubscribeCTA } from "@/components/travel/SubscribeCTA";
import {
  getCatalog,
  getTravelVideos,
  groupByCountry,
  pickFeatured,
  shortsOf,
  filmsOf,
  toCard,
  countryHref,
  CHANNEL_FALLBACK,
} from "@/lib/travel-videos";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "World stats, live",
  description:
    "The planet's most-watched indicators, updated in real time. Population, climate, tourism, energy and the economy — one console.",
  openGraph: {
    title: "World Stats Live — the planet's vital signs",
    description: "Live world indicators in one console.",
  },
};

const DASHBOARD_TICKER_IDS = ["flights", "co2", "tourism", "hotels"] as const;

export default async function DashboardPage() {
  const [payload, catalog, videos] = await Promise.all([getWslPayload(), getCatalog(), getTravelVideos()]);
  const channel = catalog?.channel ?? CHANNEL_FALLBACK;
  const onVideo = await groupByCountry(videos);
  const featuredVideo = pickFeatured(videos);
  const featuredCountry = featuredVideo ? onVideo.find((c) => c.country === featuredVideo.country) : undefined;
  const shortsRail = shortsOf(videos).slice(0, 18).map(toCard);
  const filmCards = filmsOf(videos).filter((v) => v.id !== featuredVideo?.id).map(toCard);
  const countryRails = onVideo.slice(0, 3);
  const tickers = DASHBOARD_TICKER_IDS.map((id) => payload.tickers.find((t) => t.id === id)).filter(
    (t): t is NonNullable<typeof t> => Boolean(t)
  );
  const popTicker = payload.tickers.find((t) => t.id === "population");
  const featured = payload.countries.find((c) => c.featured) ?? payload.countries[0];

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumb">DASHBOARD · LIVE</div>
          <h1>World stats, live.</h1>
          <div className="sub">
            The planet&apos;s most-watched indicators, updated in real time. Population, climate, tourism, energy and the economy
            — one console.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="source-pill">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)" }} />
            {payload.source.overall === "mongo" ? `mongo · ${payload.source.dbName}` : "seed data"}
          </span>
        </div>
      </div>

      {featuredVideo && (
        <>
          <div className="tv-hero" style={{ marginBottom: 18 }}>
            <VideoPlayer
              youtubeId={featuredVideo.youtube_id}
              videoUrl={featuredVideo.video_url}
              posterUrl={featuredVideo.poster_url}
              title={featuredVideo.title}
              kind={featuredVideo.kind === "long" ? "long" : "short"}
            />
            <div className="tv-hero-body">
              <div className="type-eyebrow">
                {featuredVideo.kind === "long" ? "FEATURED FILM" : "LATEST VIDEO"} · {featuredVideo.country.toUpperCase()}
              </div>
              <h2>{featuredVideo.title}</h2>
              {featuredVideo.description && <p>{featuredVideo.description}</p>}
              <div className="tv-stats">
                <div>
                  <b>{videos.length}</b>videos
                </div>
                <div>
                  <b>{onVideo.length}</b>countries
                </div>
                <div>
                  <b>{filmsOf(videos).length}</b>films
                </div>
              </div>
              <div className="row">
                <Link href={`/videos/${featuredVideo.id}`} className="btn btn-primary btn-sm">
                  Watch with chapters <ArrowRight size={12} />
                </Link>
                {featuredCountry && (
                  <Link href={countryHref(featuredCountry)} className="btn btn-secondary btn-sm">
                    {featuredCountry.flag} {featuredCountry.country} stats
                  </Link>
                )}
                <Link href="/videos" className="btn btn-ghost btn-sm">
                  Watch all {videos.length} <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </div>

          <div className="section" style={{ marginTop: 0 }}>
            <div className="section-head">
              <div>
                <h2>Shorts from around the world</h2>
                <div className="sub">50-second destination portraits. Tap one to watch.</div>
              </div>
              <div className="right">
                <Link href="/videos?kind=short" className="btn btn-ghost btn-sm">
                  All shorts <ChevronRight size={12} />
                </Link>
              </div>
            </div>
            <VideoRail cards={shortsRail} />
          </div>

          <div className="section">
            <div className="section-head">
              <div>
                <h2>Countries on video</h2>
                <div className="sub">
                  {onVideo.length} countries, ranked by how many videos they have. Each one opens its stats page with the videos.
                </div>
              </div>
              <div className="right">
                <Link href="/countries" className="btn btn-ghost btn-sm">
                  All countries <ChevronRight size={12} />
                </Link>
              </div>
            </div>
            <CountriesOnVideo countries={onVideo} limit={12} />
          </div>
        </>
      )}

      <div className={featuredVideo ? "section" : undefined}>
      <Hero tickers={payload.tickers} cities={payload.cities} epoch={payload.epoch} />

      <div className="ticker-grid" style={{ marginTop: 18 }}>
        {tickers.map((t) => (
          <Ticker key={t.id} ticker={t} epoch={payload.epoch} />
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        <CurrencyStrip currencies={payload.currencies} />
      </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Right now in the world</h2>
            <div className="sub">A rolling feed of what just happened, anywhere.</div>
          </div>
          <div className="right">
            <span className="source-pill">
              <span className="live-pip" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--success)", display: "inline-block" }} />
              LIVE
            </span>
          </div>
        </div>
        <div className="row-2">
          <RightNowFeed
            templates={payload.feedTemplates}
            cities={payload.feedCities}
            popTicker={popTicker}
            epoch={payload.epoch}
          />
          <RandomFact facts={payload.facts} />
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Top of the world</h2>
            <div className="sub">Where people are going, who&apos;s growing fastest, who runs the economy.</div>
          </div>
        </div>
        <div className="row-3">
          <TopList title="Most-visited countries" sub="2024 · international arrivals" data={payload.topVisited.slice(0, 8)} barColor="var(--ws-lists)" />
          <TopList title="Fastest-growing destinations" sub="YoY · 2025 Q1" data={payload.fastestGrowing} barColor="var(--ws-travel)" />
          <TopList title="Largest economies" sub="GDP nominal · 2024" data={payload.largestGdp} barColor="var(--ws-bo)" />
        </div>
      </div>

      {filmCards.length > 0 && (
        <div className="section">
          <div className="section-head">
            <div>
              <h2>Long films</h2>
              <div className="sub">Eight-minute destination guides with chapters.</div>
            </div>
            <div className="right">
              <Link href="/videos?kind=long" className="btn btn-ghost btn-sm">
                All films <ChevronRight size={12} />
              </Link>
            </div>
          </div>
          <VideoRail cards={filmCards} />
        </div>
      )}

      {countryRails.map((c) => (
        <div className="section" key={c.country}>
          <div className="section-head">
            <div>
              <h2>
                {c.flag} {c.country} on video
              </h2>
              <div className="sub">
                {c.videos.length} videos · {c.films ? `${c.films} film${c.films === 1 ? "" : "s"} · ` : ""}
                {c.shorts} shorts
              </div>
            </div>
            <div className="right">
              <Link href={countryHref(c)} className="btn btn-ghost btn-sm">
                {c.country} stats &amp; videos <ChevronRight size={12} />
              </Link>
            </div>
          </div>
          <VideoRail cards={c.videos.slice(0, 14).map(toCard)} showCountry={false} />
        </div>
      ))}

      {featured && (
        <div className="section">
          <div className="section-head">
            <div>
              <h2>Featured destination</h2>
              <div className="sub">The fastest-growing tourist destination in North Africa.</div>
            </div>
            <div className="right">
              <Link href="/destinations" className="btn btn-secondary btn-sm">
                Open {featured.name} <ChevronRight size={12} />
              </Link>
            </div>
          </div>
          <div
            className="feat-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: 16,
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, oklch(0.42 0.13 55), oklch(0.18 0.04 30))",
                padding: 28,
                position: "relative",
                minHeight: 280,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <div style={{ position: "absolute", top: 22, right: 22, fontSize: 48 }}>{featured.flag}</div>
              <div className="type-eyebrow" style={{ color: "rgba(255,255,255,0.7)" }}>
                {featured.region}
              </div>
              <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.02em", color: "white", marginTop: 6 }}>{featured.name}</div>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13.5, maxWidth: 420, marginTop: 10, lineHeight: 1.5 }}>
                {featured.blurb}
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <Link href="/destinations" className="btn btn-primary btn-sm">
                  Explore <ArrowRight size={12} />
                </Link>
              </div>
            </div>
            <div style={{ padding: 22 }}>
              <div className="type-eyebrow" style={{ display: "block", marginBottom: 10 }}>AT A GLANCE</div>
              <div className="facts-table">
                {[
                  ["Capital", featured.capital],
                  ["Currency", featured.currency],
                  ["Languages", featured.langs],
                  ["Population", featured.pop.toLocaleString()],
                  ["GDP (nominal)", featured.gdp],
                  ["Visitors / yr", featured.visitors],
                ].map(([k, v], i, arr) => (
                  <div
                    key={i}
                    className="facts-row"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}
                  >
                    <span className="k">{k}</span>
                    <span className="v">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="section">
        <div className="section-head">
          <div>
            <h2>Latest</h2>
            <div className="sub">From the macro &amp; tourism desks.</div>
          </div>
          <div className="right">
            <a className="link" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--foreground-muted)" }}>
              all stories <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
        <LatestNews />
      </div>

      <div className="section">
        <SubscribeCTA channel={channel} count={videos.length || undefined} />
      </div>

      <AboutStrip />
    </div>
  );
}
