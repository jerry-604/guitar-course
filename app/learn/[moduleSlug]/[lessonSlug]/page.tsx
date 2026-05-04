import { notFound } from "next/navigation";
import {
  getCurriculum,
  getLessonByPath,
  getCompletedLessonIds,
  pickNextLesson,
  lockedByModuleSlug,
} from "@/lib/queries/curriculum";
import { getOrCreateUser } from "@/lib/auth";
import { VideoPlayer } from "@/components/VideoPlayer";
import { LockedSongView } from "@/components/lesson/LockedSongView";
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

  // Locked song module: render an in-place "this is gated" explanation
  // instead of silently redirecting away — bouncing the URL was confusing.
  const lockedBy = lockedByModuleSlug(curriculum, moduleSlug, completed);
  if (lockedBy) {
    const blockingModule = curriculum.find((m) => m.slug === lockedBy);
    return (
      <LockedSongView
        lockedModule={mod}
        blockingModule={
          blockingModule
            ? {
                slug: blockingModule.slug,
                title: blockingModule.title,
                songTitle: blockingModule.songTitle,
                firstLessonSlug: blockingModule.lessons[0]?.slug,
              }
            : null
        }
      />
    );
  }

  const isComplete = completed.has(lesson.id);
  const next = pickNextLesson(curriculum, moduleSlug, lessonSlug);

  // Find this lesson's index within the module for the "Lesson X of Y" caption
  const lessonIdx = mod.lessons.findIndex((l) => l.slug === lessonSlug);

  return (
    <article className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <header className="mb-6 border-b border-border/60 pb-5 sm:mb-8 sm:pb-6">
        <div className="caps mb-2">
          {mod.kind === "song" && mod.songArtist
            ? `${mod.songArtist} · ${mod.title}`
            : mod.title}
        </div>
        <h1 className="font-display text-3xl font-medium leading-[1.05] tracking-tight sm:text-4xl md:text-5xl">
          {lesson.title}
        </h1>
        {lesson.description && (
          <p className="mt-3 max-w-2xl text-base italic leading-relaxed text-foreground/75 sm:mt-4 sm:text-lg">
            {lesson.description}
          </p>
        )}
        <div className="caps mt-4">
          Lesson {lessonIdx + 1} of {mod.lessons.length}
        </div>
      </header>

      {/* Video plate. URL is a Vercel Blob URL; player uses native <video>. */}
      <div className="my-6 border border-foreground/15 bg-foreground/[0.03] p-1.5 sm:my-8 sm:p-2">
        <VideoPlayer url={lesson.youtubeUrl} />
      </div>

      {lesson.notesMarkdown && (
        <div className="prose prose-stone max-w-none my-8 dark:prose-invert sm:my-10">
          <LessonNotes markdown={lesson.notesMarkdown} />
        </div>
      )}

      <footer className="mt-10 flex flex-col items-stretch gap-4 border-t border-border/60 pt-6 sm:mt-12 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:pt-8">
        <LessonCompleteButton lessonId={lesson.id} isComplete={isComplete} />
        <NextLessonButton next={next} />
      </footer>
    </article>
  );
}
