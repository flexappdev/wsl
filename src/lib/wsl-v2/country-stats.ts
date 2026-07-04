// Per-country stat rollup used by /countries/[cca3] SSG pages.
// Composes: restcountries.com bulk (population/area/languages/etc.) + SEED rankings
// (topVisited/fastestGrowing/largestGdp) + inline rankings.ts (emitters/renewables/airports)
// + wikivoyage snapshot cross-link.

import { SEED } from "./seed";
import type { Country as RestCountry } from "@/lib/wsl-data";
import { getCountries } from "@/lib/wsl-data";
import {
  TOP_EMITTERS,
  RENEWABLES_SHARE,
  TOP_AIRPORTS,
  findRank,
  nameToCca3,
} from "./rankings";
import { getWikivoyageDataset } from "@/lib/wikivoyage/data";
import type { WikivoyageEntry } from "@/lib/wikivoyage/types";

export type CountryStat = {
  label: string;
  value: string;
  raw?: string;
  rank?: number;
  href?: string;
};

export type CountryStatsRollup = {
  rest: RestCountry;
  wikivoyage?: WikivoyageEntry;
  stats: CountryStat[];
};

// restcountries bulk cache — single fetch shared by generateStaticParams + per-page reads.
// Next.js fetch cache dedupes with `next.revalidate`, but we belt-and-braces with a module cache.
let _bulkCache: Promise<RestCountry[]> | null = null;
export async function getAllCountries(): Promise<RestCountry[]> {
  if (!_bulkCache) {
    _bulkCache = getCountries().then((r) => r.countries);
  }
  return _bulkCache;
}

export async function getCountryByCca3(cca3: string): Promise<RestCountry | undefined> {
  const all = await getAllCountries();
  return all.find((c) => c.cca3.toUpperCase() === cca3.toUpperCase());
}

function formatArea(km2: number): string {
  if (!km2) return "—";
  if (km2 >= 1_000_000) return `${(km2 / 1_000_000).toFixed(2)}M km²`;
  return `${km2.toLocaleString()} km²`;
}

function formatPopulation(n: number): string {
  if (!n) return "—";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toLocaleString();
}

/** Population rank among all UN members (from restcountries payload). */
async function populationRank(cca3: string): Promise<number | undefined> {
  const all = await getAllCountries();
  const sorted = [...all].sort((a, b) => b.population - a.population);
  const idx = sorted.findIndex((c) => c.cca3.toUpperCase() === cca3.toUpperCase());
  return idx >= 0 ? idx + 1 : undefined;
}

export async function getCountryStatsRollup(cca3: string): Promise<CountryStatsRollup | null> {
  const rest = await getCountryByCca3(cca3);
  if (!rest) return null;

  // Wikivoyage cross-link — snapshot has flag+title but not cca3. Match by name.
  const wvDataset = await getWikivoyageDataset();
  const wv = wvDataset.entries.find(
    (e) => e.title === rest.name || nameToCca3(e.title) === rest.cca3,
  );

  // Rankings — do all lookups by name (with alias normalisation).
  const popRank = await populationRank(rest.cca3);
  const emitRank = findRank(TOP_EMITTERS, rest.name);
  const renRank = findRank(RENEWABLES_SHARE, rest.name);
  const visitorsRank = findRank(SEED.topVisited, rest.name);
  const growingRank = findRank(SEED.fastestGrowing, rest.name);
  const gdpRank = findRank(SEED.largestGdp, rest.name);
  const airportRow = TOP_AIRPORTS.find((a) => a.flag === rest.flag);

  const stats: CountryStat[] = [
    { label: "Population", value: formatPopulation(rest.population), raw: rest.population.toLocaleString(), rank: popRank, href: "/population" },
    { label: "Area",       value: formatArea(rest.area) },
    { label: "Capital",    value: rest.capital },
    { label: "Region",     value: `${rest.region}${rest.subregion ? ` · ${rest.subregion}` : ""}` },
    { label: "Currencies", value: rest.currencies.join(", ") || "—" },
    { label: "Languages",  value: rest.languages.join(", ") || "—" },
  ];

  if (gdpRank) stats.push({ label: "GDP rank",         value: `#${gdpRank.rank}`, raw: gdpRank.raw, rank: gdpRank.rank, href: "/gdp" });
  if (emitRank) stats.push({ label: "CO₂ emitter rank", value: `#${emitRank.rank}`, raw: emitRank.raw, rank: emitRank.rank, href: "/climate" });
  if (renRank) stats.push({ label: "Renewables share",  value: renRank.raw, rank: renRank.rank, href: "/climate" });
  if (visitorsRank) stats.push({ label: "Tourists / year", value: visitorsRank.raw, rank: visitorsRank.rank, href: "/tourism" });
  if (growingRank) stats.push({ label: "Tourism growth",  value: growingRank.raw, rank: growingRank.rank, href: "/tourism" });
  if (airportRow) stats.push({ label: "Top airport",      value: airportRow.name.replace(/^.*·\s*/, ""), raw: airportRow.raw, href: "/tourism" });

  return { rest, wikivoyage: wv, stats };
}
