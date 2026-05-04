"use client";

import { useRef, useState } from "react";
import { Loader2, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export type Chapter = { time: number; title: string };

interface VideoPlayerProps {
  url: string;
  poster?: string;
  /** Optional chapter list rendered below the video as clickable seek rows. */
  chapters?: Chapter[] | null;
}

/**
 * Native HTML5 player + optional clickable chapter list. Vercel R2 (now
 * via videos.thanielguitarlessons.com) serves with HTTP Range support so
 * the browser streams progressively once it has the metadata. We show a
 * small editorial loader during that pre-roll moment so it never feels
 * like nothing's happening.
 */
export const VideoPlayer = ({ url, poster, chapters }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [activeChapter, setActiveChapter] = useState<number | null>(null);

  const seek = (time: number, idx: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = time;
    el.play().catch(() => {
      /* autoplay-policy block: leave for user to press play */
    });
    setActiveChapter(idx);
  };

  const onTimeUpdate = () => {
    if (!chapters?.length) return;
    const el = videoRef.current;
    if (!el) return;
    const t = el.currentTime;
    // Find the current chapter as the highest-indexed one whose start <= t
    let cur = -1;
    for (let i = 0; i < chapters.length; i++) {
      if (chapters[i].time <= t) cur = i;
    }
    if (cur !== activeChapter) {
      setActiveChapter(cur === -1 ? null : cur);
    }
  };

  return (
    <div className="space-y-5">
      <div className="relative aspect-video overflow-hidden rounded-sm bg-black">
        {!isReady && (
          <div
            className="absolute inset-0 z-10 grid place-items-center bg-black/95 text-[#E9DEC9]"
            aria-hidden
          >
            <div className="space-y-3 text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin opacity-70" />
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-65">
                Loading the take…
              </div>
            </div>
          </div>
        )}
        <video
          ref={videoRef}
          src={url}
          poster={poster}
          controls
          playsInline
          preload="metadata"
          onLoadedMetadata={() => setIsReady(true)}
          onError={() => setIsReady(true)}
          onTimeUpdate={onTimeUpdate}
          className="absolute inset-0 h-full w-full"
        />
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/45">
        Tip · click the menu (three dots ⋮ on the right of the player) →
        Playback speed → pick 0.5x or 0.75x to play along, or 1.5x for review.
      </p>

      {chapters && chapters.length > 0 && (
        <div className="border border-foreground/15 bg-card">
          <div className="caps border-b border-foreground/15 px-4 py-3">
            Chapters · tap to jump
          </div>
          <ol className="divide-y divide-foreground/10">
            {chapters.map((c, i) => (
              <li key={`${c.time}-${i}`}>
                <button
                  type="button"
                  onClick={() => seek(c.time, i)}
                  className={cn(
                    "group grid w-full grid-cols-[2.25rem_4.5rem_1fr_auto] items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-primary/5",
                    activeChapter === i && "bg-primary/[0.06]",
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[10px] tracking-wider text-muted-foreground",
                      activeChapter === i && "text-primary",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-xs tabular-nums text-foreground/70",
                      activeChapter === i && "text-primary",
                    )}
                  >
                    {formatTime(c.time)}
                  </span>
                  <span
                    className={cn(
                      "font-display text-sm text-foreground/85",
                      activeChapter === i && "text-foreground",
                    )}
                  >
                    {c.title}
                  </span>
                  <Play
                    className={cn(
                      "h-3 w-3 text-foreground/30 transition-colors group-hover:text-primary",
                      activeChapter === i && "text-primary",
                    )}
                  />
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default VideoPlayer;
