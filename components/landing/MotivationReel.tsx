"use client";

import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  aspect: "portrait" | "video";
  label: string;
};

/**
 * Motivation reel with a real (functional) sound toggle. The video
 * autoplays muted (browser policy requires muted autoplay) and a small
 * editorial caption underneath flips muted on/off. Replaces the previous
 * "Tap to unmute" caption that didn't actually do anything.
 */
export function MotivationReel({ src, aspect, label }: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  };

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-2 -z-10 bg-[#E9DEC9]/[0.06]"
      />
      <div className="border border-[#E9DEC9]/20 bg-black p-1.5 shadow-2xl">
        <video
          ref={ref}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          controls
          preload="metadata"
          className={cn(
            "w-full bg-black",
            aspect === "portrait" ? "aspect-[9/16]" : "aspect-video",
          )}
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[#E9DEC9]/55">
        <span>{label}</span>
        <button
          type="button"
          onClick={toggle}
          className="inline-flex items-center gap-1.5 transition-colors hover:text-[#E9DEC9]"
        >
          {muted ? (
            <VolumeX className="h-3 w-3" />
          ) : (
            <Volume2 className="h-3 w-3" />
          )}
          {muted ? "Tap for sound" : "Mute"}
        </button>
      </div>
    </div>
  );
}
