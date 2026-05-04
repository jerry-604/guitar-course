import { Music, Lock } from "lucide-react";
import {
  getCurriculum,
  lockedByModuleSlug,
} from "@/lib/queries/curriculum";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SidebarLessonRow } from "./SidebarLessonRow";

type Props = {
  completedLessonIds: Set<string>;
  approvedSubmissionSlugs: Set<string>;
  fraction: number;
};

export async function Sidebar({
  completedLessonIds,
  approvedSubmissionSlugs,
  fraction,
}: Props) {
  const curriculum = await getCurriculum();
  const pct = Math.round(fraction * 100);

  return (
    <aside className="w-72 max-w-full shrink-0 border-r border-border/60 bg-card">
      {/* Progress block — editorial counter style, not a SaaS progress bar. */}
      <div className="border-b border-border/60 px-5 py-5">
        <div className="caps mb-2">Your progress</div>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl font-medium leading-none">
            {pct}
          </span>
          <span className="font-mono text-xs text-muted-foreground">% complete</span>
        </div>
        {/* Hairline progress strip */}
        <div className="mt-3 h-px w-full bg-border">
          <div
            className="h-px bg-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-4rem-7.5rem)]">
        <nav className="px-3 py-5">
          {curriculum.map((mod, idx) => {
            const lockedBy = lockedByModuleSlug(
              curriculum,
              mod.slug,
              approvedSubmissionSlugs,
            );
            const isLocked = lockedBy !== null;
            const number = String(idx + 1).padStart(2, "0");

            return (
              <div key={mod.slug} className="mb-5">
                <div className="mb-2 flex items-baseline gap-2.5 px-2">
                  <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                    {number}
                  </span>
                  {isLocked ? (
                    <Lock
                      className="h-3 w-3 text-muted-foreground/60 shrink-0 self-center"
                      aria-hidden
                    />
                  ) : mod.kind === "song" ? (
                    <Music
                      className="h-3 w-3 text-primary shrink-0 self-center"
                      aria-hidden
                    />
                  ) : null}
                  <span
                    className={cn(
                      "font-display text-sm font-medium tracking-tight",
                      mod.kind === "song" && !isLocked && "text-primary",
                      isLocked && "text-muted-foreground/60",
                    )}
                  >
                    {mod.title}
                  </span>
                </div>
                <ul className="space-y-0.5">
                  {mod.lessons.map((l) => (
                    <li key={l.id}>
                      <SidebarLessonRow
                        href={`/learn/${mod.slug}/${l.slug}`}
                        title={l.title}
                        isComplete={completedLessonIds.has(l.id)}
                        isLocked={isLocked}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
