import { MotivationReel } from "@/components/landing/MotivationReel";

const CDN = "https://videos.thanielguitarlessons.com";

/**
 * Inverted-color "this is where you're heading" centerpiece.
 * Two motivation reels — same song (Amarillo by Morning) shot two ways —
 * frame the message: this is the future, not just an aspiration.
 */
export function WatchThisFirst() {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-[#181410] text-[#E9DEC9]">
      {/* Subtle warm radial wash so the deep-coffee bg doesn't read flat */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(142,42,38,0.18),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_70%,rgba(228,138,79,0.12),transparent_55%)]"
      />

      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-24 md:py-28">
        <div className="mb-10 max-w-3xl sm:mb-12">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#E9DEC9]/65">
            Before you start · watch this first
          </div>
          <h2 className="mt-4 font-display text-4xl font-medium leading-[1] tracking-[-0.02em] sm:text-5xl md:text-6xl">
            This is where you&apos;re
            <br />
            <span className="italic text-[#E48A4F]">heading.</span>
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#E9DEC9]/85 sm:mt-6 sm:text-xl">
            Two takes of <em className="text-[#E9DEC9]">Amarillo by Morning</em>.
            Same song, two reels. Your soundtrack for the next few weeks.
            That&apos;s where this course is taking you.
          </p>
        </div>

        {/* Two-video centerpiece. Portrait left, horizontal right.
            Stacks vertically on mobile. */}
        <div className="grid items-stretch gap-8 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <div className="mx-auto w-full max-w-[22rem]">
              <MotivationReel
                src={`${CDN}/motivation-2.mp4`}
                aspect="portrait"
                label="Reel 01 · Portrait"
              />
            </div>
          </div>

          <div className="md:col-span-7">
            <MotivationReel
              src={`${CDN}/motivation-1.mp4`}
              aspect="video"
              label="Reel 02 · Cinematic"
            />

            {/* Bottom motivational copy block */}
            <div className="mt-10 max-w-xl space-y-4 text-[#E9DEC9]/80">
              <p className="text-base leading-relaxed">
                Right now this might look impossible. That&apos;s the point.
                Seven lessons from now this <em className="text-[#E9DEC9]">is</em> you,
                start to finish, no rewinds.
              </p>
              <p className="text-base leading-relaxed text-[#E9DEC9]/70">
                You&apos;ll learn one song first: <em>The Cowboy Rides Away</em>.
                Send a tape, get the green light, then this one unlocks.
              </p>
              <p className="text-xs leading-relaxed text-[#E9DEC9]/55">
                I rendered these on my company&apos;s GPUs from Thaniel&apos;s
                LinkedIn photo. Two takes, same person.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-baseline gap-x-6 gap-y-3 border-t border-[#E9DEC9]/15 pt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-[#E9DEC9]/55 sm:mt-14 sm:gap-x-8">
          <span>↓ Three chords below</span>
          <span>·</span>
          <span>Two songs</span>
          <span>·</span>
          <span>One you</span>
        </div>
      </div>
    </section>
  );
}
