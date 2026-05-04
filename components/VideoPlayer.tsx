"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  poster?: string;
}

/**
 * Native HTML5 player. Vercel Blob already serves video with HTTP Range
 * support so the browser streams progressively (YouTube-style) once it
 * has the metadata. We show a small editorial loader during that
 * pre-roll moment so it never feels like nothing's happening.
 */
export const VideoPlayer = ({ url, poster }: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false);

  return (
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
        src={url}
        poster={poster}
        controls
        playsInline
        preload="metadata"
        onLoadedMetadata={() => setIsReady(true)}
        onError={() => setIsReady(true) /* surface the native error UI */}
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
};

export default VideoPlayer;
