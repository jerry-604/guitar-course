import {
  ChordDiagram,
  D_MAJOR,
  G_MAJOR,
  C_MAJOR,
} from "@/components/ui/ChordDiagram";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

/**
 * The three open chords laid out as editorial diagrams. Doubles as
 * decoration AND as a quick "this is what you'll be making" reference.
 */
export function ChordTrio() {
  return (
    <section className="border-b border-border/60 bg-card">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-24">
        <RevealOnScroll>
          <div className="mb-10 max-w-2xl sm:mb-14">
            <div className="caps mb-3">Three shapes you&apos;ll make</div>
            <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl">
              D, G, and C.
              <br />
              <span className="italic text-primary">Every song uses them.</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/75 sm:text-lg">
              Most beginner-friendly country songs sit on these three open
              chords. Once your fingers know the shapes, the rest is rhythm.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid gap-10 sm:grid-cols-3 sm:gap-6 md:gap-12">
          {[D_MAJOR, G_MAJOR, C_MAJOR].map((shape, i) => (
            <RevealOnScroll
              key={shape.name}
              delay={120 * i}
              className="flex flex-col items-center"
            >
              <ChordDiagram shape={shape} size="lg" showFingerNumbers />
              <div className="caps mt-5 text-center text-foreground/65 sm:mt-6">
                {labelFor(shape.name)}
              </div>
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll delay={400}>
          <p className="mt-12 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50 sm:mt-14">
            Filled dots = where your fingers go ·
            &nbsp;O = open string ·
            &nbsp;× = don&apos;t play this string
          </p>
        </RevealOnScroll>
      </div>
    </section>
  );
}

function labelFor(name: string): string {
  if (name === "D") return "Easiest first · 3 fingers, top 3 strings";
  if (name === "G") return "Country workhorse";
  if (name === "C") return "Trickiest · stretch & precision";
  return name;
}
