import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCountries, getCountryStatsRollup } from "@/lib/wsl-v2/country-stats";
import { getCatalog, getVideosForCountry, toCard, CHANNEL_FALLBACK } from "@/lib/travel-videos";
import { VideoPlayer } from "@/components/travel/VideoPlayer";
import { VideoCard } from "@/components/travel/VideoCard";
import { SubscribeCTA } from "@/components/travel/SubscribeCTA";

export const revalidate = 900;

type Props = { params: Promise<{ cca3: string }> };

export async function generateStaticParams() {
  const all = await getAllCountries();
  return all.map((c) => ({ cca3: c.cca3.toUpperCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cca3 } = await params;
  const rollup = await getCountryStatsRollup(cca3.toUpperCase());
  if (!rollup) return {};
  const { rest, wikivoyage } = rollup;
  const desc = wikivoyage?.extract
    ? wikivoyage.extract.slice(0, 160).replace(/\n+/g, " ").trim()
    : `${rest.name} country profile — capital ${rest.capital}, population ${rest.population.toLocaleString()}, area ${rest.area.toLocaleString()} km², region ${rest.region}.`;
  const heroUrl = wikivoyage?.s3_hero
    ? `https://com27.s3.eu-west-2.amazonaws.com/wsl/heroes/${wikivoyage.slug}.jpg`
    : rest.flagPng;
  return {
    title: `${rest.name} · Country Profile`,
    description: desc,
    openGraph: {
      title: `${rest.name} · World Stats Live`,
      description: desc,
      ...(heroUrl ? { images: [{ url: heroUrl }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${rest.name} · World Stats Live`,
      description: desc,
      ...(heroUrl ? { images: [heroUrl] } : {}),
    },
  };
}

export default async function CountryPage({ params }: Props) {
  const { cca3 } = await params;
  const rollup = await getCountryStatsRollup(cca3.toUpperCase());
  if (!rollup) notFound();
  const { rest, wikivoyage, stats } = rollup;
  const [videos, catalog] = await Promise.all([getVideosForCountry(rest.cca3), getCatalog()]);
  const leadFilm = videos.find((v) => v.kind === "long");
  const shorts = videos.filter((v) => v.kind === "short");
  const films = videos.filter((v) => v.kind === "long" && v !== leadFilm);

  const heroUrl = wikivoyage?.s3_hero
    ? `https://com27.s3.eu-west-2.amazonaws.com/wsl/heroes/${wikivoyage.slug}.jpg`
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Country",
    name: rest.name,
    alternateName: rest.official,
    identifier: rest.cca3,
    address: {
      "@type": "PostalAddress",
      addressCountry: rest.cca3,
      addressLocality: rest.capital,
      addressRegion: rest.region,
    },
    ...(heroUrl && { image: heroUrl }),
    ...(wikivoyage?.wikivoyage_url && { sameAs: wikivoyage.wikivoyage_url }),
  };

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 relative overflow-hidden">
        {heroUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={heroUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
        )}
        <div className="relative">
          <Link href="/countries" className="text-[11px] uppercase tracking-wider text-zinc-500 hover:text-zinc-300">
            ← all countries
          </Link>
          <div className="mt-3 flex items-center gap-4">
            {rest.flagPng && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={rest.flagPng}
                alt={`${rest.name} flag`}
                className="h-16 w-24 rounded border border-zinc-700 object-cover"
              />
            )}
            <div>
              <h1 className="text-4xl font-bold text-zinc-100">{rest.name}</h1>
              <p className="mt-1 text-zinc-400">
                {rest.official}
                {rest.region && ` · ${rest.region}`}
              </p>
              {videos.length > 0 && (
                <a href="#videos" className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-red-600/90 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600">
                  ▶ {videos.length} video{videos.length === 1 ? "" : "s"} from {rest.name}
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <section
        className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-6"
        style={{ borderLeftWidth: 3, borderLeftColor: "var(--app-accent, #10b981)" }}
      >
        <h2 className="text-[11px] uppercase tracking-wider text-zinc-500 mb-4">Country stats</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="min-w-0">
              <dt className="text-[11px] uppercase tracking-wider text-zinc-500">{s.label}</dt>
              <dd className="mt-0.5 text-sm text-zinc-100 truncate">
                {s.href ? (
                  <Link href={s.href} className="hover:underline">
                    {s.value}
                    {s.raw && s.raw !== s.value && (
                      <span className="ml-1.5 text-xs text-zinc-500">{s.raw}</span>
                    )}
                  </Link>
                ) : (
                  <>
                    {s.value}
                    {s.raw && s.raw !== s.value && (
                      <span className="ml-1.5 text-xs text-zinc-500">{s.raw}</span>
                    )}
                  </>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {videos.length > 0 && (
        <section id="videos" className="space-y-4" style={{ scrollMarginTop: 16 }}>
          <div className="section-head" style={{ marginBottom: 0 }}>
            <div>
              <h2>{rest.name} on video</h2>
              <div className="sub">
                {shorts.length} short{shorts.length === 1 ? "" : "s"}
                {leadFilm || films.length ? ` · ${films.length + (leadFilm ? 1 : 0)} film${films.length + (leadFilm ? 1 : 0) === 1 ? "" : "s"}` : ""} from{" "}
                {(catalog?.channel ?? CHANNEL_FALLBACK).handle}
              </div>
            </div>
            <div className="right">
              <Link href={`/videos?country=${encodeURIComponent(videos[0].country)}`} className="btn btn-ghost btn-sm">
                Browse all →
              </Link>
            </div>
          </div>
          {leadFilm && (
            <div className="tv-hero">
              <VideoPlayer
                youtubeId={leadFilm.youtube_id}
                videoUrl={leadFilm.video_url}
                posterUrl={leadFilm.poster_url}
                title={leadFilm.title}
                kind="long"
              />
              <div className="tv-hero-body">
                <div className="type-eyebrow">FEATURED FILM · {leadFilm.place.toUpperCase()}</div>
                <h2>{leadFilm.title}</h2>
                {leadFilm.description && <p>{leadFilm.description}</p>}
                <div className="row">
                  <Link href={`/videos/${leadFilm.id}`} className="btn btn-primary btn-sm">
                    Chapters &amp; credits →
                  </Link>
                </div>
              </div>
            </div>
          )}
          {films.length > 0 && (
            <div className="tv-grid films">
              {films.map((v) => (
                <VideoCard key={v.id} card={toCard(v)} />
              ))}
            </div>
          )}
          {shorts.length > 0 && (
            <div className="tv-grid shorts">
              {shorts.map((v) => (
                <VideoCard key={v.id} card={toCard(v)} showCountry={false} />
              ))}
            </div>
          )}
          <SubscribeCTA channel={catalog?.channel ?? CHANNEL_FALLBACK} />
        </section>
      )}

      {wikivoyage?.extract && (
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-6">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-[11px] uppercase tracking-wider text-zinc-500">Travel guide</h2>
            <Link
              href={`/wikivoyage/${wikivoyage.slug}`}
              className="text-xs text-zinc-400 hover:text-emerald-400"
            >
              full guide →
            </Link>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {wikivoyage.extract.split(/\n\n+/)[0].slice(0, 500)}
            {wikivoyage.extract.length > 500 && "…"}
          </p>
        </section>
      )}

      <nav className="flex flex-wrap gap-2 text-xs">
        <Link href="/countries" className="rounded border border-zinc-700 px-3 py-1.5 text-zinc-300 hover:border-zinc-500">
          All countries
        </Link>
        <Link href="/videos" className="rounded border border-zinc-700 px-3 py-1.5 text-zinc-300 hover:border-zinc-500">
          Videos
        </Link>
        <Link href="/destinations" className="rounded border border-zinc-700 px-3 py-1.5 text-zinc-300 hover:border-zinc-500">
          Destinations
        </Link>
        <Link href="/population" className="rounded border border-zinc-700 px-3 py-1.5 text-zinc-300 hover:border-zinc-500">
          Population
        </Link>
        <Link href="/gdp" className="rounded border border-zinc-700 px-3 py-1.5 text-zinc-300 hover:border-zinc-500">
          GDP
        </Link>
        <Link href="/climate" className="rounded border border-zinc-700 px-3 py-1.5 text-zinc-300 hover:border-zinc-500">
          Climate
        </Link>
        <Link href="/tourism" className="rounded border border-zinc-700 px-3 py-1.5 text-zinc-300 hover:border-zinc-500">
          Tourism
        </Link>
      </nav>
    </div>
  );
}
