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
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-14 grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <div className="caps mb-3">Track listing</div>
            <h2 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
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
                <AccordionTrigger className="group py-6 hover:no-underline">
                  <div className="grid w-full grid-cols-[3rem_1fr_auto] items-baseline gap-6 text-left">
                    <span className="font-mono text-sm tracking-wider text-muted-foreground">
                      {number}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        {isSong && (
                          <Music
                            className="h-4 w-4 text-primary"
                            aria-hidden
                          />
                        )}
                        <span className="font-display text-xl font-medium tracking-tight sm:text-2xl">
                          {mod.title}
                        </span>
                      </div>
                      {mod.songArtist && (
                        <div className="caps mt-1 text-primary">
                          by {mod.songArtist}
                        </div>
                      )}
                    </div>
                    <span className="caps">
                      {mod.lessons.length} lesson
                      {mod.lessons.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-8 pt-0">
                  <div className="grid grid-cols-[3rem_1fr] gap-6">
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
