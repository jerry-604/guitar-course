# Guitar Course Site — Design Spec

**Date:** 2026-05-03
**Author:** Claude (with Jeremiah)
**Status:** Approved (user delegated all remaining decisions)

## 1. Purpose

A free, single-instructor guitar course site that takes a complete beginner from "I've never held a guitar" to playing real songs. The site has one curated linear curriculum: foundational skills first, then chord shapes, then transitions, then a song that uses those skills. New songs introduce new chords/transitions, repeating the pattern.

**Out of scope:** course catalog, multiple instructors, payments, search, certificates, comments/social, mobile app, native chord-diagram rendering.

## 2. Starting point and stack changes

We're starting from the cloned `jerry-604/guitar-course` repo (a Papareact LMS template built on Next.js 15 + Sanity + Clerk + Stripe). We're keeping the Next.js + Tailwind + shadcn shell and the Clerk integration, then making three large changes:

1. **Replace Sanity with Prisma + Neon Postgres.** Single source of truth for all content lives in Postgres, defined in `prisma/schema.prisma`, populated via `prisma/seed.ts`. No CMS UI.
2. **Remove Stripe entirely.** The course is free; remove the checkout action, webhook route, `EnrollButton`, `lib/stripe.ts`, the Stripe dep, and all enrollment-gated rendering.
3. **Collapse the multi-course / multi-instructor model down to a single course.** No `Course` table — the site IS the course. Drop categories, instructors, search, my-courses, course catalog routes.

## 3. Content model

There is one course (the site). It has ordered modules. Each module has ordered lessons. There are two kinds of modules:

- `skill` — teaches a foundational concept (e.g. "Open Chords: C, G, D")
- `song` — a milestone module that culminates skills from the modules before it (e.g. "Song 1 — Wonderwall")

Module `kind` is purely cosmetic in the data model; the UI uses it to render songs as visual milestones (different card treatment, 🎸 icon, "Song unlocked" feel).

### Prisma schema

```prisma
model User {
  id        String   @id          // Clerk userId; we don't generate our own
  email     String?
  name      String?
  createdAt DateTime @default(now())
  completions LessonCompletion[]
}

model Module {
  id          String   @id @default(cuid())
  slug        String   @unique
  order       Int                       // sort hint, not unique — gaps allowed (10, 20, 30) so we can insert later
  title       String
  kind        ModuleKind                // "skill" or "song"
  songTitle   String?                   // populated only when kind = "song"
  songArtist  String?
  description String?
  lessons     Lesson[]

  @@index([order])
}

enum ModuleKind {
  skill
  song
}

model Lesson {
  id            String   @id @default(cuid())
  module        Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  moduleId      String
  slug          String
  order         Int
  title         String
  description   String?
  youtubeUrl    String
  notesMarkdown String?  // optional written notes per lesson, rendered with react-markdown
  completions   LessonCompletion[]

  @@unique([moduleId, slug])
  @@index([moduleId, order])
}

model LessonCompletion {
  id          String   @id @default(cuid())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      String
  lesson      Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  lessonId    String
  completedAt DateTime @default(now())

  @@unique([userId, lessonId])
}
```

### Why no Course table?

There is exactly one course. Adding a `Course` row that everything FK's to would be ceremonial overhead for no flexibility. If a second course ever shows up, we add the table then — that's a 30-minute migration, not a foundational design choice we have to make up front.

## 4. Authoring model

Content lives in `prisma/seed.ts` as plain TypeScript. To add a song, edit the seed file and run `pnpm prisma db seed`. The seed is **idempotent**: it upserts modules and lessons by `slug`, so re-running it adds new content and updates existing content without duplicating or losing user progress.

No admin UI. The instructor (Jeremiah) and the developer (Claude) are the same workflow — "tell me the song and YouTube link" → "edit seed.ts" → "re-seed." If a non-developer instructor ever needs to edit content, an admin route can be added later without changing the data model.

## 5. Auth and access

Clerk handles all auth. Configuration:

- **Public routes:** `/` (landing page with course pitch + curriculum preview), `/sign-in`, `/sign-up`.
- **Protected routes:** Everything under `/learn/**`. Visiting any `/learn/*` route while signed-out redirects to sign-in.
- **No role system.** All signed-in users are students. The "admin" is whoever has DB access, not a Clerk role.
- **User row sync:** Lazy. A `getOrCreateUser()` helper in `lib/auth.ts` runs at the top of any server action / authenticated page render. It calls Clerk's `auth()`, then upserts a `User` row keyed by Clerk's `userId`. No webhook, no extra infra.

## 6. Routes

```
/                                       public landing — hero + curriculum preview + sign-up CTA
/sign-in, /sign-up                      Clerk auth
/learn                                  authenticated — redirects to first incomplete lesson, or first lesson if none completed
/learn/[moduleSlug]/[lessonSlug]        the lesson view (video + notes + complete button + nav)
```

That's it. Four routes. Everything else from the template gets deleted.

## 7. UI

### Landing page (`/`)

- Hero: course title ("Guitar — Beginner to Song"), one-sentence pitch, "Start learning →" button (sign-up).
- Curriculum preview: collapsible accordion of all modules with lesson counts. No content is gated visually — visitors can see what's inside, they just need to sign up to watch.
- Footer: minimal.

### Learning view (`/learn/[moduleSlug]/[lessonSlug]`)

Two-column layout:

- **Sidebar (left, sticky):** Overall progress bar at top. Below it, a vertical list of all modules. Each module shows its lessons indented underneath, each with a completion checkmark when done. Skill modules and song modules render with different styling — songs get a 🎸 icon and a slight visual lift (tinted background, badge) to feel like milestones.
- **Main (right):** Video player (react-player on YouTube URL), lesson title, lesson description, notes (markdown rendered with react-markdown), then a row at the bottom with "Mark as complete" and "Next lesson →" buttons.

Sidebar collapses to a hamburger sheet on mobile (the template's `Sheet` shadcn primitive already handles this).

### `/learn` (no module/lesson specified)

Server-side: look up the user's completions, find the first incomplete lesson in module/lesson order, redirect there. If everything is complete, redirect to the very last lesson. If the user has zero completions, redirect to module-1/lesson-1.

## 8. Server actions

Two server actions, both in `app/actions/`:

- `completeLesson(lessonId: string)` — upserts a `LessonCompletion` for `(currentUserId, lessonId)`. Revalidates the lesson path and the sidebar's progress data.
- `uncompleteLesson(lessonId: string)` — deletes the matching row. Same revalidation.

Both call `getOrCreateUser()` first to ensure the User row exists.

## 9. Initial seed content

The seed file scaffolds the curriculum below. Songs use placeholder YouTube URLs and `TODO` titles where the user hasn't supplied them yet — the user can hand me song names + links and I'll patch the seed.

```
Module 1 (skill):  Fundamentals
  - Holding the guitar / posture
  - Parts of the guitar
  - Picking & basic strumming

Module 2 (skill):  Open Chords — C, G, D
  - C major
  - G major
  - D major

Module 3 (skill):  Chord Transitions
  - C ↔ G
  - G ↔ D
  - C ↔ G ↔ D in time

Module 4 (song):   Song 1 — TBD (uses C, G, D)        [user to provide name + link]
  - Listen / overview
  - Chord progression breakdown
  - Strumming pattern
  - Full play-along

Module 5 (skill):  New Chords for Song 2              [chord list TBD based on song]
Module 6 (skill):  New Transitions for Song 2
Module 7 (song):   Song 2 — "I Will Buy Money"        [user said this; flag for confirmation]
  - Listen / overview
  - Chord progression breakdown
  - Strumming pattern
  - Full play-along
```

Two open content gaps: (a) Song 1's title and YouTube link, (b) confirmation that "I Will Buy Money" is the actual song name (likely a transcription artifact). Both can be patched into the seed later without schema changes.

## 10. What we delete from the template

**Sanity (entire CMS layer):**
- `sanity/`, `app/(admin)/`, `.sanity/`, `sanity.config.ts`, `sanity.cli.ts`, `sanity.types.ts`, `schema.json`, `sanity-typegen.json`
- `app/api/draft-mode/`, `components/DisableDraftMode.tsx`
- Deps: `@sanity/*`, `next-sanity`, `groq`, `styled-components`

**Stripe:**
- `actions/createStripeCheckout.ts`, `app/api/stripe-checkout/`, `lib/stripe.ts`, `components/EnrollButton.tsx`
- Dep: `stripe`

**Multi-course / catalog UI:**
- `app/(user)/courses/[slug]/`, `app/(user)/my-courses/`, `app/(user)/search/`
- `components/CourseCard.tsx`, `components/SearchInput.tsx`, `components/Hero.tsx` (rewrite)
- `app/(dashboard)/dashboard/courses/[courseId]/` (collapse to `/learn`)

**Old data-access layer:**
- All of `sanity/lib/courses/`, `sanity/lib/lessons/`, `sanity/lib/student/`
- `app/actions/completeLessonAction.ts`, `getLessonCompletionStatusAction.ts`, `uncompleteLessonAction.ts` (rewrite as Prisma-backed)
- `lib/courseProgress.ts` (rewrite for single course)
- `lib/auth.ts` (rewrite to use `getOrCreateUser()`)

## 11. What we add

- `prisma/schema.prisma` — schema above
- `prisma/seed.ts` — content above
- `lib/prisma.ts` — Prisma client singleton (handles Next.js dev-mode hot-reload connection leak)
- `lib/queries/curriculum.ts` — `getCurriculum()`, `getLessonBySlug()`, `getNextLesson()`, `getOverallProgress()`
- `app/actions/lessonCompletion.ts` — `completeLesson` / `uncompleteLesson` server actions
- `components/LessonNotes.tsx` — markdown renderer (react-markdown + Tailwind typography)
- Rewritten `components/Hero.tsx` — single-course landing hero
- Rewritten `components/dashboard/Sidebar.tsx` — single-course sidebar with module/lesson tree

## 12. Dependencies

**Add:** `prisma`, `@prisma/client`, `react-markdown`, `remark-gfm`
**Remove:** `@sanity/client`, `@sanity/image-url`, `@sanity/preview-url-secret`, `@sanity/vision`, `next-sanity`, `groq`, `sanity`, `styled-components`, `stripe`, `@portabletext/react`

## 13. Environment

```
DATABASE_URL="postgresql://neondb_owner:...@ep-proud-sun-am59e22x.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

`.env.example` gets rewritten to match. `.env.local` gets the real values from the user.

## 14. Local-run flow

```
pnpm install
pnpm prisma migrate dev    # creates the tables in Neon
pnpm prisma db seed        # populates the curriculum
pnpm dev
```

Visit http://localhost:3000 → sign up via Clerk → land on `/learn` → first lesson plays.

## 15. Open items (none blocking implementation)

- Song 1 name + YouTube link (placeholder in seed; patch when provided)
- Song 2 name confirmation (seeded as "I Will Buy Money" per user's wording; will confirm)
- Module 5/6 chord and transition lists (depend on Song 2)
- Marketing copy on the landing hero (placeholder; user can refine)
