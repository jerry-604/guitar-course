const CDN = "https://videos.thanielguitarlessons.com";

/**
 * A small "off-curriculum" Easter egg in the InstructorPitch — Jerry
 * also coaches powerlifting. One short clip of a 550 lb pull at a
 * Google competition before an injury sidelined him. Sits at the
 * bottom of the pitch; doesn't compete with the main course pitch.
 */
export function DeadliftFunFact() {
  return (
    <div className="mt-12 grid grid-cols-1 gap-5 border-t border-border/60 pt-8 sm:grid-cols-[14rem_1fr] sm:gap-8">
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
      <div>
        <div className="caps mb-2">Off-curriculum</div>
        <p className="font-display text-xl font-medium leading-snug tracking-tight sm:text-2xl">
          Fun fact: I also coach powerlifting.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-foreground/70 sm:text-base">
          That&apos;s me hitting a <strong>550 lb deadlift</strong> at a
          Google competition two years ago, right before an injury
          sidelined the meet circuit. Different discipline, same coaching
          principle: progress comes from short, consistent, well-cued
          reps. Beats grinding for hours and quitting in week three.
        </p>
      </div>
    </div>
  );
}
