import { PrismaClient, ModuleKind } from "@prisma/client";

const prisma = new PrismaClient();

type LessonSeed = {
  slug: string;
  title: string;
  description?: string;
  videoUrl: string;
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
  coverImageUrl?: string;
  lessons: LessonSeed[];
};

// All assets live on Cloudflare R2 served through a custom domain
// (videos.thanielguitarlessons.com). Cert is Cloudflare's Universal SSL on
// our own domain — no school-WiFi MITM, no Vercel Blob storage caps,
// AND R2 doesn't bill egress so the bandwidth is effectively free.
const CDN = "https://videos.thanielguitarlessons.com";

const curriculum: ModuleSeed[] = [
  {
    slug: "fundamentals",
    order: 10,
    kind: ModuleKind.skill,
    title: "Fundamentals",
    description:
      "Your very first guitar lesson. We start from zero — sitting position, where your hands go, how to make your first sound.",
    lessons: [
      {
        slug: "your-first-lesson",
        title: "Your first guitar lesson",
        description:
          "Kevin Nickens walks you through everything a complete beginner needs to know to make their first chord ring out.",
        videoUrl: `${CDN}/Your%20First%20Guitar%20Lesson%20-%20Beginner%20Lesson%201%20-%20Kevin%20Nickens%20%281080p%2C%20h264%2C%20youtube%29.mp4`,
      },
    ],
  },
  {
    slug: "open-chords",
    order: 20,
    kind: ModuleKind.skill,
    title: "Open chords — D, G, C",
    description:
      "Three open chords in the order that makes them easiest to learn: start with D (only three fingers, top three strings), graduate to G (your country workhorse), finish with C (the long stretch).",
    lessons: [
      {
        slug: "d-major",
        title: "D major",
        description:
          "Start here. JustinGuitar's super-easy D chord lesson — three fingers, top three strings, and you're already making music.",
        videoUrl: `${CDN}/Super%20Easy%20First%20Guitar%20Lesson%20-%20Guitar%20Lessons%20For%20Beginners%20-%20Stage%201%20-%20The%20D%20Chord%20-%20JustinGuitar%20%28720p%2C%20h264%2C%20youtube%29.mp4`,
      },
      {
        slug: "g-major",
        title: "G major",
        description:
          "Good Guitarist breaks down G — the workhorse chord of country music. After D, this one's a confidence boost.",
        videoUrl: `${CDN}/Learn%20the%20G%20Chord%20-%20Good%20Guitarist%20%281080p%2C%20h264%2C%20youtube%29.mp4`,
      },
      {
        slug: "c-major",
        title: "C major",
        description:
          "Last and trickiest. JustinGuitar's classic walkthrough — finger placement matters more than speed. Take your time.",
        videoUrl: `${CDN}/C%20Chord%20-%20Guitar%20For%20Beginners%20-%20Stage%203%20Guitar%20Lesson%20-%20JustinGuitar%20%5BBC-132%5D%20-%20JustinGuitar%20%28720p%2C%20h264%2C%20youtube%29.mp4`,
      },
    ],
  },
  {
    slug: "chord-transitions",
    order: 30,
    kind: ModuleKind.skill,
    title: "Chord transitions",
    description:
      "Knowing the shapes isn't enough — you need to switch between them in time. Ordered easy-to-hard so each drill builds on the last.",
    lessons: [
      {
        slug: "d-to-g",
        title: "D ↔ G transition",
        description:
          "Start here. D and G share anchor points and live next to each other in countless beginner songs. The most forgiving switch you can practice.",
        videoUrl: `${CDN}/Chord%20Switching%20Practice%20-%20G%20to%20D%20%20Easy%20Beginner%20Guitar%20Lessons%20-%20Good%20Guitarist%20%281080p%2C%20h264%2C%20youtube%29.mp4`,
      },
      {
        slug: "g-to-c",
        title: "G ↔ C transition",
        description:
          "Step up. There's a shared note on the second string — once you find that anchor, this gets fast.",
        videoUrl: `${CDN}/Chord%20Switching%20Practice%20-%20C%20to%20G%20-%20Good%20Guitarist%20%281080p%2C%20h264%2C%20youtube%29.mp4`,
      },
      {
        slug: "c-to-d",
        title: "C ↔ D transition",
        description:
          "Hardest of the three — your whole hand has to reshape and travel. Slow it down. Speed comes later.",
        videoUrl: `${CDN}/Chord%20Switching%20Practice%20-%20C%20to%20D%20-%20Good%20Guitarist%20%281080p%2C%20h264%2C%20youtube%29.mp4`,
      },
    ],
  },
  {
    slug: "song-cowboy-rides-away",
    order: 40,
    kind: ModuleKind.song,
    title: "Song — The Cowboy Rides Away",
    songTitle: "The Cowboy Rides Away",
    songArtist: "George Strait",
    description:
      "Your first complete song. C, G, and D — exactly what you've been practicing. Dad Rock Dojo's easy-strum version.",
    coverImageUrl: `${CDN}/first-song-cover.png`,
    lessons: [
      {
        slug: "tutorial",
        title: "Full tutorial — easy strum version",
        description:
          "Dad Rock Dojo walks you through the entire song from intro to outro. Slow strumming, perfect for your first song.",
        videoUrl: `${CDN}/The%20Cowboy%20Rides%20Away%20Guitar%20Lesson%20%20Easy%20Strum%20Version%20-%20Dad%20Rock%20Dojo%20%28720p%2C%20h264%2C%20youtube%29.mp4`,
      },
    ],
  },
  {
    slug: "song-amarillo-by-morning",
    order: 50,
    kind: ModuleKind.song,
    title: "Song — Amarillo by Morning",
    songTitle: "Amarillo by Morning",
    songArtist: "George Strait",
    description:
      "Ready after grading. Send Jeremiah a tape of you playing The Cowboy Rides Away — once it gets the green light, the Amarillo by Morning chord breakdown unlocks here.",
    coverImageUrl: `${CDN}/second-song-cover.png`,
    lessons: [
      {
        slug: "submit-your-tape",
        title: "Submit your tape to unlock",
        description:
          "Record yourself playing The Cowboy Rides Away from start to finish, send it through, and once it's reviewed Amarillo by Morning's tutorial appears here.",
        videoUrl: `${CDN}/motivation-2.mp4`,
      },
    ],
  },
];

async function main() {
  // Delete lessons whose (module, slug) is no longer in the seed.
  // This handles renames and removals across reseeds.
  const seedKeys = new Set<string>();
  for (const m of curriculum) {
    for (const l of m.lessons) seedKeys.add(`${m.slug}::${l.slug}`);
  }

  const allLessons = await prisma.lesson.findMany({
    select: { id: true, slug: true, module: { select: { slug: true } } },
  });
  const orphanIds = allLessons
    .filter((l) => !seedKeys.has(`${l.module.slug}::${l.slug}`))
    .map((l) => l.id);
  if (orphanIds.length > 0) {
    await prisma.lesson.deleteMany({ where: { id: { in: orphanIds } } });
    console.log(`Removed ${orphanIds.length} orphan lesson(s).`);
  }

  // Delete modules whose slug is no longer in the seed.
  const moduleSlugs = new Set(curriculum.map((m) => m.slug));
  const allModules = await prisma.module.findMany({ select: { id: true, slug: true } });
  const orphanModuleIds = allModules
    .filter((m) => !moduleSlugs.has(m.slug))
    .map((m) => m.id);
  if (orphanModuleIds.length > 0) {
    await prisma.module.deleteMany({ where: { id: { in: orphanModuleIds } } });
    console.log(`Removed ${orphanModuleIds.length} orphan module(s).`);
  }

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
        coverImageUrl: mod.coverImageUrl,
      },
      update: {
        order: mod.order,
        title: mod.title,
        kind: mod.kind,
        songTitle: mod.songTitle,
        songArtist: mod.songArtist,
        description: mod.description,
        coverImageUrl: mod.coverImageUrl,
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
          youtubeUrl: lesson.videoUrl,
          notesMarkdown: lesson.notesMarkdown,
        },
        update: {
          order: (index + 1) * 10,
          title: lesson.title,
          description: lesson.description,
          youtubeUrl: lesson.videoUrl,
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
