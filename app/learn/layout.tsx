import { redirect } from "next/navigation";
import { Sidebar } from "@/components/curriculum/Sidebar";
import { MobileSidebarTrigger } from "@/components/curriculum/MobileSidebarTrigger";
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

  const sidebar = (
    <Sidebar completedLessonIds={completed} fraction={progress.fraction} />
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Desktop sidebar (always rendered) */}
      <div className="hidden md:block">{sidebar}</div>

      {/* Mobile sidebar — trigger floats above content; sheet renders sidebar */}
      <MobileSidebarTrigger>{sidebar}</MobileSidebarTrigger>

      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
