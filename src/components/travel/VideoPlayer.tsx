"use client";

import { useRef, useState } from "react";
import { chapterSeconds, type TravelChapter } from "@/lib/travel-videos-shared";

type Props = {
  youtubeId: string | null;
  videoUrl: string;
  posterUrl: string;
  title: string;
  kind: "short" | "long";
  chapters?: TravelChapter[];
};

/** YouTube embed when published, otherwise HTML5 <video>. Chapters seek either. */
export function VideoPlayer({ youtubeId, videoUrl, posterUrl, title, kind, chapters = [] }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [start, setStart] = useState<number | null>(null);

  const seek = (t: string) => {
    const s = chapterSeconds(t);
    if (youtubeId) {
      setStart(s);
    } else if (videoRef.current) {
      videoRef.current.currentTime = s;
      void videoRef.current.play().catch(() => {});
    }
  };

  const ytSrc = youtubeId
    ? `https://www.youtube-nocookie.com/embed/${youtubeId}?playsinline=1&rel=0&modestbranding=1${
        start !== null ? `&start=${start}&autoplay=1` : ""
      }`
    : null;

  return (
    <div className="tv-player-wrap">
      <div className={"tv-player " + (kind === "short" ? "short" : "film")}>
        {ytSrc ? (
          <iframe
            key={ytSrc}
            src={ytSrc}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <video ref={videoRef} src={videoUrl} poster={posterUrl} controls playsInline preload="none" aria-label={title} />
        )}
      </div>
      {chapters.length > 0 && (
        <ol className="tv-chapters" aria-label="Chapters">
          {chapters.map((c) => (
            <li key={c.t + c.label}>
              <button type="button" onClick={() => seek(c.t)}>
                <span className="t">{c.t}</span>
                <span className="l">{c.label}</span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
