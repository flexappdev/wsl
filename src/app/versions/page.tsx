import Link from "next/link";
import { GitCommit, ExternalLink, Tag } from "lucide-react";
import pkg from "../../../package.json";

export const metadata = {
  title: "Version history · WSL",
  description: "World Stats Live release notes.",
};

export const dynamic = "force-static";

type Release = {
  version: string;
  date: string;
  headline: string;
  commit?: string;
  bullets: string[];
};

const ACCENT = "#10b981";
const REPO = "flexappdev/wsl";

const RELEASES: Release[] = [
  {
    version: "4.0.0",
    date: "2026-07-20",
    commit: "247f13a",
    headline: "FLEET migration — 14 wsl_* collections consolidated",
    bullets: [
      "Migrated from 14 wsl_* AIDB collections to shared FLEET database",
      "All runtime reads/writes routed through FLEET.{items,lists,media,videos} with {app:'wsl'}",
      "Legacy collections drained; cluster capacity freed",
    ],
  },
  {
    version: "3.0.0",
    date: "2026-07-15",
    commit: "6cc80cb",
    headline: "V3 — kill seed mode · honest feeds · share/embed · ArtefaiPass gate",
    bullets: [
      "Kill seed mode — /stats and /countries render live FLEET data (no seed fallback)",
      "Honest feeds: /random and /explore surface only enriched items",
      "Share/embed cards per country with OG images + copy-embed snippet",
      "ArtefaiPass gate for premium data-export routes",
    ],
  },
  {
    version: "2.5.0",
    date: "2026-07-08",
    commit: "8bc335c",
    headline: "8 topic hubs + 250 SSG countries + compare + map",
    bullets: [
      "8 topic hubs: population, GDP, land area, life expectancy, HDI, climate, defence, demographics",
      "250 SSG country pages with full stats table + related-countries rail",
      "/compare — side-by-side comparison of any two countries",
      "/map — global Leaflet map with population choropleth",
      "Data export CSV/JSON gated behind ArtefaiPass",
    ],
  },
  {
    version: "2.4.0",
    date: "2026-06-30",
    commit: "60ad329",
    headline: "Full Wikivoyage atlas — 198 countries · FLUX heroes · video loops",
    bullets: [
      "198-country Wikivoyage atlas (full global coverage)",
      "FLUX heroes per country landing page",
      "Seedance video loops on 30 tentpole countries",
      "OG cards per country auto-generated",
    ],
  },
  {
    version: "2.3.0",
    date: "2026-06-15",
    commit: "efb6138",
    headline: "Wikivoyage ingest scaffold + bar-chart favicon",
    bullets: [
      "Wikivoyage ingest script + lib primitives",
      "Bar-chart favicon on emerald green (icon.svg)",
      "/bo/diagrams admin page — 6 editorial codebase diagrams",
    ],
  },
  {
    version: "2.1.0",
    date: "2026-06-08",
    commit: "78bfd3a",
    headline: "GA4 activation — G-31XHJMFQXY",
    bullets: [
      "GA4 wrapper + activation via /abc-ga sync",
      "3× measurement ID confirmed in served HTML on wsl-phi.vercel.app",
      "Registry live_url updated to phi over stale zeta",
    ],
  },
  {
    version: "2.0.0",
    date: "2026-05-24",
    commit: "3e743c4",
    headline: "V2 — prod-readiness · Mongo · /bo shell",
    bullets: [
      "Prod-readiness pass: per-route metadata, robots, sitemap, error/404 boundaries",
      "5 section pages filled out + login form locked down",
      "ClientShell + search palette + tweaks panel + population curve + /random",
      "Mongo + /bo backoffice shell",
      "Fleet primitives adopted: MonetisationFooter + SEO trio + /api/newsletter",
      "First Vercel deploy → wsl-phi.vercel.app",
    ],
  },
];

export default function VersionsPage() {
  return (
    <div className="px-6 py-12 max-w-3xl mx-auto space-y-10">
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-zinc-500 font-mono">
          <Tag className="h-3.5 w-3.5" style={{ color: ACCENT }} />
          WSL · Version history
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">v{pkg.version}</h1>
        <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
          Every release of World Stats Live with a short summary of what shipped. Newest first.
          Source of truth:{" "}
          <a
            href={`https://github.com/${REPO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:underline"
            style={{ color: ACCENT }}
          >
            {REPO}
            <ExternalLink className="h-3 w-3" />
          </a>
          .
        </p>
      </header>

      <ol className="space-y-8">
        {RELEASES.map((r) => (
          <li
            key={r.version}
            className="relative rounded-lg border p-5"
            style={{ borderLeftWidth: 3, borderLeftColor: ACCENT }}
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-2xl font-semibold">v{r.version}</h2>
              <time className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                {r.date}
              </time>
            </div>
            <p className="mt-1 text-sm">{r.headline}</p>
            {r.commit && (
              <a
                href={`https://github.com/${REPO}/commit/${r.commit}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-mono hover:underline"
                title="View commit on GitHub"
                style={{ color: ACCENT }}
              >
                <GitCommit className="h-3 w-3" />
                {r.commit}
              </a>
            )}
            <ul className="mt-4 space-y-1.5">
              {r.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span
                    className="mt-2 h-1 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: ACCENT }}
                  />
                  <span className="leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <footer className="pt-6 border-t flex items-center justify-between text-xs text-muted-foreground">
        <Link href="/" className="hover:underline">← Back to home</Link>
        <Link href="/bo/diagrams" className="hover:underline">Architecture diagrams →</Link>
      </footer>
    </div>
  );
}
