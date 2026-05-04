interface VideoPlayerProps {
  url: string;
  poster?: string;
}

/**
 * Plain HTML5 <video> wrapper. All assets are now on Vercel Blob with
 * universally-trusted certs, so no proxy or fallback logic is needed.
 */
export const VideoPlayer = ({ url, poster }: VideoPlayerProps) => {
  return (
    <div className="relative aspect-video overflow-hidden rounded-sm bg-black">
      <video
        src={url}
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
