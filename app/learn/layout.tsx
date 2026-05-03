import { redirect } from "next/navigation";
import { Sidebar } from "@/components/curriculum/Sidebar";
import { getOrCreateUser } from "@/lib/auth";
import {
  getCompletedLessonIds,
  getOverallProgress,
} from "@/lib/queries/curriculum";

export default async function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getOrCreateUser().catch(() => null);
  if (!user) redirect("/sign-in");

  const [completed, progress] = await Promise.all([
    getCompletedLessonIds(user.id),
    getOverallProgress(user.id),
  ]);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <Sidebar completedLessonIds={completed} fraction={progress.fraction} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
