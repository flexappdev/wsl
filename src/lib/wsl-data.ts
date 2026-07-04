export type Country = {
  cca3: string;
  name: string;
  official: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  area: number;
  flag: string;
  flagPng: string;
  languages: string[];
  currencies: string[];
};

// Source: mledoze/countries — same dataset restcountries.com was originally built from,
// bundled at build time. restcountries.com v3.1 was deprecated 2026-Q2; the response now
// returns a JSON error object instead of an array. mledoze is a stable community mirror.
const MLEDOZE_URL =
  "https://raw.githubusercontent.com/mledoze/countries/master/dist/countries.json";

type MledozeCountry = {
  name: { common: string; official: string };
  cca2: string;
  cca3: string;
  capital?: string[];
  region: string;
  subregion?: string;
  population: number;
  area: number;
  flag: string;
  flags?: { png?: string; svg?: string };
  languages?: Record<string, string>;
  currencies?: Record<string, { name: string; symbol?: string }>;
};

function mapMledoze(c: MledozeCountry): Country {
  return {
    cca3: c.cca3 ?? "",
    name: c.name?.common ?? "",
    official: c.name?.official ?? "",
    capital: c.capital?.[0] ?? "—",
    region: c.region ?? "",
    subregion: c.subregion ?? "",
    population: Number(c.population ?? 0),
    area: Number(c.area ?? 0),
    flag: c.flag ?? "",
    flagPng: c.flags?.png ?? "",
    languages: Object.values(c.languages ?? {}),
    currencies: Object.values(c.currencies ?? {}).map((cur) => cur.name),
  };
}

export async function getCountries(): Promise<{ countries: Country[] }> {
  const res = await fetch(MLEDOZE_URL, { next: { revalidate: 86400 } });
  if (!res.ok) return { countries: [] };
  const parsed = await res.json();
  const raw = Array.isArray(parsed) ? (parsed as MledozeCountry[]) : [];
  const countries = raw.map(mapMledoze).sort((a, b) => b.population - a.population);
  return { countries };
}

export async function getCountry(cca3: string): Promise<Country | null> {
  const { countries } = await getCountries();
  const match = countries.find((c) => c.cca3.toUpperCase() === cca3.toUpperCase());
  return match ?? null;
}
