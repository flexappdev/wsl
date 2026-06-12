/**
 * Ingest country travel articles for the WSL site.
 *
 *   npm run ingest:wikivoyage           — full ingest of all SEED.allCountries
 *   npm run ingest:wikivoyage -- --refresh  — bypass disk cache
 *   npm run ingest:wikivoyage -- --limit 10 — first N countries only (for smoke)
 *
 * Data flow:
 *   1. SEED.allCountries → Wikivoyage MediaWiki bulk-fetch (extract|pageimages|coordinates)
 *   2. For each country with empty Wikivoyage extract → Wikipedia REST summary fallback
 *   3. Write combined dataset to public/data/wikivoyage-countries.json
 *
 * Output: public/data/wikivoyage-countries.json (read by src/lib/wikivoyage/data.ts).
 *
 * Why public/data instead of Mongo: the AIDB Atlas cluster is at its 500-collection
 * cap (see project_mtd_v2_prodready memory). JSON snapshot ships with the build.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { SEED } from "../src/lib/wsl-v2/seed";
import { bulkFetchPages, fetchWikipediaSummary, slugify } from "../src/lib/wikivoyage/api";
import type { WikivoyageDataset, WikivoyageEntry } from "../src/lib/wikivoyage/types";

const refresh = process.argv.includes("--refresh");
const limitIdx = process.argv.indexOf("--limit");
const limit = limitIdx >= 0 ? Math.max(1, Number(process.argv[limitIdx + 1] ?? 0)) : 0;

// Override seed names that don't match Wikivoyage article titles.
const TITLE_OVERRIDES: Record<string, string> = {
  "United States": "United States of America",
  "Hong Kong": "Hong Kong",
  "Taiwan": "Taiwan",
  "Vatican": "Vatican City",
  "Czech Republic": "Czech Republic",
  "DR Congo": "Democratic Republic of the Congo",
  "Republic of Congo": "Republic of the Congo",
  "Ivory Coast": "Côte d'Ivoire",
  "Cape Verde": "Cape Verde",
  "Eswatini": "Eswatini",
  "Sao Tome": "São Tomé and Príncipe",
  "Sao Tome and Principe": "São Tomé and Príncipe",
  "São Tomé & Príncipe": "São Tomé and Príncipe",
  "St. Kitts & Nevis": "Saint Kitts and Nevis",
  "St. Vincent & Gr.": "Saint Vincent and the Grenadines",
  "Saint Lucia": "Saint Lucia",
  "Trinidad & Tobago": "Trinidad and Tobago",
  "Antigua & Barbuda": "Antigua and Barbuda",
  "Micronesia": "Federated States of Micronesia",
  "Timor-Leste": "East Timor",
  "Burma": "Myanmar",
  "Macedonia": "North Macedonia",
  // Wikipedia uses "The" prefix for these
  "Gambia": "The Gambia",
  "Bahamas": "The Bahamas",
  "Central African Rep.": "Central African Republic",
  "UAE": "United Arab Emirates",
  "UK": "United Kingdom",
  "South Korea": "South Korea",
  "North Korea": "North Korea",
  // Special chars
  "Curacao": "Curaçao",
  "Reunion": "Réunion",
};

// Wikipedia uses sometimes-different titles than Wikivoyage. Override per-country.
const WIKIPEDIA_TITLE_OVERRIDES: Record<string, string> = {
  ...TITLE_OVERRIDES,
  "DR Congo": "Democratic Republic of the Congo",
  "Republic of Congo": "Republic of the Congo",
  "Burma": "Myanmar",
  "East Timor": "Timor-Leste",
  "Vatican": "Vatican City",
  "Macedonia": "North Macedonia",
  "Central African Rep.": "Central African Republic",
};

function buildEntry(
  c: { name: string; region: string; code: string; flag: string },
  page: {
    title: string;
    pageid: number;
    extract?: string;
    thumbnail?: { source: string };
    original?: { source: string };
    coordinates?: { lat: number; lon: number };
  },
  source: "wikivoyage" | "wikipedia",
  url: string,
): WikivoyageEntry {
  return {
    slug: slugify(c.name),
    title: c.name,
    region: c.region,
    code: c.code,
    flag: c.flag,
    extract: page.extract ?? "",
    thumbnail: page.thumbnail?.source,
    original: page.original?.source,
    coordinates: page.coordinates,
    wikivoyage_url: url,
    pageid: page.pageid,
    source,
  };
}

async function main() {
  const all = SEED.allCountries;
  const slice = limit > 0 ? all.slice(0, limit) : all;
  console.log(`[ingest] requesting ${slice.length} country articles (refresh=${refresh})`);

  // Pass 1: Wikivoyage bulk fetch
  const titles = slice.map((c) => TITLE_OVERRIDES[c.name] ?? c.name);
  const pages = await bulkFetchPages(titles, { refresh });
  console.log(`[ingest] wikivoyage pages fetched: ${pages.length} / ${slice.length}`);

  const byTitle = new Map(pages.map((p) => [p.title.toLowerCase(), p]));
  const byOverride = new Map(
    Object.entries(TITLE_OVERRIDES).map(([friendly, wv]) => [
      friendly.toLowerCase(),
      byTitle.get(wv.toLowerCase()),
    ]),
  );

  const entries: WikivoyageEntry[] = [];
  const needFallback: typeof slice = [];

  for (const c of slice) {
    const page = byTitle.get(c.name.toLowerCase()) ?? byOverride.get(c.name.toLowerCase());
    if (page && page.extract && page.extract.length >= 120) {
      entries.push(buildEntry(c, page, "wikivoyage", page.wikivoyage_url));
    } else {
      needFallback.push(c);
    }
  }

  console.log(`[ingest] wikivoyage entries: ${entries.length}`);
  console.log(`[ingest] needing Wikipedia fallback: ${needFallback.length}`);

  // Pass 2: Wikipedia REST fallback
  let wpHits = 0;
  for (const c of needFallback) {
    const wpTitle = WIKIPEDIA_TITLE_OVERRIDES[c.name] ?? c.name;
    const summary = await fetchWikipediaSummary(wpTitle, { refresh });
    if (!summary) continue;
    entries.push(
      buildEntry(
        c,
        {
          title: summary.title,
          pageid: summary.pageid,
          extract: summary.extract,
          thumbnail: summary.thumbnail,
          original: summary.original,
          coordinates: summary.coordinates,
        },
        "wikipedia",
        summary.url,
      ),
    );
    wpHits += 1;
  }

  console.log(`[ingest] wikipedia fallback hits: ${wpHits} / ${needFallback.length}`);

  entries.sort((a, b) => a.title.localeCompare(b.title));

  const dataset: WikivoyageDataset = {
    generatedAt: new Date().toISOString(),
    count: entries.length,
    entries,
  };

  const outPath = path.resolve(process.cwd(), "public/data/wikivoyage-countries.json");
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(dataset, null, 2));
  const bytes = (await fs.stat(outPath)).size;
  const missingCount = slice.length - entries.length;
  const wvCount = entries.filter((e) => e.source === "wikivoyage").length;
  const wpCount = entries.filter((e) => e.source === "wikipedia").length;
  console.log(`[ingest] wrote ${outPath}`);
  console.log(
    `[ingest] total=${entries.length}  wikivoyage=${wvCount}  wikipedia=${wpCount}  missing=${missingCount}  size=${(bytes / 1024).toFixed(1)}KB`,
  );
  if (missingCount > 0) {
    const missingNames = slice.filter((c) => !entries.find((e) => e.slug === slugify(c.name))).map((c) => c.name);
    console.log(`[ingest] missing: ${missingNames.slice(0, 15).join(", ")}${missingNames.length > 15 ? " …" : ""}`);
  }
}

main().catch((err) => {
  console.error("[ingest] failed:", err);
  process.exit(1);
});
