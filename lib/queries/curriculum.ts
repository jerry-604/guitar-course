import { prisma } from "@/lib/prisma";
import { ModuleKind } from "@prisma/client";

export type LessonNode = {
  id: string;
  slug: string;
  order: number;
  title: string;
  moduleSlug: string;
};

export type CurriculumNode = {
  id: string;
  slug: string;
  order: number;
  title: string;
  kind: ModuleKind;
  songTitle?: string | null;
  songArtist?: string | null;
  description?: string | null;
  coverImageUrl?: string | null;
  lessons: LessonNode[];
};

/**
 * Returns every module and its lessons, fully ordered. One DB roundtrip.
 */
export async function getCurriculum(): Promise<CurriculumNode[]> {
  const modules = await prisma.module.findMany({
    orderBy: { order: "asc" },
    include: {
      lessons: { orderBy: { order: "asc" } },
    },
  });

  return modules.map((m) => ({
    id: m.id,
    slug: m.slug,
    order: m.order,
    title: m.title,
    kind: m.kind,
    songTitle: m.songTitle,
    songArtist: m.songArtist,
    description: m.description,
    coverImageUrl: m.coverImageUrl,
    lessons: m.lessons.map((l) => ({
      id: l.id,
      slug: l.slug,
      order: l.order,
      title: l.title,
      moduleSlug: m.slug,
    })),
  }));
}

/**
 * Returns the full lesson row plus its module — for the lesson view page.
 */
export async function getLessonByPath(moduleSlug: string, lessonSlug: string) {
  const mod = await prisma.module.findUnique({
    where: { slug: moduleSlug },
    include: {
      lessons: {
        where: { slug: lessonSlug },
      },
    },
  });
  if (!mod || mod.lessons.length === 0) return null;
  const lesson = mod.lessons[0];
  return { module: mod, lesson };
}

/**
 * Returns the set of lessonIds the user has completed.
 */
export async function getCompletedLessonIds(
  userId: string,
): Promise<Set<string>> {
  const rows = await prisma.lessonCompletion.findMany({
    where: { userId },
    select: { lessonId: true },
  });
  return new Set(rows.map((r) => r.lessonId));
}

/**
 * Overall progress as a 0..1 fraction.
 */
export async function getOverallProgress(userId: string): Promise<{
  completed: number;
  total: number;
  fraction: number;
}> {
  const [total, completed] = await Promise.all([
    prisma.lesson.count(),
    prisma.lessonCompletion.count({ where: { userId } }),
  ]);
  return {
    completed,
    total,
    fraction: total === 0 ? 0 : completed / total,
  };
}

// ---------- pure helpers (unit-tested in curriculum.test.ts) ----------

/**
 * Walks the curriculum in order and returns the first lesson whose id
 * is NOT in `completedIds`. Returns null if everything is complete.
 */
export function pickFirstIncompleteLesson(
  curriculum: CurriculumNode[],
  completedIds: Set<string>,
): { moduleSlug: string; lessonSlug: string } | null {
  for (const mod of curriculum) {
    for (const lesson of mod.lessons) {
      if (!completedIds.has(lesson.id)) {
        return { moduleSlug: mod.slug, lessonSlug: lesson.slug };
      }
    }
  }
  return null;
}

/**
 * A song module is locked until every previous song module has an approved
 * submission for the user. Skill modules are never locked. Returns the slug
 * of the song that needs an approved tape, or null if unlocked.
 *
 * (Lesson completion is independently tracked for the sidebar checkmarks
 *  and progress bar, but doesn't gate next-song unlock anymore — only an
 *  approved tape does.)
 */
export function lockedByModuleSlug(
  curriculum: CurriculumNode[],
  moduleSlug: string,
  approvedSubmissionSlugs: Set<string>,
): string | null {
  const moduleIdx = curriculum.findIndex((m) => m.slug === moduleSlug);
  if (moduleIdx === -1) return null;
  const mod = curriculum[moduleIdx];
  if (mod.kind !== "song") return null;

  for (let i = 0; i < moduleIdx; i++) {
    const prev = curriculum[i];
    if (prev.kind !== "song") continue;
    if (!approvedSubmissionSlugs.has(prev.slug)) return prev.slug;
  }
  return null;
}

/**
 * Returns the set of moduleSlugs the user has an approved submission for.
 */
export async function getApprovedSubmissionModuleSlugs(
  userId: string,
): Promise<Set<string>> {
  const rows = await prisma.submission.findMany({
    where: { userId, status: "approved" },
    select: { moduleSlug: true },
  });
  return new Set(rows.map((r) => r.moduleSlug));
}

/**
 * Returns the user's most recent submission for a given module, or null.
 */
export async function getLatestSubmission(userId: string, moduleSlug: string) {
  return prisma.submission.findFirst({
    where: { userId, moduleSlug },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Returns the lesson immediately after (moduleSlug, lessonSlug) in curriculum order,
 * or null if the given lesson is the last one or doesn't exist.
 */
export function pickNextLesson(
  curriculum: CurriculumNode[],
  moduleSlug: string,
  lessonSlug: string,
): { moduleSlug: string; lessonSlug: string } | null {
  const flat: { moduleSlug: string; lessonSlug: string }[] = [];
  for (const mod of curriculum) {
    for (const lesson of mod.lessons) {
      flat.push({ moduleSlug: mod.slug, lessonSlug: lesson.slug });
    }
  }
  const idx = flat.findIndex(
    (entry) => entry.moduleSlug === moduleSlug && entry.lessonSlug === lessonSlug,
  );
  if (idx === -1 || idx === flat.length - 1) return null;
  return flat[idx + 1];
}
