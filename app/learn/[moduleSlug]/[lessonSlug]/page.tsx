import { notFound, redirect } from "next/navigation";
import {
  getCurriculum,
  getLessonByPath,
  getCompletedLessonIds,
  pickNextLesson,
  lockedByModuleSlug,
} from "@/lib/queries/curriculum";
import { getOrCreateUser } from "@/lib/auth";
import { VideoPlayer } from "@/components/VideoPlayer";
import { LessonNotes } from "@/components/lesson/LessonNotes";
import { LessonCompleteButton } from "@/components/lesson/LessonCompleteButton";
import { NextLessonButton } from "@/components/lesson/NextLessonButton";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ moduleSlug: string; lessonSlug: string }>;
}) {
  const { moduleSlug, lessonSlug } = await params;

  const [user, curriculum, found] = await Promise.all([
    getOrCreateUser(),
    getCurriculum(),
    getLessonByPath(moduleSlug, lessonSlug),
  ]);

  if (!found) notFound();
  const { module: mod, lesson } = found;

  const completed = await getCompletedLessonIds(user.id);

  // Hard-block access to lessons inside a locked song module.
  const lockedBy = lockedByModuleSlug(curriculum, moduleSlug, completed);
  if (lockedBy) {
    redirect(`/learn`); // /learn redirector picks the next legit lesson
  }

  const isComplete = completed.has(lesson.id);
  const next = pickNextLesson(curriculum, moduleSlug, lessonSlug);

  return (
    <article className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {mod.title}
      </div>
      <h1 className="text-2xl font-bold tracking-tight">{lesson.title}</h1>
      {lesson.description && (
        <p className="mt-2 text-muted-foreground">{lesson.description}</p>
      )}

      <div className="my-6">
        <VideoPlayer url={lesson.youtubeUrl} />
      </div>

      {lesson.notesMarkdown && (
        <div className="mt-6">
          <LessonNotes markdown={lesson.notesMarkdown} />
        </div>
      )}

      <div className="mt-10 flex items-center justify-between">
        <LessonCompleteButton lessonId={lesson.id} isComplete={isComplete} />
        <NextLessonButton next={next} />
      </div>
    </article>
  );
}
