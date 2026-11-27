import Link from "next/link";
import { getCountries } from "@/lib/wsl-data";
import { getTravelVideos, groupByCountry } from "@/lib/travel-videos";
import { CountriesOnVideo } from "@/components/travel/CountriesOnVideo";

export const revalidate = 900;

export default async function CountriesPage() {
  const [{ countries }, videos] = await Promise.all([getCountries(), getTravelVideos()]);
  const onVideo = await groupByCountry(videos);
  const videoCount = new Map(onVideo.filter((c) => c.cca3).map((c) => [c.cca3 as string, c.videos.length]));
  const regions = Array.from(new Set(countries.map((c) => c.region).filter(Boolean)));

  return (
    <div className="space-y-8">
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

      {onVideo.length > 0 && (
        <section className="space-y-3">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <div>
              <h2>Countries on video</h2>
              <div className="sub">
                {onVideo.length} countries · {videos.length} travel videos — ranked by video count.
              </div>
            </div>
            <div className="right">
              <Link href="/videos" className="btn btn-ghost btn-sm">
                All videos →
              </Link>
            </div>
          </div>
          <CountriesOnVideo countries={onVideo} limit={12} />
        </section>
      )}

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
                      <p className="mt-0.5 text-[11px] text-zinc-500">
                        {c.capital} · {c.population.toLocaleString()}
                        {videoCount.get(c.cca3.toUpperCase()) ? (
                          <span className="ml-1.5 text-red-400">▶ {videoCount.get(c.cca3.toUpperCase())}</span>
                        ) : null}
                      </p>
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
