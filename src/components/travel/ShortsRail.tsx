import { VideoCard } from "./VideoCard";
import type { TravelCard } from "@/lib/travel-videos-shared";

/** Horizontal scroll rail of cards (snap on touch). */
export function VideoRail({ cards, showCountry = true }: { cards: TravelCard[]; showCountry?: boolean }) {
  if (!cards.length) return null;
  return (
    <div className="tv-rail scroll-x">
      {cards.map((c) => (
        <VideoCard key={c.id} card={c} showCountry={showCountry} />
      ))}
    </div>
  );
}
