import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { SmartVideo } from "@/components/SmartVideo";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden border-b border-border/60">
      {/* Background motivation video — direct R2 first (fast), proxy
          fallback if the network blocks r2.dev */}
      <SmartVideo
        src="motivation-1.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        ariaHidden
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

      <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end gap-10 px-6 pb-20 pt-32">
        <div className="flex flex-col gap-6 max-w-3xl animate-fade-up">
          <div className="caps">A free guitar course · est. 2026</div>

          <h1 className="font-display text-[clamp(3rem,9vw,7rem)] font-medium leading-[0.92] tracking-[-0.035em] text-foreground">
            From your first chord
            <br />
            to your first
            <span className="italic text-primary"> George Strait </span>
            song.
          </h1>

          <p className="font-body text-lg leading-relaxed text-foreground/80 max-w-xl">
            Seven lessons, three open chords, three transitions, and a song you
            can actually play all the way through. No ads, no autoplay
            recommendations — just a curated track from a tutor who&apos;s
            taught bass and piano for years.
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-8 gap-y-3">
            <SignedOut>
              <Link
                href="/sign-up"
                className="group inline-flex items-center gap-3 border border-foreground bg-foreground px-6 py-3 font-display text-base text-background transition-colors hover:bg-primary hover:border-primary"
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
                className="group inline-flex items-center gap-3 border border-foreground bg-foreground px-6 py-3 font-display text-base text-background transition-colors hover:bg-primary hover:border-primary"
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
        <div className="flex flex-wrap items-baseline gap-x-10 gap-y-3 border-t border-border/60 pt-6 text-foreground/85">
          <Stat label="Lessons" value="9" />
          <Stat label="Songs" value="2" />
          <Stat label="Chords to learn" value="C · G · D" />
          <Stat label="Cost" value="Free, forever" />
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
