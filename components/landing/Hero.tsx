import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

const CDN = "https://videos.thanielguitarlessons.com";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden border-b border-border/60">
      {/* Background motivation video — Cloudflare R2 via custom domain */}
      <video
        src={`${CDN}/motivation-1.mp4`}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-[0.55] dark:opacity-40"
      />

      {/* Vignette + gradient wash so type stays legible on whatever the video shows */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/55 to-background"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_hsl(var(--background)/0.6)_85%)]"
      />

      <div className="relative mx-auto flex min-h-[68vh] max-w-6xl flex-col justify-end gap-8 px-5 pb-14 pt-24 sm:min-h-[78vh] sm:gap-10 sm:px-6 sm:pb-20 sm:pt-32">
        <div className="flex flex-col gap-5 max-w-3xl animate-fade-up sm:gap-6">
          <div className="caps">A free guitar course · est. 2026</div>

          <h1 className="font-display text-[clamp(2.4rem,8.5vw,7rem)] font-medium leading-[0.95] tracking-[-0.035em] text-foreground">
            From your first chord
            <br />
            to your first
            <span className="italic text-primary"> George Strait </span>
            song.
          </h1>

          <p className="font-body text-base leading-relaxed text-foreground/80 max-w-xl sm:text-lg">
            Seven lessons, three open chords, three transitions, and a song you
            can actually play all the way through. No ads, no autoplay
            recommendations. Just a curated track from Jerry, a professional
            bass guitarist who tutored bass and piano students in Nigeria.
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3 sm:gap-x-8">
            <SignedOut>
              <Link
                href="/sign-up"
                className="group inline-flex items-center gap-3 border border-foreground bg-foreground px-5 py-2.5 font-display text-sm text-background transition-colors hover:bg-primary hover:border-primary sm:px-6 sm:py-3 sm:text-base"
              >
                Start the course
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <Link
                href="/sign-in"
                className="editorial-cta editorial-cta--primary"
              >
                Already enrolled? Sign in
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/learn"
                className="group inline-flex items-center gap-3 border border-foreground bg-foreground px-5 py-2.5 font-display text-sm text-background transition-colors hover:bg-primary hover:border-primary sm:px-6 sm:py-3 sm:text-base"
              >
                Continue learning
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </SignedIn>
          </div>
        </div>

        {/* Bottom-row metadata in editorial caps lockups */}
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3 border-t border-border/60 pt-5 text-foreground/85 sm:gap-x-10 sm:pt-6">
          <Stat label="Lessons" value="9" />
          <Stat label="Songs" value="2" />
          <Stat label="Chords to learn" value="D · G · C" />
          <Stat label="Cost" value="Free, forever" />
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-3 left-1/2 hidden -translate-x-1/2 sm:block">
          <div className="flex flex-col items-center gap-1 text-foreground/45">
            <span className="caps">Scroll</span>
            <svg
              width="16"
              height="20"
              viewBox="0 0 16 20"
              fill="none"
              className="animate-pulse"
              aria-hidden
            >
              <path
                d="M8 2 L8 16 M3 11 L8 16 L13 11"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.7"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="caps">{label}</span>
      <span className="font-display text-lg font-medium">{value}</span>
    </div>
  );
}
