// Server-side helper for /compare — assembles the compact country list needed by
// the client picker + the flat stat rollup for each selected country.

import "server-only";
import { getAllCountries } from "@/lib/wsl-v2/country-stats";
import type { Country as RestCountry } from "@/lib/wsl-data";
import { getCountryStatsRollup } from "@/lib/wsl-v2/country-stats";
import type { CountryStat } from "@/lib/wsl-v2/country-stats";

export type PickerCountry = {
  cca3: string;
  name: string;
  flag: string;
  region: string;
  population: number;
};

export async function getPickerCountries(): Promise<PickerCountry[]> {
  const all = await getAllCountries();
  return all
    .map((c: RestCountry) => ({
      cca3: c.cca3,
      name: c.name,
      flag: c.flag,
      region: c.region,
      population: c.population,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export type CompareRow = {
  cca3: string;
  name: string;
  flag: string;
  stats: CountryStat[];
};

export async function getCompareRows(cca3s: string[]): Promise<CompareRow[]> {
  const rows: CompareRow[] = [];
  for (const cca3 of cca3s) {
    const rollup = await getCountryStatsRollup(cca3);
    if (!rollup) continue;
    rows.push({
      cca3: rollup.rest.cca3,
      name: rollup.rest.name,
      flag: rollup.rest.flag,
      stats: rollup.stats,
    });
  }
  return rows;
}
