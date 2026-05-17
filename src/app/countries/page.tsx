import Link from "next/link";
import { getCountries } from "@/lib/wsl-data";

export const revalidate = 86400;

export default async function CountriesPage() {
  const { countries } = await getCountries();
  const regions = Array.from(new Set(countries.map((c) => c.region).filter(Boolean)));

  return (
    <div className="space-y-8 p-8">
      <header className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-zinc-500">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: "var(--app-accent)" }} />
          WSL · Countries
        </div>
        <h1 className="mt-3 text-4xl font-bold text-zinc-100">World Stats Live</h1>
        <p className="mt-2 text-zinc-400">
          {countries.length} countries · live from{" "}
          <a className="underline" href="https://restcountries.com" target="_blank" rel="noreferrer">restcountries.com</a>
        </p>
      </header>

      {regions.map((region) => {
        const items = countries.filter((c) => c.region === region);
        return (
          <section key={region} className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-100">{region} <span className="ml-2 text-xs text-zinc-500">{items.length}</span></h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((c) => (
                <Link key={c.cca3} href={`/countries/${c.cca3.toLowerCase()}`} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 transition-colors hover:border-zinc-700" style={{ borderLeftWidth: 3, borderLeftColor: "var(--app-accent)" }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{c.flag}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100">{c.name}</h3>
                      <p className="mt-0.5 text-[11px] text-zinc-500">{c.capital} · {c.population.toLocaleString()}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
