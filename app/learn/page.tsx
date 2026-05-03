import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/auth";
import {
  getCurriculum,
  getCompletedLessonIds,
  pickFirstIncompleteLesson,
} from "@/lib/queries/curriculum";

export default async function LearnIndex() {
  const user = await getOrCreateUser();
  const [curriculum, completed] = await Promise.all([
    getCurriculum(),
    getCompletedLessonIds(user.id),
  ]);

  const target = pickFirstIncompleteLesson(curriculum, completed);

  if (target) {
    redirect(`/learn/${target.moduleSlug}/${target.lessonSlug}`);
  }

  // Everything is complete — send them to the very last lesson.
  const lastModule = curriculum[curriculum.length - 1];
  const lastLesson = lastModule?.lessons[lastModule.lessons.length - 1];
  if (lastLesson) {
    redirect(`/learn/${lastModule.slug}/${lastLesson.slug}`);
  }

  // Empty curriculum (only possible if seed wasn't run).
  redirect("/");
}
