import { Youtube, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { subscribeUrl, CHANNEL_FALLBACK, type TravelChannel } from "@/lib/travel-videos-shared";

type Props = { channel?: TravelChannel; count?: number; showAll?: boolean };

export function SubscribeCTA({ channel = CHANNEL_FALLBACK, count, showAll = true }: Props) {
  return (
    <div className="tv-cta">
      <div className="tv-cta-icon">
        <Youtube size={22} />
      </div>
      <div className="tv-cta-text">
        <div className="tv-cta-title">Subscribe on YouTube {channel.handle}</div>
        <div className="tv-cta-sub">
          {count ? `${count} destinations` : "Destination shorts and long films"} from {channel.name} — new videos every day,
          country by country.
        </div>
      </div>
      <div className="tv-cta-actions">
        <a className="btn btn-primary btn-sm" href={subscribeUrl(channel)} target="_blank" rel="noreferrer">
          Subscribe <ArrowUpRight size={12} />
        </a>
        {showAll && (
          <Link className="btn btn-secondary btn-sm" href="/videos">
            Watch all
          </Link>
        )}
      </div>
    </div>
  );
}
