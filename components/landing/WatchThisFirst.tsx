/**
 * Inverted-color "this is where you're heading" centerpiece. Lives between
 * Hero and FeaturedSongs to give the page a visual beat — the cream-paper
 * editorial flow stops, a single dark frame holds the portrait motivation
 * video, the reader gets a moment of "oh, that could be me."
 */
export function WatchThisFirst() {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-[#181410] text-[#E9DEC9]">
      {/* Subtle warm radial wash so the deep-coffee background doesn't read flat */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(142,42,38,0.18),transparent_55%)]"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-28">
        <div className="grid items-center gap-12 md:grid-cols-12 md:gap-16">
          {/* Portrait video — framed like a movie poster */}
          <div className="md:col-span-5">
            <div className="relative mx-auto w-full max-w-[22rem]">
              <div
                aria-hidden
                className="absolute -inset-3 -z-10 bg-[#E9DEC9]/[0.06]"
              />
              <div className="border border-[#E9DEC9]/20 bg-black p-1.5 shadow-2xl">
                <video
                  src="https://pub-3410e1e40f1a47128a7371ab17d56ad3.r2.dev/motivation-2.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  preload="metadata"
                  className="aspect-[9/16] w-full bg-black"
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[#E9DEC9]/55">
                <span>Reel · 0:30</span>
                <span>Tap to unmute</span>
              </div>
            </div>
          </div>

          {/* Copy */}
          <div className="md:col-span-7 space-y-7">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#E9DEC9]/65">
              Before you start · watch this first
            </div>

            <h2 className="font-display text-5xl font-medium leading-[1.02] tracking-[-0.02em] sm:text-6xl">
              This is
              <br />
              where you&apos;re
              <br />
              <span className="italic text-[#E48A4F]">heading.</span>
            </h2>

            <p className="max-w-xl text-xl leading-relaxed text-[#E9DEC9]/85">
              A complete George Strait song. Three chords. One steady strum.
              The cowboy rides away — and your hands are the ones playing it.
            </p>

            <p className="max-w-xl text-base leading-relaxed text-[#E9DEC9]/65">
              Right now this might look impossible. That&apos;s the point.
              Seven lessons from now this <em className="text-[#E9DEC9]/85">is</em> you,
              start to finish, no rewinds.
            </p>

            <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3 pt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[#E9DEC9]/55">
              <span>↓ Three chords below</span>
              <span>·</span>
              <span>One song</span>
              <span>·</span>
              <span>You</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
