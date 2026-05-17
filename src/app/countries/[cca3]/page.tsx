import Link from "next/link";
import { notFound } from "next/navigation";
import { getCountry } from "@/lib/wsl-data";

export const revalidate = 86400;

export default async function CountryPage({ params }: { params: Promise<{ cca3: string }> }) {
  const { cca3 } = await params;
  const c = await getCountry(cca3.toUpperCase());
  if (!c) notFound();

  const stats: Array<[string, string]> = [
    ["Official name", c.official],
    ["Capital", c.capital],
    ["Region", `${c.region}${c.subregion ? ` · ${c.subregion}` : ""}`],
    ["Population", c.population.toLocaleString()],
    ["Area (km²)", c.area.toLocaleString()],
    ["Languages", c.languages.join(", ") || "—"],
    ["Currencies", c.currencies.join(", ") || "—"],
  ];

  return (
    <div className="space-y-8 p-8">
      <header className="rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8">
        <Link href="/countries" className="text-[11px] uppercase tracking-wider text-zinc-500 hover:text-zinc-300">← all countries</Link>
        <div className="mt-3 flex items-center gap-4">
          {c.flagPng && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={c.flagPng} alt={`${c.name} flag`} className="h-16 w-24 rounded border border-zinc-700 object-cover" />
          )}
          <div>
            <h1 className="text-4xl font-bold text-zinc-100">{c.name}</h1>
            <p className="mt-1 text-zinc-400">{c.region}</p>
          </div>
        </div>
      </header>

      <section className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-6" style={{ borderLeftWidth: 3, borderLeftColor: "var(--app-accent)" }}>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {stats.map(([label, value]) => (
            <div key={label}>
              <dt className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</dt>
              <dd className="mt-0.5 text-sm text-zinc-100">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
