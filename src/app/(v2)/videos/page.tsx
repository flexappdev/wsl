import type { Metadata } from "next";
import { VideosBrowser } from "@/components/travel/VideosBrowser";
import { SubscribeCTA } from "@/components/travel/SubscribeCTA";
import { CountriesOnVideo } from "@/components/travel/CountriesOnVideo";
import { getCatalog, getTravelVideos, groupByCountry, toCard, CHANNEL_FALLBACK } from "@/lib/travel-videos";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Travel videos by country",
  description:
    "Every destination short and long-form travel film from @MatSiems, organised by country. Filter by shorts or films, country, or search a place.",
  alternates: { canonical: "/videos" },
};

export default async function VideosPage() {
  const [catalog, videos] = await Promise.all([getCatalog(), getTravelVideos()]);
  const countries = await groupByCountry(videos);
  const channel = catalog?.channel ?? CHANNEL_FALLBACK;
  const films = videos.filter((v) => v.kind === "long").length;

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="crumb">VIDEOS · {channel.handle}</div>
          <h1>The world on video.</h1>
          <div className="sub">
            {videos.length
              ? `${videos.length} videos across ${countries.length} countries — ${videos.length - films} vertical destination shorts and ${films} long films.`
              : "Destination shorts and long films from the road, organised by country. New videos land here every day."}
          </div>
        </div>
      </div>

      {videos.length === 0 ? (
        <>
          <div className="tv-empty" style={{ marginBottom: 18 }}>
            The video catalog is updating — check back in a few minutes.
          </div>
          <SubscribeCTA channel={channel} showAll={false} />
        </>
      ) : (
        <>
          <VideosBrowser
            cards={videos.map(toCard)}
            countries={countries
              .slice()
              .sort((a, b) => a.country.localeCompare(b.country))
              .map((c) => ({ name: c.country, flag: c.flag, count: c.videos.length }))}
          />

          <div className="section">
            <div className="section-head">
              <div>
                <h2>Countries on video</h2>
                <div className="sub">Ranked by how many videos each country has.</div>
              </div>
            </div>
            <CountriesOnVideo countries={countries} limit={24} />
          </div>

          <div className="section">
            <SubscribeCTA channel={channel} count={videos.length} showAll={false} />
          </div>
        </>
      )}
    </div>
  );
}
