const CDN = "https://videos.thanielguitarlessons.com";

/**
 * Quiet side-note in the InstructorPitch: Jerry also coaches
 * powerlifting. Just a small mention with an unobtrusive video clip,
 * not a brag block. If a visitor cares, they can reach out.
 */
export function DeadliftFunFact() {
  return (
    <div className="mt-12 grid grid-cols-1 gap-5 border-t border-border/60 pt-8 sm:grid-cols-[10rem_1fr] sm:gap-6">
      <div className="border border-foreground/15 bg-black p-1 shadow-sm">
        <video
          src={`${CDN}/VID-20251006-WA0004.mp4`}
          autoPlay
          muted
          loop
          playsInline
          controls
          preload="metadata"
          className="aspect-video w-full bg-black"
        />
      </div>
      <div className="text-foreground/75">
        <div className="caps mb-1.5">Side note</div>
        <p className="text-sm leading-relaxed sm:text-base">
          I also coach powerlifting. If that&apos;s your thing too, reach
          out.
        </p>
      </div>
    </div>
  );
}
