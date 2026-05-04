"use client";

import { useMemo } from "react";

const R2_HOST = "pub-3410e1e40f1a47128a7371ab17d56ad3.r2.dev";

/**
 * Rewrites a video URL so it streams through our same-origin proxy at /api/video.
 * Networks and corporate Wi-Fi sometimes block raw r2.dev domains; the proxy
 * sidesteps that by serving from the app's own host. Any non-R2 URL passes through.
 */
function proxyIfR2(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname === R2_HOST) {
      return `/api/video${u.pathname}`;
    }
    return url;
  } catch {
    return url;
  }
}

interface VideoPlayerProps {
  url: string;
  poster?: string;
}

export const VideoPlayer = ({ url, poster }: VideoPlayerProps) => {
  const src = useMemo(() => proxyIfR2(url), [url]);

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
      <video
        key={src}
        src={src}
        poster={poster}
        controls
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
};

export default VideoPlayer;
