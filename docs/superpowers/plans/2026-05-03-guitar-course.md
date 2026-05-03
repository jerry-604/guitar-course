# Guitar Course Site — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the cloned `jerry-604/guitar-course` Sanity-LMS template into a single-instructor, single-course guitar tutorial site backed by Prisma + Neon Postgres, with Clerk auth and Stripe ripped out.

**Architecture:** One Next.js 15 app. Public landing page + Clerk-protected `/learn/**` routes. Content modeled in Prisma (`Module` → `Lesson` → `LessonCompletion`) with no `Course` table — the site IS the course. Content authored via an idempotent `prisma/seed.ts`. Lazy `User` row creation on first authenticated request; no Clerk webhook.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind + shadcn/ui, Clerk (`@clerk/nextjs ^6`), Prisma 6 + `@prisma/client`, Neon Postgres, react-player (YouTube), react-markdown + remark-gfm, pnpm.

**Spec reference:** `docs/superpowers/specs/2026-05-03-guitar-course-design.md`

---

## File Structure

**Created:**

| File | Responsibility |
|---|---|
| `prisma/schema.prisma` | Module / Lesson / LessonCompletion / User schema |
| `prisma/seed.ts` | Idempotent upsert of full curriculum |
| `lib/prisma.ts` | Prisma client singleton (Next.js dev hot-reload safe) |
| `lib/queries/curriculum.ts` | `getCurriculum`, `getLessonByPath`, `getNextLesson`, `getOverallProgress`, `getFirstIncompleteLessonPath` |
| `lib/queries/curriculum.test.ts` | Unit tests for the branching logic in `getFirstIncompleteLessonPath` and `getNextLesson` |
| `app/actions/lessonCompletion.ts` | `completeLesson` / `uncompleteLesson` server actions |
| `app/learn/layout.tsx` | Two-column auth-gated layout with `<Sidebar />` |
| `app/learn/page.tsx` | Redirector to first-incomplete or first lesson |
| `app/learn/[moduleSlug]/[lessonSlug]/page.tsx` | Lesson view (video + notes + complete + next) |
| `components/curriculum/Sidebar.tsx` | Module/lesson tree with completion checkmarks and progress bar |
| `components/curriculum/CurriculumPreview.tsx` | Public landing-page accordion of modules |
| `components/lesson/LessonNotes.tsx` | Markdown renderer (react-markdown + Tailwind typography) |
| `components/lesson/LessonCompleteButton.tsx` | Client component wrapping the complete/uncomplete server actions |
| `components/lesson/NextLessonButton.tsx` | Client/server hybrid for "Next lesson →" |
| `components/landing/Hero.tsx` | Single-course hero (replaces template's multi-course Hero) |
| `vitest.config.ts` | Vitest config for the curriculum.test.ts |

**Modified:**

| File | Change |
|---|---|
| `package.json` | Add Prisma + react-markdown + tsx + vitest deps; remove Sanity/Stripe deps; add prisma seed config; add scripts |
| `.env.example` | Replace Sanity/Stripe vars with `DATABASE_URL` |
| `lib/auth.ts` | Replace Sanity helper with `getOrCreateUser()` |
| `middleware.ts` | Protect `/learn/**` |
| `app/layout.tsx` | Trim header (drop search + dashboard links); keep ClerkProvider, dark mode, fonts |
| `app/(user)/page.tsx` | Move to `app/page.tsx`; rewrite as landing page |
| `next.config.ts` | Allow `img.youtube.com` for thumbnails |
| `README.md` | Rewrite for the new stack and run flow |

**Deleted (full list in Task 1):** the entire `sanity/` tree, `app/(admin)/`, `app/(dashboard)/`, the `app/(user)/courses/`, `my-courses/`, `search/` routes, `actions/createStripeCheckout.ts`, `app/api/stripe-checkout/`, `app/api/draft-mode/`, `lib/stripe.ts`, `lib/courseProgress.ts`, `components/EnrollButton.tsx`, `components/SearchInput.tsx`, `components/CourseCard.tsx`, `components/CourseProgress.tsx`, `components/Hero.tsx`, `components/DisableDraftMode.tsx`, `components/dashboard/`, `app/actions/{complete,uncomplete,getLessonCompletionStatus}LessonAction.ts`, `sanity.config.ts`, `sanity.cli.ts`, `sanity.types.ts`, `sanity-typegen.json`, `schema.json`, `.sanity/`, the existing `pnpm-lock.yaml` (will be regenerated).

---

## Phase A — Strip the template

### Task 1: Delete Sanity, Stripe, and multi-course files

**Files:** Deletions only — see list below.

- [ ] **Step 1: Delete the Sanity layer**

```bash
cd /home/jeremiah_omolewa/guitarcourse

rm -rf sanity .sanity
rm -f sanity.config.ts sanity.cli.ts sanity.types.ts sanity-typegen.json schema.json
rm -rf app/\(admin\)
rm -rf app/api/draft-mode
rm -f components/DisableDraftMode.tsx
```

- [ ] **Step 2: Delete the Stripe layer**

```bash
rm -rf app/api/stripe-checkout
rm -f actions/createStripeCheckout.ts
rmdir actions 2>/dev/null || true
rm -f lib/stripe.ts
rm -f components/EnrollButton.tsx
```

- [ ] **Step 3: Delete the multi-course / dashboard / search UI**

```bash
rm -rf app/\(dashboard\)
rm -rf app/\(user\)/courses
rm -rf app/\(user\)/my-courses
rm -rf app/\(user\)/search
rm -f components/CourseCard.tsx
rm -f components/CourseProgress.tsx
rm -f components/Hero.tsx
rm -f components/SearchInput.tsx
rm -rf components/dashboard
```

- [ ] **Step 4: Delete the old Sanity-backed actions and helpers**

```bash
rm -f app/actions/completeLessonAction.ts
rm -f app/actions/uncompleteLessonAction.ts
rm -f app/actions/getLessonCompletionStatusAction.ts
rm -f lib/courseProgress.ts
```

- [ ] **Step 5: Move the landing page out of `(user)/` so the public homepage lives at `app/page.tsx`**

```bash
mv app/\(user\)/page.tsx app/page.tsx
mv app/\(user\)/loading.tsx app/loading.tsx
rm -f app/\(user\)/layout.tsx
rmdir app/\(user\) 2>/dev/null || true
```

(The contents of `app/page.tsx` will be rewritten in Task 12. We're just relocating the file here.)

- [ ] **Step 6: Verify the structural cleanup**

Run:

```bash
find app components lib -type f \( -name "*.ts" -o -name "*.tsx" \) | sort
```

Expected — these and only these (other than what we keep) should remain in `components/`:

```
components/DarkModeToggle.tsx
components/Header.tsx
components/LessonCompleteButton.tsx
components/LoomEmbed.tsx
components/VideoPlayer.tsx
components/providers/sidebar-provider.tsx
components/theme-provider.tsx
components/ui/...
```

The `app/` tree should contain only `app/layout.tsx`, `app/page.tsx`, `app/loading.tsx`, `app/actions/` (empty), and `app/globals.css` if it exists. If `app/actions/` is now empty, leave it — Task 8 fills it.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: strip Sanity, Stripe, and multi-course UI from template"
```

---

### Task 2: Remove Sanity and Stripe deps from `package.json`

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Rewrite `package.json` so it contains only what we keep**

Replace the entire file with:

```json
{
  "name": "guitar-course",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "postinstall": "prisma generate"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@clerk/nextjs": "^6.10.5",
    "@prisma/client": "^6.2.1",
    "@radix-ui/react-accordion": "^1.2.2",
    "@radix-ui/react-dialog": "^1.1.5",
    "@radix-ui/react-dropdown-menu": "^2.1.5",
    "@radix-ui/react-progress": "^1.1.1",
    "@radix-ui/react-scroll-area": "^1.2.2",
    "@radix-ui/react-slot": "^1.1.1",
    "@radix-ui/react-tooltip": "^1.1.7",
    "@tailwindcss/typography": "^0.5.16",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.474.0",
    "next": "15.1.6",
    "next-themes": "^0.4.4",
    "radix-ui": "^1.1.2",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-markdown": "^9.0.3",
    "react-player": "^2.16.0",
    "remark-gfm": "^4.0.0",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.2.0",
    "@types/node": "^20.17.16",
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "eslint": "^9.19.0",
    "eslint-config-next": "15.1.6",
    "postcss": "^8.5.1",
    "prisma": "^6.2.1",
    "tailwindcss": "^3.4.17",
    "tsx": "^4.19.2",
    "typescript": "^5.7.3",
    "vitest": "^2.1.8"
  }
}
```

What changed: removed `@sanity/*`, `next-sanity`, `groq`, `sanity`, `styled-components`, `stripe`, `@portabletext/react`. Added `@prisma/client`, `prisma`, `react-markdown`, `remark-gfm`, `tsx`, `vitest`. Added `prisma.seed` config and `db:*` + `test*` scripts. Added `postinstall: prisma generate` so `@prisma/client` types stay current.

- [ ] **Step 2: Delete the stale lockfile and reinstall**

```bash
rm -f pnpm-lock.yaml
pnpm install
```

Expected: install completes; `prisma generate` runs as part of postinstall and warns "no schema found" — that's fine, we add the schema in Task 3.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: replace Sanity/Stripe deps with Prisma + react-markdown"
```

---

## Phase B — Prisma + Neon

### Task 3: Define the Prisma schema

**Files:**
- Create: `prisma/schema.prisma`

- [ ] **Step 1: Create `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String             @id // Clerk user id; we don't generate our own
  email       String?
  name        String?
  createdAt   DateTime           @default(now())
  completions LessonCompletion[]
}

model Module {
  id          String     @id @default(cuid())
  slug        String     @unique
  order       Int
  title       String
  kind        ModuleKind
  songTitle   String?
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
  id            String             @id @default(cuid())
  module        Module             @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  moduleId      String
  slug          String
  order         Int
  title         String
  description   String?
  youtubeUrl    String
  notesMarkdown String?
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

- [ ] **Step 2: Verify schema parses**

Run:

```bash
pnpm prisma validate
```

Expected: `The schema at prisma/schema.prisma is valid`.

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(db): add Prisma schema for modules, lessons, completions"
```

---

### Task 4: Configure environment and push schema to Neon

**Files:**
- Create: `.env.local` (NOT committed — `.gitignore` already covers `.env*`)
- Modify: `.env.example`

- [ ] **Step 1: Rewrite `.env.example` to match the new stack**

Replace the entire file with:

```bash
# Postgres (Neon)
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"

# Clerk — https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Next.js
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

- [ ] **Step 2: Create `.env.local` with the credentials Jeremiah provided in chat**

Write to `.env.local` (NOT to git — `.env*` is in `.gitignore`):

```bash
DATABASE_URL="<NEON_CONNECTION_STRING_FROM_CHAT>"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<CLERK_PUBLISHABLE_KEY_FROM_CHAT>
CLERK_SECRET_KEY=<CLERK_SECRET_KEY_FROM_CHAT>
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

The actual values were pasted in conversation by the user — pull them from there at execution time. Do NOT paste them into this plan file or any other file that lives in `git`-tracked source.

- [ ] **Step 3: Push the schema to Neon**

Run:

```bash
pnpm prisma db push
```

Expected output ends with: `Your database is now in sync with your Prisma schema.` and `Generated Prisma Client`.

(We use `db push` instead of `migrate dev` because Neon serverless requires extra config for shadow databases. `db push` is fine for a single-instance project; we can graduate to migrations later.)

- [ ] **Step 4: Verify tables exist via `prisma studio` (optional smoke check)**

```bash
pnpm prisma studio &
sleep 3
kill %1 2>/dev/null
```

Expected: Studio starts on `:5555` (we kill it immediately — we just confirmed connectivity).

- [ ] **Step 5: Commit**

```bash
git add .env.example
git commit -m "chore(env): replace Sanity/Stripe env vars with DATABASE_URL"
```

---

### Task 5: Prisma client singleton

**Files:**
- Create: `lib/prisma.ts`

- [ ] **Step 1: Create `lib/prisma.ts`**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

The global cache prevents Next.js dev's hot-reload from creating a new connection pool on every change (which would exhaust Neon's connection limit).

- [ ] **Step 2: Commit**

```bash
git add lib/prisma.ts
git commit -m "feat(db): add Prisma client singleton"
```

---

### Task 6: Seed the curriculum

**Files:**
- Create: `prisma/seed.ts`

- [ ] **Step 1: Write `prisma/seed.ts`**

```typescript
import { PrismaClient, ModuleKind } from "@prisma/client";

const prisma = new PrismaClient();

type LessonSeed = {
  slug: string;
  title: string;
  description?: string;
  youtubeUrl: string;
  notesMarkdown?: string;
};

type ModuleSeed = {
  slug: string;
  order: number;
  title: string;
  kind: ModuleKind;
  songTitle?: string;
  songArtist?: string;
  description?: string;
  lessons: LessonSeed[];
};

// Placeholder YouTube URL used while real videos are being recorded.
// Any valid YouTube watch URL works; this one is the canonical Rick Roll
// so a "missing video" is at least obvious in dev.
const PLACEHOLDER = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

const curriculum: ModuleSeed[] = [
  {
    slug: "fundamentals",
    order: 10,
    kind: ModuleKind.skill,
    title: "Fundamentals",
    description: "Posture, anatomy of the guitar, how to hold the pick, and your first strums.",
    lessons: [
      {
        slug: "holding-the-guitar",
        title: "Holding the guitar & posture",
        description: "Sitting position, neck angle, where your fretting hand goes.",
        youtubeUrl: PLACEHOLDER,
      },
      {
        slug: "parts-of-the-guitar",
        title: "Parts of the guitar",
        description: "Headstock, nut, frets, body, bridge — what each piece does.",
        youtubeUrl: PLACEHOLDER,
      },
      {
        slug: "picking-and-strumming-basics",
        title: "Picking & basic strumming",
        description: "Holding the pick, downstrokes, upstrokes, keeping a steady pulse.",
        youtubeUrl: PLACEHOLDER,
      },
    ],
  },
  {
    slug: "first-chords-c-g-d",
    order: 20,
    kind: ModuleKind.skill,
    title: "Your first chords — C, G, D",
    description: "Three open chords that unlock thousands of songs.",
    lessons: [
      { slug: "c-major", title: "C major", youtubeUrl: PLACEHOLDER },
      { slug: "g-major", title: "G major", youtubeUrl: PLACEHOLDER },
      { slug: "d-major", title: "D major", youtubeUrl: PLACEHOLDER },
    ],
  },
  {
    slug: "transitions-c-g-d",
    order: 30,
    kind: ModuleKind.skill,
    title: "Chord transitions — C, G, D",
    description: "Moving cleanly between the three chords without losing the beat.",
    lessons: [
      { slug: "c-to-g", title: "C ↔ G", youtubeUrl: PLACEHOLDER },
      { slug: "g-to-d", title: "G ↔ D", youtubeUrl: PLACEHOLDER },
      { slug: "c-g-d-in-time", title: "C ↔ G ↔ D in time", youtubeUrl: PLACEHOLDER },
    ],
  },
  {
    slug: "song-1",
    order: 40,
    kind: ModuleKind.song,
    title: "Song 1 — your first song",
    songTitle: "TBD — to be supplied by instructor",
    songArtist: "TBD",
    description: "Your first complete song using only C, G, and D.",
    lessons: [
      { slug: "listen", title: "Listen / overview", youtubeUrl: PLACEHOLDER },
      { slug: "chord-progression", title: "Chord progression breakdown", youtubeUrl: PLACEHOLDER },
      { slug: "strumming-pattern", title: "Strumming pattern", youtubeUrl: PLACEHOLDER },
      { slug: "play-along", title: "Full play-along", youtubeUrl: PLACEHOLDER },
    ],
  },
  {
    slug: "new-chords-for-song-2",
    order: 50,
    kind: ModuleKind.skill,
    title: "New chords for Song 2",
    description: "Introducing the chords needed for the next song.",
    lessons: [
      { slug: "new-chord-1", title: "New chord 1", youtubeUrl: PLACEHOLDER },
      { slug: "new-chord-2", title: "New chord 2", youtubeUrl: PLACEHOLDER },
    ],
  },
  {
    slug: "transitions-for-song-2",
    order: 60,
    kind: ModuleKind.skill,
    title: "New transitions for Song 2",
    description: "Smoothly moving between the new chords plus the ones you already know.",
    lessons: [
      { slug: "new-transition-1", title: "New transition 1", youtubeUrl: PLACEHOLDER },
      { slug: "new-transition-2", title: "New transition 2", youtubeUrl: PLACEHOLDER },
    ],
  },
  {
    slug: "song-2",
    order: 70,
    kind: ModuleKind.song,
    title: 'Song 2 — "I Will Buy Money"',
    songTitle: "I Will Buy Money", // TODO: confirm song name with instructor
    songArtist: "TBD",
    description: "Your second song — applies the new chords from modules 5 and 6.",
    lessons: [
      { slug: "listen", title: "Listen / overview", youtubeUrl: PLACEHOLDER },
      { slug: "chord-progression", title: "Chord progression breakdown", youtubeUrl: PLACEHOLDER },
      { slug: "strumming-pattern", title: "Strumming pattern", youtubeUrl: PLACEHOLDER },
      { slug: "play-along", title: "Full play-along", youtubeUrl: PLACEHOLDER },
    ],
  },
];

async function main() {
  for (const mod of curriculum) {
    const moduleRow = await prisma.module.upsert({
      where: { slug: mod.slug },
      create: {
        slug: mod.slug,
        order: mod.order,
        title: mod.title,
        kind: mod.kind,
        songTitle: mod.songTitle,
        songArtist: mod.songArtist,
        description: mod.description,
      },
      update: {
        order: mod.order,
        title: mod.title,
        kind: mod.kind,
        songTitle: mod.songTitle,
        songArtist: mod.songArtist,
        description: mod.description,
      },
    });

    for (const [index, lesson] of mod.lessons.entries()) {
      await prisma.lesson.upsert({
        where: {
          moduleId_slug: { moduleId: moduleRow.id, slug: lesson.slug },
        },
        create: {
          moduleId: moduleRow.id,
          slug: lesson.slug,
          order: (index + 1) * 10,
          title: lesson.title,
          description: lesson.description,
          youtubeUrl: lesson.youtubeUrl,
          notesMarkdown: lesson.notesMarkdown,
        },
        update: {
          order: (index + 1) * 10,
          title: lesson.title,
          description: lesson.description,
          youtubeUrl: lesson.youtubeUrl,
          notesMarkdown: lesson.notesMarkdown,
        },
      });
    }
  }

  const moduleCount = await prisma.module.count();
  const lessonCount = await prisma.lesson.count();
  console.log(`Seed complete: ${moduleCount} modules, ${lessonCount} lessons.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 2: Run the seed**

```bash
pnpm db:seed
```

Expected output ends with: `Seed complete: 7 modules, 21 lessons.`

- [ ] **Step 3: Run it a second time to confirm idempotency**

```bash
pnpm db:seed
```

Expected: same output, same counts (no duplicates).

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat(db): seed initial 7-module guitar curriculum"
```

---

## Phase C — Auth helper and middleware

### Task 7: Rewrite `lib/auth.ts` with `getOrCreateUser()`

**Files:**
- Modify: `lib/auth.ts`

- [ ] **Step 1: Replace `lib/auth.ts` entirely with**

```typescript
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Returns the current Clerk userId or null. Cheap — no DB roundtrip.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId ?? null;
}

/**
 * Ensures a User row exists for the currently signed-in Clerk user and returns it.
 * Throws if no one is signed in — callers should ensure auth before calling this.
 */
export async function getOrCreateUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("getOrCreateUser called without a signed-in user");
  }

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (existing) return existing;

  const clerkUser = await currentUser();
  return prisma.user.create({
    data: {
      id: userId,
      email: clerkUser?.emailAddresses[0]?.emailAddress ?? null,
      name:
        [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
        null,
    },
  });
}
```

- [ ] **Step 2: Verify it typechecks**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors related to `lib/auth.ts`. (Other parts of the app may still error from leftover imports — that's fine, later tasks fix those.)

- [ ] **Step 3: Commit**

```bash
git add lib/auth.ts
git commit -m "feat(auth): add lazy getOrCreateUser helper"
```

---

### Task 8: Update middleware to protect `/learn/**`

**Files:**
- Modify: `middleware.ts`

- [ ] **Step 1: Replace `middleware.ts` with**

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/learn(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

`auth.protect()` redirects unauthenticated users to the Clerk sign-in flow.

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat(auth): protect /learn routes via Clerk middleware"
```

---

## Phase D — Server actions and queries

### Task 9: Lesson completion server actions

**Files:**
- Create: `app/actions/lessonCompletion.ts`

- [ ] **Step 1: Create `app/actions/lessonCompletion.ts`**

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";

export async function completeLesson(lessonId: string) {
  const user = await getOrCreateUser();

  await prisma.lessonCompletion.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    create: { userId: user.id, lessonId },
    update: {}, // already complete — no-op
  });

  revalidatePath("/learn", "layout");
}

export async function uncompleteLesson(lessonId: string) {
  const user = await getOrCreateUser();

  await prisma.lessonCompletion.deleteMany({
    where: { userId: user.id, lessonId },
  });

  revalidatePath("/learn", "layout");
}
```

`revalidatePath("/learn", "layout")` invalidates the layout (which renders the sidebar with checkmarks) so the UI updates without a full page reload.

- [ ] **Step 2: Commit**

```bash
git add app/actions/lessonCompletion.ts
git commit -m "feat(actions): add complete/uncomplete lesson server actions"
```

---

### Task 10: Curriculum query helpers — write the failing tests first

**Files:**
- Create: `vitest.config.ts`
- Create: `lib/queries/curriculum.test.ts`

- [ ] **Step 1: Add `vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 2: Write the failing test for `getFirstIncompleteLessonPath` and `getNextLesson`**

These are the two pieces of branching logic that warrant unit tests. We mock the Prisma calls; the query functions accept fixtures so the test doesn't need a DB.

Create `lib/queries/curriculum.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  pickFirstIncompleteLesson,
  pickNextLesson,
  type CurriculumNode,
} from "./curriculum";

const fixture: CurriculumNode[] = [
  {
    id: "m1",
    slug: "m1",
    order: 10,
    title: "Module 1",
    kind: "skill",
    lessons: [
      { id: "l1a", slug: "l1a", order: 10, title: "1A", moduleSlug: "m1" },
      { id: "l1b", slug: "l1b", order: 20, title: "1B", moduleSlug: "m1" },
    ],
  },
  {
    id: "m2",
    slug: "m2",
    order: 20,
    title: "Module 2",
    kind: "song",
    lessons: [
      { id: "l2a", slug: "l2a", order: 10, title: "2A", moduleSlug: "m2" },
    ],
  },
];

describe("pickFirstIncompleteLesson", () => {
  it("returns the first lesson when nothing is complete", () => {
    expect(pickFirstIncompleteLesson(fixture, new Set())).toEqual({
      moduleSlug: "m1",
      lessonSlug: "l1a",
    });
  });

  it("skips completed lessons in order", () => {
    expect(
      pickFirstIncompleteLesson(fixture, new Set(["l1a"])),
    ).toEqual({ moduleSlug: "m1", lessonSlug: "l1b" });
  });

  it("walks into the next module when the current is fully complete", () => {
    expect(
      pickFirstIncompleteLesson(fixture, new Set(["l1a", "l1b"])),
    ).toEqual({ moduleSlug: "m2", lessonSlug: "l2a" });
  });

  it("returns null when everything is complete", () => {
    expect(
      pickFirstIncompleteLesson(fixture, new Set(["l1a", "l1b", "l2a"])),
    ).toBeNull();
  });
});

describe("pickNextLesson", () => {
  it("returns the next lesson within the same module", () => {
    expect(pickNextLesson(fixture, "m1", "l1a")).toEqual({
      moduleSlug: "m1",
      lessonSlug: "l1b",
    });
  });

  it("crosses into the next module when at the last lesson of a module", () => {
    expect(pickNextLesson(fixture, "m1", "l1b")).toEqual({
      moduleSlug: "m2",
      lessonSlug: "l2a",
    });
  });

  it("returns null at the very last lesson", () => {
    expect(pickNextLesson(fixture, "m2", "l2a")).toBeNull();
  });

  it("returns null for an unknown lesson", () => {
    expect(pickNextLesson(fixture, "m1", "nope")).toBeNull();
  });
});
```

- [ ] **Step 3: Run the test to verify it fails (file doesn't exist yet)**

```bash
pnpm test
```

Expected: failures with `Cannot find module './curriculum'` (or similar) — the implementation file is created in Task 11.

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts lib/queries/curriculum.test.ts
git commit -m "test(queries): failing tests for curriculum picker functions"
```

---

### Task 11: Implement `lib/queries/curriculum.ts`

**Files:**
- Create: `lib/queries/curriculum.ts`

- [ ] **Step 1: Create `lib/queries/curriculum.ts`**

```typescript
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
export async function getCompletedLessonIds(userId: string): Promise<Set<string>> {
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
```

- [ ] **Step 2: Run the tests to verify they pass**

```bash
pnpm test
```

Expected: `8 passed` (4 picker tests + 4 next-lesson tests).

- [ ] **Step 3: Commit**

```bash
git add lib/queries/curriculum.ts
git commit -m "feat(queries): curriculum query and picker helpers"
```

---

## Phase E — UI shell

### Task 12: Public landing page

**Files:**
- Modify: `app/page.tsx` (was `app/(user)/page.tsx`)
- Create: `components/landing/Hero.tsx`
- Create: `components/curriculum/CurriculumPreview.tsx`

- [ ] **Step 1: Create `components/landing/Hero.tsx`**

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export function Hero() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        Guitar — beginner to song
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">
        A free, step-by-step course that takes you from holding a guitar for the
        first time to playing real songs all the way through.
      </p>
      <div className="mt-10 flex justify-center gap-4">
        <SignedOut>
          <Button asChild size="lg">
            <Link href="/sign-up">Start learning →</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </SignedOut>
        <SignedIn>
          <Button asChild size="lg">
            <Link href="/learn">Continue learning →</Link>
          </Button>
        </SignedIn>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `components/curriculum/CurriculumPreview.tsx`**

```tsx
import { getCurriculum } from "@/lib/queries/curriculum";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Music } from "lucide-react";

export async function CurriculumPreview() {
  const curriculum = await getCurriculum();

  return (
    <section className="mx-auto max-w-3xl px-4 pb-24">
      <h2 className="text-2xl font-semibold mb-6">What you'll learn</h2>
      <Accordion type="multiple" className="w-full">
        {curriculum.map((mod) => (
          <AccordionItem value={mod.slug} key={mod.slug}>
            <AccordionTrigger>
              <span className="flex items-center gap-2 text-left">
                {mod.kind === "song" && (
                  <Music className="h-4 w-4 text-primary" aria-hidden />
                )}
                <span className="font-medium">{mod.title}</span>
                <span className="text-sm text-muted-foreground">
                  ({mod.lessons.length} lesson{mod.lessons.length === 1 ? "" : "s"})
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              {mod.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {mod.description}
                </p>
              )}
              <ul className="space-y-1 text-sm">
                {mod.lessons.map((l) => (
                  <li key={l.id} className="text-muted-foreground">
                    · {l.title}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
```

- [ ] **Step 3: Replace `app/page.tsx` with**

```tsx
import { Hero } from "@/components/landing/Hero";
import { CurriculumPreview } from "@/components/curriculum/CurriculumPreview";

export default function Home() {
  return (
    <main>
      <Hero />
      <CurriculumPreview />
    </main>
  );
}
```

- [ ] **Step 4: Replace `app/loading.tsx` with a minimal skeleton**

```tsx
import { Loader } from "@/components/ui/loader";

export default function Loading() {
  return (
    <main className="flex min-h-[50vh] items-center justify-center">
      <Loader />
    </main>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/loading.tsx components/landing components/curriculum/CurriculumPreview.tsx
git commit -m "feat(ui): public landing page with hero and curriculum preview"
```

---

### Task 13: Trim `app/layout.tsx` and update `Header`

**Files:**
- Read first: `app/layout.tsx`, `components/Header.tsx`

- [ ] **Step 1: Read both files to understand current contents**

```bash
cat app/layout.tsx components/Header.tsx
```

Identify any imports of `SearchInput`, `CourseCard`, dashboard-only links, or anything Sanity-related.

- [ ] **Step 2: Rewrite `components/Header.tsx`**

```tsx
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { DarkModeToggle } from "@/components/DarkModeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          🎸 Guitar Course
        </Link>
        <nav className="flex items-center gap-2">
          <SignedIn>
            <Button asChild variant="ghost" size="sm">
              <Link href="/learn">Continue learning</Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">Sign in</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm">Sign up</Button>
            </SignUpButton>
          </SignedOut>
          <DarkModeToggle />
        </nav>
      </div>
    </header>
  );
}
```

If the existing file uses `export default Header`, switch the export style to match Hero/CurriculumPreview (`export function Header`). Also drop any imports that no longer resolve (e.g. `SearchInput`).

- [ ] **Step 3: Update `app/layout.tsx`**

Read the current file, then ensure it:
- Updates `metadata.title` to `"Guitar Course"` and `metadata.description` to `"Free, step-by-step guitar lessons from beginner to song."`
- Wraps everything in `<ClerkProvider>` (already present)
- Renders `<Header />` above `{children}`
- Keeps `next-themes`' `ThemeProvider`
- Removes any `<DraftMode />`, `<SanityLive />`, or other Sanity-specific wrappers
- Imports `Header` from `@/components/Header`

The body should look like:

```tsx
<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
  <ClerkProvider>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Header />
      {children}
    </ThemeProvider>
  </ClerkProvider>
</body>
```

- [ ] **Step 4: Run dev server and load the homepage**

```bash
pnpm dev &
DEV_PID=$!
sleep 6
curl -sf -o /dev/null -w "%{http_code}\n" http://localhost:3000
kill $DEV_PID
```

Expected: `200`. If non-200, read the dev server output for the error and fix before committing.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx components/Header.tsx
git commit -m "feat(ui): rewrite header for single-course site"
```

---

### Task 14: Learning sidebar component

**Files:**
- Create: `components/curriculum/Sidebar.tsx`
- Create: `components/curriculum/SidebarLessonRow.tsx`

- [ ] **Step 1: Create the client-only lesson row**

`components/curriculum/SidebarLessonRow.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  title: string;
  isComplete: boolean;
};

export function SidebarLessonRow({ href, title, isComplete }: Props) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded px-2 py-1 text-sm",
        isActive
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent/50 text-muted-foreground",
      )}
    >
      {isComplete ? (
        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
      ) : (
        <Circle className="h-4 w-4 shrink-0" />
      )}
      <span className="truncate">{title}</span>
    </Link>
  );
}
```

The active highlight relies on `usePathname()`, which only works in client components. By isolating it to this tiny row, the rest of the sidebar (data fetching + layout chrome) stays server-rendered.

- [ ] **Step 2: Create `components/curriculum/Sidebar.tsx`**

```tsx
import { Music } from "lucide-react";
import { getCurriculum } from "@/lib/queries/curriculum";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SidebarLessonRow } from "./SidebarLessonRow";

type Props = {
  completedLessonIds: Set<string>;
  fraction: number;
};

export async function Sidebar({ completedLessonIds, fraction }: Props) {
  const curriculum = await getCurriculum();
  const pct = Math.round(fraction * 100);

  return (
    <aside className="w-72 shrink-0 border-r bg-muted/30">
      <div className="px-4 py-4 border-b">
        <div className="text-xs font-medium text-muted-foreground mb-2">
          Your progress — {pct}%
        </div>
        <Progress value={pct} />
      </div>
      <ScrollArea className="h-[calc(100vh-8.5rem)]">
        <nav className="px-2 py-3">
          {curriculum.map((mod) => (
            <div key={mod.slug} className="mb-4">
              <div
                className={cn(
                  "flex items-center gap-2 px-2 py-1 text-sm font-semibold",
                  mod.kind === "song" && "text-primary",
                )}
              >
                {mod.kind === "song" && (
                  <Music className="h-3.5 w-3.5" aria-hidden />
                )}
                <span>{mod.title}</span>
              </div>
              <ul className="mt-1 space-y-0.5">
                {mod.lessons.map((l) => (
                  <li key={l.id}>
                    <SidebarLessonRow
                      href={`/learn/${mod.slug}/${l.slug}`}
                      title={l.title}
                      isComplete={completedLessonIds.has(l.id)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/curriculum/Sidebar.tsx components/curriculum/SidebarLessonRow.tsx
git commit -m "feat(ui): learning sidebar with progress and active-row highlighting"
```

---

### Task 15: `/learn` layout and redirector

**Files:**
- Create: `app/learn/layout.tsx`
- Create: `app/learn/page.tsx`

- [ ] **Step 1: Create `app/learn/layout.tsx`**

```tsx
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
      <Sidebar
        completedLessonIds={completed}
        fraction={progress.fraction}
      />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
```

(The middleware already protects `/learn/**`, but we belt-and-suspenders the redirect to handle the edge case where middleware is bypassed. Active-row highlighting in the sidebar is handled by `SidebarLessonRow`'s `usePathname()` — the layout doesn't need to know which lesson is active.)

- [ ] **Step 2: Create `app/learn/page.tsx` (the redirector)**

```tsx
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
```

- [ ] **Step 3: Commit**

```bash
git add app/learn/layout.tsx app/learn/page.tsx
git commit -m "feat(learn): /learn layout with sidebar and redirector"
```

---

### Task 16: Lesson view page + complete/next buttons + notes renderer

**Files:**
- Create: `components/lesson/LessonNotes.tsx`
- Create: `components/lesson/LessonCompleteButton.tsx`
- Create: `components/lesson/NextLessonButton.tsx`
- Create: `app/learn/[moduleSlug]/[lessonSlug]/page.tsx`

- [ ] **Step 1: Create `components/lesson/LessonNotes.tsx`**

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function LessonNotes({ markdown }: { markdown: string }) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/lesson/LessonCompleteButton.tsx`**

```tsx
"use client";

import { useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  completeLesson,
  uncompleteLesson,
} from "@/app/actions/lessonCompletion";

type Props = {
  lessonId: string;
  isComplete: boolean;
};

export function LessonCompleteButton({ lessonId, isComplete }: Props) {
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      if (isComplete) {
        await uncompleteLesson(lessonId);
      } else {
        await completeLesson(lessonId);
      }
    });
  };

  return (
    <Button
      onClick={onClick}
      disabled={isPending}
      variant={isComplete ? "outline" : "default"}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isComplete ? (
        <Check className="mr-2 h-4 w-4" />
      ) : null}
      {isComplete ? "Completed — undo" : "Mark as complete"}
    </Button>
  );
}
```

- [ ] **Step 3: Create `components/lesson/NextLessonButton.tsx`**

```tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  next: { moduleSlug: string; lessonSlug: string } | null;
};

export function NextLessonButton({ next }: Props) {
  if (!next) {
    return (
      <Button disabled variant="ghost">
        You&apos;ve reached the end 🎉
      </Button>
    );
  }
  return (
    <Button asChild variant="outline">
      <Link href={`/learn/${next.moduleSlug}/${next.lessonSlug}`}>
        Next lesson <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );
}
```

- [ ] **Step 4: Create the lesson page `app/learn/[moduleSlug]/[lessonSlug]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import {
  getCurriculum,
  getLessonByPath,
  getCompletedLessonIds,
  pickNextLesson,
} from "@/lib/queries/curriculum";
import { getOrCreateUser } from "@/lib/auth";
import { LessonNotes } from "@/components/lesson/LessonNotes";
import { LessonCompleteButton } from "@/components/lesson/LessonCompleteButton";
import { NextLessonButton } from "@/components/lesson/NextLessonButton";

// react-player must be client-only — Next 15's RSC will otherwise complain about window access.
const VideoPlayer = dynamic(() => import("@/components/VideoPlayer"), {
  ssr: false,
  loading: () => (
    <div className="aspect-video w-full bg-muted animate-pulse rounded-md" />
  ),
});

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
```

- [ ] **Step 5: Verify `components/VideoPlayer.tsx` exports a default that accepts `{ url }`**

```bash
cat components/VideoPlayer.tsx
```

If its prop signature differs (e.g. it expects a Sanity asset object instead of a plain URL), edit it to accept `{ url }: { url: string }` and pass it straight to `react-player`'s `<ReactPlayer url={url} controls width="100%" height="auto" />`. Replace the file body with:

```tsx
"use client";

import ReactPlayer from "react-player/lazy";

export default function VideoPlayer({ url }: { url: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-black">
      <ReactPlayer
        url={url}
        controls
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
      />
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/lesson app/learn/\[moduleSlug\] components/VideoPlayer.tsx
git commit -m "feat(learn): lesson view with video, notes, complete and next buttons"
```

---

## Phase F — Final cleanup and verification

### Task 17: Update README and `next.config.ts`

**Files:**
- Modify: `README.md`
- Modify: `next.config.ts`

- [ ] **Step 1: Replace `README.md` with**

```markdown
# Guitar Course

A free, single-instructor guitar course site. Beginner-to-song in one curated linear curriculum.

## Stack

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Clerk (auth)
- Prisma + Neon Postgres
- react-player (YouTube embeds)

## Local development

```bash
pnpm install
cp .env.example .env.local        # then fill in real values
pnpm db:push                      # creates the tables in Neon
pnpm db:seed                      # populates the curriculum
pnpm dev                          # http://localhost:3000
```

## Editing course content

Edit `prisma/seed.ts` and run `pnpm db:seed` again. The seed is idempotent
(upserts by slug) — it preserves user progress and just updates the content.

## Tests

```bash
pnpm test          # one-shot
pnpm test:watch    # interactive
```
```

- [ ] **Step 2: Update `next.config.ts` to allow YouTube thumbnail images**

Read current contents, then ensure it includes:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 3: Commit**

```bash
git add README.md next.config.ts
git commit -m "docs: rewrite README for new stack; allow YouTube image hosts"
```

---

### Task 18: Build, typecheck, and smoke-test the running app

**Files:** none

- [ ] **Step 1: Typecheck**

```bash
pnpm exec tsc --noEmit
```

Expected: zero errors. If errors reference deleted Sanity files, search-and-grep for any remaining imports and remove them.

- [ ] **Step 2: Lint**

```bash
pnpm lint
```

Expected: clean. Fix any errors before proceeding.

- [ ] **Step 3: Production build**

```bash
pnpm build
```

Expected: `✓ Compiled successfully` and a route map listing `/`, `/learn`, `/learn/[moduleSlug]/[lessonSlug]`. Investigate any "module not found" errors.

- [ ] **Step 4: Run tests**

```bash
pnpm test
```

Expected: all curriculum tests pass.

- [ ] **Step 5: Manual smoke test**

```bash
pnpm dev &
DEV_PID=$!
sleep 6
echo "----- Landing page (expect 200): -----"
curl -sf -o /dev/null -w "%{http_code}\n" http://localhost:3000
echo "----- /learn redirects (expect 307 or 302 to sign-in): -----"
curl -sI http://localhost:3000/learn | head -1
kill $DEV_PID
```

Then in a browser:
1. Visit `http://localhost:3000` → see the hero and curriculum accordion.
2. Click "Start learning" → Clerk sign-up modal/page appears.
3. Sign up → land on a lesson page (the first one).
4. Click "Mark as complete" → button flips to "Completed — undo"; sidebar checkmark appears next to the current lesson; progress bar nudges up.
5. Click "Next lesson" → next lesson loads.
6. Sign out via the user button → land back on the public homepage.

Report any deviation from the above and fix before finalizing.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup and verification" --allow-empty
```

---

## Done

Site is functional with placeholder YouTube URLs. Two follow-up content tasks for the user (not part of this plan):

1. Provide Song 1 name + YouTube link for each of its 4 lessons → I patch `prisma/seed.ts` and run `pnpm db:seed`.
2. Confirm Song 2's actual title (currently "I Will Buy Money" per dictation; flag for verification) and the chord/transition list for modules 5 and 6.
