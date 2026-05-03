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
    description:
      "Posture, anatomy of the guitar, how to hold the pick, and your first strums.",
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
      {
        slug: "chord-progression",
        title: "Chord progression breakdown",
        youtubeUrl: PLACEHOLDER,
      },
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
    description:
      "Smoothly moving between the new chords plus the ones you already know.",
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
      {
        slug: "chord-progression",
        title: "Chord progression breakdown",
        youtubeUrl: PLACEHOLDER,
      },
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
