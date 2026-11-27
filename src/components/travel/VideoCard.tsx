import Link from "next/link";
import { Play } from "lucide-react";
import { formatDuration, type TravelCard } from "@/lib/travel-videos-shared";

type Props = { card: TravelCard; showCountry?: boolean };

/** Poster card. Shorts render 9:16, films 16:9. Pure server-safe markup. */
export function VideoCard({ card, showCountry = true }: Props) {
  const film = card.kind === "long";
  return (
    <Link href={`/videos/${card.id}`} className={"tv-card" + (film ? " film" : " short")} prefetch={false}>
      <div className="tv-poster">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={card.poster_url} alt={card.title} loading="lazy" decoding="async" />
        <span className="tv-grad" />
        <span className={"tv-badge " + (card.onYouTube ? "yt" : "new")}>{card.onYouTube ? "On YouTube" : "New"}</span>
        <span className="tv-dur">{formatDuration(card.duration)}</span>
        <span className="tv-play" aria-hidden>
          <Play size={14} fill="currentColor" />
        </span>
        {film && <span className="tv-kind">Film</span>}
      </div>
      <div className="tv-meta">
        <div className="tv-title">{film ? card.title : card.place}</div>
        {showCountry && (
          <div className="tv-sub">
            {film ? `${card.place} · ${card.country}` : card.country}
          </div>
        )}
      </div>
    </Link>
  );
}
