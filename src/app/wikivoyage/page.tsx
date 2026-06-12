import type { Metadata } from "next";
import Link from "next/link";
import { getWikivoyageByRegion } from "@/lib/wikivoyage/data";
import NewsletterForm from "@/components/NewsletterForm";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "World Travel Guide · World Stats Live",
  description:
    "Explore travel guides for every country, grouped by region. Powered by Wikivoyage and Wikipedia, with editorial hero images.",
  openGraph: {
    title: "World Travel Guide · World Stats Live",
    description: "Travel guides for every country.",
  },
};

// Each Wikivoyage region maps to one of the 5 continent video loops generated
// by scripts/generate-wikivoyage-region-loops.mjs (s3://com27/wsl/regions/<id>.mp4).
const REGION_TO_CONTINENT: Record<string, string> = {
  "North Africa": "africa", "West Africa": "africa", "East Africa": "africa",
  "Central Africa": "africa", "Southern Africa": "africa",
  "Western Asia": "asia", "South Asia": "asia", "Southeast Asia": "asia",
  "East Asia": "asia", "Central Asia": "asia",
  "Western Europe": "europe", "Eastern Europe": "europe", "Northern Europe": "europe",
  "Southern Europe": "europe", "Balkans": "europe",
  "North America": "americas", "Central America": "americas",
  "South America": "americas", "Caribbean": "americas",
  "Oceania": "oceania",
};
const VIDEO_URL_BASE = "https://com27.s3.eu-west-2.amazonaws.com/wsl/regions";

// Group sub-regions by continent for display
const CONTINENT_ORDER = ["Africa", "Asia", "Europe", "Americas", "Oceania"];
const CONTINENT_LABELS: Record<string, string> = {
  africa: "Africa", asia: "Asia", europe: "Europe", americas: "Americas", oceania: "Oceania",
};

export default async function WikivoyagePage() {
  const byRegion = await getWikivoyageByRegion();
  const total = Object.values(byRegion).reduce((n, r) => n + r.length, 0);

  // Group regions by continent
  const byContinent: Record<string, { region: string; entries: typeof byRegion[string] }[]> = {};
  for (const region of Object.keys(byRegion)) {
    const continent = REGION_TO_CONTINENT[region] ?? "other";
    (byContinent[continent] ??= []).push({ region, entries: byRegion[region] });
  }
  for (const k of Object.keys(byContinent)) {
    byContinent[k].sort((a, b) => a.region.localeCompare(b.region));
  }

  const orderedContinents = CONTINENT_ORDER.map((label) => label.toLowerCase()).filter(
    (id) => byContinent[id]?.length,
  );

  return (
    <main className="page-content">
      <header className="page-header">
        <h1 className="page-title">World Travel Guide</h1>
        <p className="page-subtitle">
          {total} countries · {orderedContinents.length} continents · powered by{" "}
          <a href="https://en.wikivoyage.org" target="_blank" rel="noopener noreferrer" className="link-accent">
            Wikivoyage
          </a>{" "}
          +{" "}
          <a href="https://en.wikipedia.org" target="_blank" rel="noopener noreferrer" className="link-accent">
            Wikipedia
          </a>
        </p>
      </header>

      {total === 0 ? (
        <div className="empty-state">
          <p>Travel guide data not yet generated.</p>
          <p className="muted">Run <code>npm run ingest:wikivoyage</code> to populate.</p>
        </div>
      ) : (
        <div className="wv-continents">
          {orderedContinents.map((continentId) => (
            <section key={continentId} className="wv-continent">
              <div className="wv-continent-hero">
                <video
                  className="wv-loop"
                  src={`${VIDEO_URL_BASE}/${continentId}.mp4`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
                <div className="wv-continent-overlay">
                  <h2 className="wv-continent-title">{CONTINENT_LABELS[continentId]}</h2>
                  <p className="wv-continent-meta">
                    {byContinent[continentId].reduce((n, r) => n + r.entries.length, 0)} countries
                  </p>
                </div>
              </div>
              {byContinent[continentId].map(({ region, entries }) => (
                <div key={region} className="wv-region">
                  <h3 className="wv-region-title">{region}</h3>
                  <div className="wv-grid">
                    {entries.map((entry) => (
                      <Link key={entry.slug} href={`/wikivoyage/${entry.slug}`} className="wv-card">
                        <span className="wv-card-flag">{entry.flag}</span>
                        <span className="wv-card-name">{entry.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}

      <section className="wv-newsletter">
        <h2 className="wv-newsletter-title">Travel briefings, twice a month</h2>
        <p className="wv-newsletter-sub">
          New country guides, photo essays and tourism trends — straight to your inbox.
        </p>
        <NewsletterForm source="wikivoyage" />
      </section>

      <style>{`
        .page-header { margin-bottom: 2rem; }
        .page-title { font-size: 1.75rem; font-weight: 700; margin: 0 0 0.25rem; }
        .page-subtitle { color: var(--muted); font-size: 0.9rem; margin: 0; }
        .link-accent { color: var(--accent, #10b981); text-decoration: none; }
        .link-accent:hover { text-decoration: underline; }
        .empty-state { padding: 3rem 0; text-align: center; color: var(--muted); }
        .empty-state code { background: var(--paper-2, #1a1a1a); padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.85em; }
        .wv-continents { display: flex; flex-direction: column; gap: 3rem; }
        .wv-continent { display: flex; flex-direction: column; gap: 1.5rem; }
        .wv-continent-hero { position: relative; border-radius: 10px; overflow: hidden; height: 220px;
          background: var(--paper-2, #1a1a1a); border: 1px solid var(--border, #2a2a2a); }
        .wv-loop { width: 100%; height: 100%; object-fit: cover; display: block; }
        .wv-continent-overlay { position: absolute; inset: 0; display: flex; flex-direction: column;
          align-items: flex-start; justify-content: flex-end; padding: 1.25rem 1.5rem;
          background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%); }
        .wv-continent-title { color: white; font-size: 2.25rem; font-weight: 700; margin: 0;
          text-shadow: 0 2px 12px rgba(0,0,0,0.5); }
        .wv-continent-meta { color: rgba(255,255,255,0.85); font-size: 0.85rem;
          margin: 0.25rem 0 0; text-shadow: 0 1px 4px rgba(0,0,0,0.5); }
        .wv-region-title { font-size: 0.9rem; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.06em; color: var(--accent, #10b981); margin: 0 0 0.6rem; }
        .wv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.5rem; }
        .wv-card { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem;
          border-radius: 6px; background: var(--paper-2, #1a1a1a); border: 1px solid var(--border, #2a2a2a);
          color: inherit; text-decoration: none; transition: border-color 0.15s, background 0.15s; }
        .wv-card:hover { border-color: var(--accent, #10b981); background: var(--paper-3, #222); }
        .wv-card-flag { font-size: 1.25rem; flex-shrink: 0; }
        .wv-card-name { font-size: 0.85rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .wv-newsletter { margin-top: 3.5rem; padding: 2rem; border-radius: 10px;
          background: var(--paper-2, #1a1a1a); border: 1px solid var(--border, #2a2a2a); text-align: center; }
        .wv-newsletter-title { font-size: 1.25rem; font-weight: 600; margin: 0 0 0.35rem;
          color: var(--accent, #10b981); }
        .wv-newsletter-sub { color: var(--muted); font-size: 0.9rem; margin: 0 0 1.25rem;
          max-width: 48ch; margin-inline: auto; }
      `}</style>
    </main>
  );
}
