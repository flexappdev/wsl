/**
 * Ingest Wikivoyage country articles for the WSL site.
 *
 *   npm run ingest:wikivoyage           — full ingest of all SEED.allCountries
 *   npm run ingest:wikivoyage -- --refresh  — bypass disk cache
 *   npm run ingest:wikivoyage -- --limit 10 — first N countries only (for smoke)
 *
 * Output: public/data/wikivoyage-countries.json (read by src/lib/wikivoyage/data.ts).
 *
 * Why public/data instead of Mongo: the AIDB Atlas cluster is at its 500-collection
 * cap (see project_mtd_v2_prodready memory) so we can't open a new wsl_wikivoyage
 * collection right now. The JSON snapshot lives in the repo + ships with each
 * Vercel deploy, which is fine for ~200 stable country articles.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { SEED } from "../src/lib/wsl-v2/seed";
import { bulkFetchPages, slugify } from "../src/lib/wikivoyage/api";
import type { WikivoyageDataset, WikivoyageEntry } from "../src/lib/wikivoyage/types";

const refresh = process.argv.includes("--refresh");
const limitIdx = process.argv.indexOf("--limit");
const limit = limitIdx >= 0 ? Math.max(1, Number(process.argv[limitIdx + 1] ?? 0)) : 0;

// Some countries have non-trivial Wikivoyage titles. Override here.
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
  "St. Kitts & Nevis": "Saint Kitts and Nevis",
  "St. Vincent & Gr.": "Saint Vincent and the Grenadines",
  "Saint Lucia": "Saint Lucia",
  "Trinidad & Tobago": "Trinidad and Tobago",
  "Antigua & Barbuda": "Antigua and Barbuda",
  "Micronesia": "Federated States of Micronesia",
  "Timor-Leste": "East Timor",
  "Burma": "Myanmar",
  "Macedonia": "North Macedonia",
};

async function main() {
  const all = SEED.allCountries;
  const slice = limit > 0 ? all.slice(0, limit) : all;
  console.log(`[ingest-wikivoyage] requesting ${slice.length} country articles (refresh=${refresh})`);

  const titles = slice.map((c) => TITLE_OVERRIDES[c.name] ?? c.name);
  const pages = await bulkFetchPages(titles, { refresh });
  console.log(`[ingest-wikivoyage] fetched ${pages.length} / ${slice.length} pages`);

  // Index pages by title for join
  const byTitle = new Map(pages.map((p) => [p.title.toLowerCase(), p]));
  // Also index by the overridden title for the OVERRIDES set (so e.g. "United
  // States" can resolve to the "United States of America" Wikivoyage page).
  const byOverride = new Map(
    Object.entries(TITLE_OVERRIDES).map(([friendly, wv]) => [
      friendly.toLowerCase(),
      byTitle.get(wv.toLowerCase()),
    ]),
  );

  const entries: WikivoyageEntry[] = [];
  const missing: string[] = [];
  for (const c of slice) {
    const page = byTitle.get(c.name.toLowerCase()) ?? byOverride.get(c.name.toLowerCase());
    if (!page || !page.extract) {
      missing.push(c.name);
      continue;
    }
    entries.push({
      slug: slugify(c.name),
      title: c.name,
      region: c.region,
      code: c.code,
      flag: c.flag,
      extract: page.extract,
      thumbnail: page.thumbnail?.source,
      original: page.original?.source,
      coordinates: page.coordinates,
      wikivoyage_url: page.wikivoyage_url,
      pageid: page.pageid,
    });
  }

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
  console.log(`[ingest-wikivoyage] wrote ${outPath}`);
  console.log(`[ingest-wikivoyage] entries=${entries.length}  missing=${missing.length}  size=${(bytes / 1024).toFixed(1)}KB`);
  if (missing.length) {
    console.log(`[ingest-wikivoyage] missing titles: ${missing.slice(0, 10).join(", ")}${missing.length > 10 ? " …" : ""}`);
  }
}

main().catch((err) => {
  console.error("[ingest-wikivoyage] failed:", err);
  process.exit(1);
});
