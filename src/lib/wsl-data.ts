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

export async function getCountries(): Promise<{ countries: Country[] }> {
  const url = "https://restcountries.com/v3.1/all?fields=name,cca3,capital,region,subregion,population,area,flag,flags,languages,currencies";
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return { countries: [] };
  const raw = (await res.json()) as Array<Record<string, unknown>>;
  const countries: Country[] = raw
    .map((c) => {
      const nameObj = c.name as { common?: string; official?: string } | undefined;
      const flagsObj = c.flags as { png?: string } | undefined;
      const languagesObj = (c.languages as Record<string, string> | undefined) ?? {};
      const currenciesObj = (c.currencies as Record<string, { name: string }> | undefined) ?? {};
      return {
        cca3: String(c.cca3 ?? ""),
        name: String(nameObj?.common ?? ""),
        official: String(nameObj?.official ?? ""),
        capital: ((c.capital as string[] | undefined) ?? [])[0] ?? "—",
        region: String(c.region ?? ""),
        subregion: String(c.subregion ?? ""),
        population: Number(c.population ?? 0),
        area: Number(c.area ?? 0),
        flag: String(c.flag ?? ""),
        flagPng: String(flagsObj?.png ?? ""),
        languages: Object.values(languagesObj),
        currencies: Object.values(currenciesObj).map((c) => c.name),
      };
    })
    .sort((a, b) => b.population - a.population);
  return { countries };
}

export async function getCountry(cca3: string): Promise<Country | null> {
  const url = `https://restcountries.com/v3.1/alpha/${encodeURIComponent(cca3)}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return null;
  const arr = (await res.json()) as Array<Record<string, unknown>>;
  const c = arr[0];
  if (!c) return null;
  const nameObj = c.name as { common?: string; official?: string } | undefined;
  const flagsObj = c.flags as { png?: string } | undefined;
  const languagesObj = (c.languages as Record<string, string> | undefined) ?? {};
  const currenciesObj = (c.currencies as Record<string, { name: string }> | undefined) ?? {};
  return {
    cca3: String(c.cca3 ?? ""),
    name: String(nameObj?.common ?? ""),
    official: String(nameObj?.official ?? ""),
    capital: ((c.capital as string[] | undefined) ?? [])[0] ?? "—",
    region: String(c.region ?? ""),
    subregion: String(c.subregion ?? ""),
    population: Number(c.population ?? 0),
    area: Number(c.area ?? 0),
    flag: String(c.flag ?? ""),
    flagPng: String(flagsObj?.png ?? ""),
    languages: Object.values(languagesObj),
    currencies: Object.values(currenciesObj).map((c) => c.name),
  };
}
