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
    <article className="mx-auto max-w-3xl px-8 py-12">
      <header className="mb-8 border-b border-border/60 pb-6">
        <div className="caps mb-2">
          {mod.kind === "song" && mod.songArtist
            ? `${mod.songArtist} · ${mod.title}`
            : mod.title}
        </div>
        <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
          {lesson.title}
        </h1>
        {lesson.description && (
          <p className="mt-4 max-w-2xl text-lg italic leading-relaxed text-foreground/75">
            {lesson.description}
          </p>
        )}
        <div className="caps mt-4">
          Lesson {lessonIdx + 1} of {mod.lessons.length}
        </div>
      </header>

      {/* Video — framed like a print plate. SmartVideo (inside VideoPlayer)
          tries direct R2 first and falls back to the /api/video proxy on
          error or stall, so we never need to pre-rewrite here. */}
      <div className="my-8 border border-foreground/15 bg-foreground/[0.03] p-2">
        <VideoPlayer url={lesson.youtubeUrl} />
      </div>

      {lesson.notesMarkdown && (
        <div className="prose prose-stone max-w-none my-10 dark:prose-invert">
          <LessonNotes markdown={lesson.notesMarkdown} />
        </div>
      )}

      <footer className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-border/60 pt-8">
        <LessonCompleteButton lessonId={lesson.id} isComplete={isComplete} />
        <NextLessonButton next={next} />
      </footer>
    </article>
  );
}
