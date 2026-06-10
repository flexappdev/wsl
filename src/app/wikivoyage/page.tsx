import type { Metadata } from "next";
import Link from "next/link";
import { getWikivoyageByRegion } from "@/lib/wikivoyage/data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "World Travel Guide · World Stats Live",
  description:
    "Explore travel guides for countries across every region — extracted from Wikivoyage.",
  openGraph: {
    title: "World Travel Guide · World Stats Live",
    description: "Travel guides for every country, powered by Wikivoyage.",
  },
};

export default async function WikivoyagePage() {
  const byRegion = await getWikivoyageByRegion();
  const regions = Object.keys(byRegion).sort();
  const total = regions.reduce((n, r) => n + byRegion[r].length, 0);

  return (
    <main className="page-content">
      <header className="page-header">
        <h1 className="page-title">World Travel Guide</h1>
        <p className="page-subtitle">
          {total} countries · powered by{" "}
          <a
            href="https://en.wikivoyage.org"
            target="_blank"
            rel="noopener noreferrer"
            className="link-accent"
          >
            Wikivoyage
          </a>
        </p>
      </header>

      {total === 0 ? (
        <div className="empty-state">
          <p>Travel guide data not yet generated.</p>
          <p className="muted">
            Run <code>npm run ingest:wikivoyage</code> to populate.
          </p>
        </div>
      ) : (
        <div className="wv-regions">
          {regions.map((region) => (
            <section key={region} className="wv-region">
              <h2 className="wv-region-title">{region}</h2>
              <div className="wv-grid">
                {byRegion[region].map((entry) => (
                  <Link
                    key={entry.slug}
                    href={`/wikivoyage/${entry.slug}`}
                    className="wv-card"
                  >
                    <span className="wv-card-flag">{entry.flag}</span>
                    <span className="wv-card-name">{entry.title}</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <style>{`
        .page-header { margin-bottom: 2rem; }
        .page-title { font-size: 1.75rem; font-weight: 700; margin: 0 0 0.25rem; }
        .page-subtitle { color: var(--muted); font-size: 0.9rem; margin: 0; }
        .link-accent { color: var(--accent, #10b981); text-decoration: none; }
        .link-accent:hover { text-decoration: underline; }
        .empty-state { padding: 3rem 0; text-align: center; color: var(--muted); }
        .empty-state code { background: var(--paper-2, #1a1a1a); padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.85em; }
        .wv-regions { display: flex; flex-direction: column; gap: 2.5rem; }
        .wv-region-title { font-size: 1rem; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.06em; color: var(--accent, #10b981); margin: 0 0 0.75rem; }
        .wv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.5rem; }
        .wv-card { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem;
          border-radius: 6px; background: var(--paper-2, #1a1a1a); border: 1px solid var(--border, #2a2a2a);
          color: inherit; text-decoration: none; transition: border-color 0.15s, background 0.15s; }
        .wv-card:hover { border-color: var(--accent, #10b981); background: var(--paper-3, #222); }
        .wv-card-flag { font-size: 1.25rem; flex-shrink: 0; }
        .wv-card-name { font-size: 0.85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      `}</style>
    </main>
  );
}
