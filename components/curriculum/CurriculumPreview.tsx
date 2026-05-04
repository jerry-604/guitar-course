import { Music, Lock } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getCurriculum } from "@/lib/queries/curriculum";

export async function CurriculumPreview() {
  const curriculum = await getCurriculum();
  const totalLessons = curriculum.reduce(
    (acc, m) => acc + m.lessons.length,
    0,
  );

  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-24">
        <div className="mb-10 grid gap-6 sm:mb-14 sm:gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <div className="caps mb-3">Track listing</div>
            <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl">
              The complete program.
            </h2>
          </div>
          <div className="md:col-span-5 md:text-right">
            <div className="caps">{curriculum.length} modules</div>
            <div className="caps mt-1">{totalLessons} lessons total</div>
          </div>
        </div>

        <Accordion type="multiple" className="w-full divide-y divide-border/60 border-y border-border/60">
          {curriculum.map((mod, idx) => {
            const number = String(idx + 1).padStart(2, "0");
            const isSong = mod.kind === "song";
            return (
              <AccordionItem
                value={mod.slug}
                key={mod.slug}
                className="border-none"
              >
                <AccordionTrigger className="group py-5 hover:no-underline sm:py-6">
                  <div className="grid w-full grid-cols-[2rem_1fr_auto] items-baseline gap-3 text-left sm:grid-cols-[3rem_1fr_auto] sm:gap-6">
                    <span className="font-mono text-xs tracking-wider text-muted-foreground sm:text-sm">
                      {number}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {isSong && (
                          <Music
                            className="h-4 w-4 text-primary shrink-0"
                            aria-hidden
                          />
                        )}
                        <span className="font-display text-lg font-medium tracking-tight sm:text-xl md:text-2xl">
                          {mod.title}
                        </span>
                      </div>
                      {mod.songArtist && (
                        <div className="caps mt-1 text-primary">
                          by {mod.songArtist}
                        </div>
                      )}
                    </div>
                    <span className="caps shrink-0">
                      {mod.lessons.length}
                      <span className="hidden sm:inline">
                        {" "}
                        lesson{mod.lessons.length === 1 ? "" : "s"}
                      </span>
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-0 sm:pb-8">
                  <div className="grid grid-cols-[2rem_1fr] gap-3 sm:grid-cols-[3rem_1fr] sm:gap-6">
                    <div />
                    <div className="space-y-3">
                      {mod.description && (
                        <p className="mb-4 max-w-2xl italic text-foreground/75 leading-relaxed">
                          {mod.description}
                        </p>
                      )}
                      <ol className="space-y-2.5">
                        {mod.lessons.map((l, lessonIdx) => (
                          <li key={l.id} className="leader text-foreground/85">
                            <span className="font-body">
                              <span className="mr-3 font-mono text-xs text-muted-foreground">
                                {String(lessonIdx + 1).padStart(2, "0")}
                              </span>
                              {l.title}
                            </span>
                            <span className="dots" />
                            <span>video</span>
                          </li>
                        ))}
                      </ol>
                      {idx === curriculum.length - 1 && isSong && (
                        <div className="mt-4 inline-flex items-center gap-2 border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-primary">
                          <Lock className="h-3 w-3" />
                          Unlocks after Side A
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </section>
  );
}
