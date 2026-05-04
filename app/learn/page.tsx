import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/auth";
import {
  getCurriculum,
  getCompletedLessonIds,
  getApprovedSubmissionModuleSlugs,
  pickFirstIncompleteLesson,
  lockedByModuleSlug,
} from "@/lib/queries/curriculum";

export default async function LearnIndex() {
  const user = await getOrCreateUser();
  const [curriculum, completed, approvedSlugs] = await Promise.all([
    getCurriculum(),
    getCompletedLessonIds(user.id),
    getApprovedSubmissionModuleSlugs(user.id),
  ]);

  // Walk to the first incomplete lesson, but skip past lessons inside
  // locked song modules so we never bounce the user to a gated URL.
  for (const mod of curriculum) {
    if (lockedByModuleSlug(curriculum, mod.slug, approvedSlugs)) continue;
    for (const lesson of mod.lessons) {
      if (!completed.has(lesson.id)) {
        redirect(`/learn/${mod.slug}/${lesson.slug}`);
      }
    }
  }

  // Everything in unlocked modules is complete. Send to the last unlocked
  // lesson so the student lands on something meaningful.
  for (let i = curriculum.length - 1; i >= 0; i--) {
    const mod = curriculum[i];
    if (lockedByModuleSlug(curriculum, mod.slug, approvedSlugs)) continue;
    const lastLesson = mod.lessons[mod.lessons.length - 1];
    if (lastLesson) {
      redirect(`/learn/${mod.slug}/${lastLesson.slug}`);
    }
  }

  redirect("/");
}
