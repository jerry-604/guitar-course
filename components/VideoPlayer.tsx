import { SmartVideo } from "@/components/SmartVideo";

interface VideoPlayerProps {
  url: string;
  poster?: string;
}

export const VideoPlayer = ({ url, poster }: VideoPlayerProps) => {
  return (
    <div className="relative aspect-video overflow-hidden rounded-sm bg-black">
      <SmartVideo
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
