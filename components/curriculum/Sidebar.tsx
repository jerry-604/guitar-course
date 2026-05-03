import { Music } from "lucide-react";
import { getCurriculum } from "@/lib/queries/curriculum";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SidebarLessonRow } from "./SidebarLessonRow";

type Props = {
  completedLessonIds: Set<string>;
  fraction: number;
};

export async function Sidebar({ completedLessonIds, fraction }: Props) {
  const curriculum = await getCurriculum();
  const pct = Math.round(fraction * 100);

  return (
    <aside className="w-72 shrink-0 border-r bg-muted/30">
      <div className="px-4 py-4 border-b">
        <div className="text-xs font-medium text-muted-foreground mb-2">
          Your progress — {pct}%
        </div>
        <Progress value={pct} />
      </div>
      <ScrollArea className="h-[calc(100vh-8.5rem)]">
        <nav className="px-2 py-3">
          {curriculum.map((mod) => (
            <div key={mod.slug} className="mb-4">
              <div
                className={cn(
                  "flex items-center gap-2 px-2 py-1 text-sm font-semibold",
                  mod.kind === "song" && "text-primary",
                )}
              >
                {mod.kind === "song" && (
                  <Music className="h-3.5 w-3.5" aria-hidden />
                )}
                <span>{mod.title}</span>
              </div>
              <ul className="mt-1 space-y-0.5">
                {mod.lessons.map((l) => (
                  <li key={l.id}>
                    <SidebarLessonRow
                      href={`/learn/${mod.slug}/${l.slug}`}
                      title={l.title}
                      isComplete={completedLessonIds.has(l.id)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
