import { notFound } from "next/navigation";
import {
  getCurriculum,
  getLessonByPath,
  getCompletedLessonIds,
  getApprovedSubmissionModuleSlugs,
  getLatestSubmission,
  pickNextLesson,
  lockedByModuleSlug,
} from "@/lib/queries/curriculum";
import { getOrCreateUser } from "@/lib/auth";
import { VideoPlayer, type Chapter } from "@/components/VideoPlayer";
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

  const [completed, approvedSlugs] = await Promise.all([
    getCompletedLessonIds(user.id),
    getApprovedSubmissionModuleSlugs(user.id),
  ]);

  // Locked song module: render an in-place "this is gated" explanation
  // (with submission form) instead of silently redirecting away.
  const lockedBy = lockedByModuleSlug(curriculum, moduleSlug, approvedSlugs);
  if (lockedBy) {
    const blockingModule = curriculum.find((m) => m.slug === lockedBy);
    const latestSubmission = blockingModule
      ? await getLatestSubmission(user.id, blockingModule.slug)
      : null;
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
        blockingSubmission={
          latestSubmission
            ? {
                id: latestSubmission.id,
                status: latestSubmission.status,
                feedback: latestSubmission.feedback,
                createdAt: latestSubmission.createdAt,
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

      {/* Video plate. Chapters (if any) render as a clickable seek list
          underneath the video frame. */}
      <div className="my-6 sm:my-8">
        <VideoPlayer
          url={lesson.youtubeUrl}
          chapters={(lesson.chapters as Chapter[] | null) ?? null}
        />
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
