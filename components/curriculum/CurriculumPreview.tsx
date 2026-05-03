import { getCurriculum } from "@/lib/queries/curriculum";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Music } from "lucide-react";

export async function CurriculumPreview() {
  const curriculum = await getCurriculum();

  return (
    <section className="mx-auto max-w-3xl px-4 pb-24">
      <h2 className="text-2xl font-semibold mb-6">What you&apos;ll learn</h2>
      <Accordion type="multiple" className="w-full">
        {curriculum.map((mod) => (
          <AccordionItem value={mod.slug} key={mod.slug}>
            <AccordionTrigger>
              <span className="flex items-center gap-2 text-left">
                {mod.kind === "song" && (
                  <Music className="h-4 w-4 text-primary" aria-hidden />
                )}
                <span className="font-medium">{mod.title}</span>
                <span className="text-sm text-muted-foreground">
                  ({mod.lessons.length} lesson
                  {mod.lessons.length === 1 ? "" : "s"})
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              {mod.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {mod.description}
                </p>
              )}
              <ul className="space-y-1 text-sm">
                {mod.lessons.map((l) => (
                  <li key={l.id} className="text-muted-foreground">
                    · {l.title}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
