import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import { sendEmail, buildSubmissionEmail } from "@/lib/email";
import { getCurriculum } from "@/lib/queries/curriculum";

// See app/api/contact/route.ts for why this is split from ADMIN_EMAIL.
const CONTACT_EMAIL =
  process.env.CONTACT_EMAIL ??
  process.env.ADMIN_EMAIL ??
  "jeremiahomolewa.work@gmail.com";

type Body = {
  moduleSlug?: string;
  videoUrl?: string;
  source?: "upload" | "link";
};

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { moduleSlug, videoUrl, source } = body;
  if (!moduleSlug || !videoUrl || !source) {
    return NextResponse.json(
      { error: "moduleSlug, videoUrl, and source are required" },
      { status: 400 },
    );
  }
  if (source !== "upload" && source !== "link") {
    return NextResponse.json({ error: "Invalid source" }, { status: 400 });
  }

  const user = await getOrCreateUser().catch(() => null);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Sanity check the module exists and is a song module
  const curriculum = await getCurriculum();
  const mod = curriculum.find((m) => m.slug === moduleSlug);
  if (!mod || mod.kind !== "song") {
    return NextResponse.json(
      { error: "Submissions are only accepted for song modules" },
      { status: 400 },
    );
  }

  // Light URL sanity check for paste-link path
  if (source === "link") {
    try {
      const u = new URL(videoUrl);
      if (!["http:", "https:"].includes(u.protocol)) throw new Error();
    } catch {
      return NextResponse.json({ error: "Invalid video URL" }, { status: 400 });
    }
  }

  const submission = await prisma.submission.create({
    data: {
      userId: user.id,
      moduleSlug,
      videoUrl,
      source,
      status: "pending",
    },
  });

  // Fire and forget the email — failure shouldn't block the user from
  // seeing their tape go in.
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? new URL(req.url).origin;
  const songTitle = mod.songTitle ?? mod.title;
  void sendEmail({
    to: CONTACT_EMAIL,
    ...buildSubmissionEmail({
      studentName: user.name,
      studentEmail: user.email,
      songTitle,
      videoUrl,
      source,
      baseUrl,
    }),
  });

  return NextResponse.json({ submission });
}
