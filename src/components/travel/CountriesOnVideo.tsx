import Link from "next/link";
import { countryHref, type CountryVideos } from "@/lib/travel-videos";

/** "Countries on video" leaderboard — ranked by video count, poster backdrop. */
export function CountriesOnVideo({ countries, limit }: { countries: CountryVideos[]; limit?: number }) {
  const list = limit ? countries.slice(0, limit) : countries;
  const max = countries[0]?.videos.length ?? 1;
  return (
    <ol className="tv-countries">
      {list.map((c, i) => {
        const poster = (c.videos.find((v) => v.kind === "long") ?? c.videos[0])?.poster_url;
        return (
          <li key={c.country}>
            <Link href={countryHref(c)} className="tv-country" prefetch={false}>
              {poster && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={poster} alt="" loading="lazy" decoding="async" />
              )}
              <span className="tv-country-shade" />
              <span className="tv-rank">#{i + 1}</span>
              <span className="tv-country-body">
                <span className="tv-flag">{c.flag}</span>
                <span className="tv-country-name">{c.country}</span>
                <span className="tv-country-count">
                  {c.videos.length} video{c.videos.length === 1 ? "" : "s"}
                  {c.films ? ` · ${c.films} film${c.films === 1 ? "" : "s"}` : ""}
                </span>
                <span className="tv-bar">
                  <span style={{ width: `${Math.max(6, (c.videos.length / max) * 100)}%` }} />
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
