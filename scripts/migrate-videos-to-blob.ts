/**
 * One-shot migration: pull every video and cover image from R2, push to
 * Vercel Blob. Streams the bytes through this VM (no disk buffering),
 * uses fixed (no-random-suffix) names so seed.ts can hardcode the
 * resulting URLs and we get clean human-readable paths.
 *
 * Run:  BLOB_READ_WRITE_TOKEN=... pnpm migrate:videos
 * Outputs a TypeScript snippet at the end that you can paste into seed.ts /
 * Hero.tsx / WatchThisFirst.tsx as the new BLOB_BASE constant + filenames.
 */
import { put } from "@vercel/blob";

const R2_BASE =
  "https://pub-3410e1e40f1a47128a7371ab17d56ad3.r2.dev";

// (R2 source filename, target Blob filename) — Blob filenames are short and
// kebab-cased so URLs stay clean and the seed file stays readable.
const ITEMS: { r2: string; blob: string }[] = [
  // Lesson videos
  {
    r2: "Your%20First%20Guitar%20Lesson%20-%20Beginner%20Lesson%201%20-%20Kevin%20Nickens%20%281080p%2C%20h264%2C%20youtube%29.mp4",
    blob: "lessons/your-first-lesson.mp4",
  },
  {
    r2: "Super%20Easy%20First%20Guitar%20Lesson%20-%20Guitar%20Lessons%20For%20Beginners%20-%20Stage%201%20-%20The%20D%20Chord%20-%20JustinGuitar%20%28720p%2C%20h264%2C%20youtube%29.mp4",
    blob: "lessons/d-major.mp4",
  },
  {
    r2: "Learn%20the%20G%20Chord%20-%20Good%20Guitarist%20%281080p%2C%20h264%2C%20youtube%29.mp4",
    blob: "lessons/g-major.mp4",
  },
  {
    r2: "C%20Chord%20-%20Guitar%20For%20Beginners%20-%20Stage%203%20Guitar%20Lesson%20-%20JustinGuitar%20%5BBC-132%5D%20-%20JustinGuitar%20%28720p%2C%20h264%2C%20youtube%29.mp4",
    blob: "lessons/c-major.mp4",
  },
  {
    r2: "Chord%20Switching%20Practice%20-%20G%20to%20D%20%20Easy%20Beginner%20Guitar%20Lessons%20-%20Good%20Guitarist%20%281080p%2C%20h264%2C%20youtube%29.mp4",
    blob: "lessons/transition-d-to-g.mp4",
  },
  {
    r2: "Chord%20Switching%20Practice%20-%20C%20to%20G%20-%20Good%20Guitarist%20%281080p%2C%20h264%2C%20youtube%29.mp4",
    blob: "lessons/transition-g-to-c.mp4",
  },
  {
    r2: "Chord%20Switching%20Practice%20-%20C%20to%20D%20-%20Good%20Guitarist%20%281080p%2C%20h264%2C%20youtube%29.mp4",
    blob: "lessons/transition-c-to-d.mp4",
  },
  {
    r2: "The%20Cowboy%20Rides%20Away%20Guitar%20Lesson%20%20Easy%20Strum%20Version%20-%20Dad%20Rock%20Dojo%20%28720p%2C%20h264%2C%20youtube%29.mp4",
    blob: "lessons/cowboy-rides-away.mp4",
  },

  // Motivation videos (homepage)
  { r2: "motivation-1.mp4", blob: "motivation-1.mp4" },
  { r2: "motivation-2.mp4", blob: "motivation-2.mp4" },

  // Cover images
  { r2: "first-song-cover.png", blob: "covers/cowboy-rides-away.png" },
  { r2: "second-song-cover.png", blob: "covers/amarillo-by-morning.png" },
];

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN env var is required.");
    process.exit(1);
  }

  const mapping: Record<string, string> = {};

  for (const item of ITEMS) {
    const r2Url = `${R2_BASE}/${item.r2}`;
    process.stdout.write(`↓ ${item.blob.padEnd(45)} ... `);

    const resp = await fetch(r2Url);
    if (!resp.ok || !resp.body) {
      console.error(`FAIL (${resp.status}) ${r2Url}`);
      continue;
    }

    const result = await put(item.blob, resp.body, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: resp.headers.get("content-type") ?? undefined,
    });

    mapping[item.blob] = result.url;
    console.log(`OK`);
  }

  console.log("\n" + "=".repeat(70));
  console.log("MAPPING (paste into seed.ts / Hero.tsx etc):");
  console.log("=".repeat(70));
  console.log(JSON.stringify(mapping, null, 2));
  console.log("\n" + "=".repeat(70));
  console.log("BLOB_BASE (the host shared by all these URLs):");
  console.log("=".repeat(70));
  const sample = Object.values(mapping)[0];
  if (sample) {
    const u = new URL(sample);
    console.log(`${u.protocol}//${u.host}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
