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
pnpm install                      # if pnpm isn't installed: corepack enable --install-directory ~/.local/bin pnpm
cp .env.example .env              # then fill in real values
pnpm db:push                      # creates the tables in Neon
pnpm db:seed                      # populates the curriculum
pnpm dev                          # http://localhost:3000
```

Both Next.js and Prisma read from `.env` (a single file holds DATABASE_URL + Clerk keys + NEXT_PUBLIC_BASE_URL). `.env` is gitignored.

## Editing course content

Edit `prisma/seed.ts` and run `pnpm db:seed` again. The seed is idempotent (upserts by slug) — it preserves user progress and just updates the content.

To add a new song:
1. Add a new module entry to the `curriculum` array in `prisma/seed.ts` with `kind: ModuleKind.song`
2. Fill in lessons (typically: listen, chord progression, strumming pattern, play-along) with their YouTube URLs
3. Run `pnpm db:seed`

## Tests

```bash
pnpm test          # one-shot
pnpm test:watch    # interactive
```

## Routes

- `/` — public landing page (hero + curriculum preview)
- `/sign-in`, `/sign-up` — Clerk auth (modal-mode)
- `/learn` — authenticated; redirects to first incomplete lesson
- `/learn/[moduleSlug]/[lessonSlug]` — lesson view (video + notes + complete button)

## Known follow-ups

- Bump Next.js past 15.1.6 to clear CVE-2025-66478 once we've verified nothing in the conversion broke.
- Replace placeholder YouTube URLs in `prisma/seed.ts` with the real lesson recordings.
- Confirm Song 2's title (currently seeded as "I Will Buy Money").
