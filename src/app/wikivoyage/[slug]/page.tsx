import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin } from "lucide-react";
import { getWikivoyageBySlug, getWikivoyageDataset } from "@/lib/wikivoyage/data";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const ds = await getWikivoyageDataset();
  return ds.entries.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getWikivoyageBySlug(slug);
  if (!entry) return {};
  const desc = entry.extract.slice(0, 160).replace(/\n+/g, " ").trim();
  return {
    title: `${entry.title} Travel Guide · World Stats Live`,
    description: desc,
    openGraph: {
      title: `${entry.title} · World Stats Live`,
      description: desc,
      ...(entry.thumbnail ? { images: [{ url: entry.thumbnail }] } : {}),
    },
  };
}

export default async function WikivoyageSlugPage({ params }: Props) {
  const { slug } = await params;
  const entry = await getWikivoyageBySlug(slug);
  if (!entry) notFound();

  const paragraphs = entry.extract.split(/\n\n+/).filter(Boolean);

  return (
    <main className="page-content">
      <nav className="wv-back">
        <Link href="/wikivoyage" className="back-link">
          <ArrowLeft size={14} /> All countries
        </Link>
      </nav>

      <header className="wv-header">
        <span className="wv-flag">{entry.flag}</span>
        <div>
          <h1 className="wv-title">{entry.title}</h1>
          <p className="wv-region">{entry.region}</p>
        </div>
      </header>

      {entry.thumbnail && (
        <div className="wv-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={entry.thumbnail}
            alt={`${entry.title} landscape`}
            className="wv-hero-img"
            loading="eager"
          />
        </div>
      )}

      <div className="wv-meta-row">
        {entry.coordinates && (
          <span className="wv-coord">
            <MapPin size={13} />
            {entry.coordinates.lat.toFixed(2)}°, {entry.coordinates.lon.toFixed(2)}°
          </span>
        )}
        <a
          href={entry.wikivoyage_url}
          target="_blank"
          rel="noopener noreferrer"
          className="wv-source-link"
        >
          Wikivoyage <ExternalLink size={12} />
        </a>
      </div>

      <article className="wv-extract">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </article>

      <style>{`
        .wv-back { margin-bottom: 1.5rem; }
        .back-link { display: inline-flex; align-items: center; gap: 0.35rem;
          font-size: 0.85rem; color: var(--muted); text-decoration: none; }
        .back-link:hover { color: var(--accent, #10b981); }
        .wv-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
        .wv-flag { font-size: 3rem; line-height: 1; }
        .wv-title { font-size: 1.75rem; font-weight: 700; margin: 0 0 0.15rem; }
        .wv-region { color: var(--muted); font-size: 0.85rem; margin: 0; }
        .wv-hero { margin-bottom: 1.5rem; border-radius: 8px; overflow: hidden;
          max-height: 360px; background: var(--paper-2, #1a1a1a); }
        .wv-hero-img { width: 100%; height: 100%; object-fit: cover; display: block; max-height: 360px; }
        .wv-meta-row { display: flex; align-items: center; gap: 1.25rem;
          margin-bottom: 1.5rem; font-size: 0.82rem; color: var(--muted); }
        .wv-coord { display: inline-flex; align-items: center; gap: 0.25rem; }
        .wv-source-link { display: inline-flex; align-items: center; gap: 0.25rem;
          color: var(--accent, #10b981); text-decoration: none; margin-left: auto; }
        .wv-source-link:hover { text-decoration: underline; }
        .wv-extract { line-height: 1.75; max-width: 72ch; }
        .wv-extract p { margin: 0 0 1rem; color: var(--ink, #e5e5e5); }
      `}</style>
    </main>
  );
}
