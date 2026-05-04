"use client";

import { toProxiedVideoUrl } from "@/lib/videoUrl";

interface VideoPlayerProps {
  /**
   * Either a raw R2 URL or an already-proxied path. We re-rewrite either
   * way so the component is safe whether the parent server component
   * pre-rewrote or not.
   */
  url: string;
  poster?: string;
}

export const VideoPlayer = ({ url, poster }: VideoPlayerProps) => {
  const src = toProxiedVideoUrl(url);

  return (
    <div className="relative aspect-video overflow-hidden rounded-sm bg-black">
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
