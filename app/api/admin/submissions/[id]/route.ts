import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isCurrentUserAdmin } from "@/lib/admin";
import { sendEmail, buildReviewEmail } from "@/lib/email";
import { getCurriculum } from "@/lib/queries/curriculum";

type Body = {
  status?: "approved" | "rejected";
  feedback?: string | null;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.status !== "approved" && body.status !== "rejected") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.submission.update({
    where: { id },
    data: {
      status: body.status,
      feedback: body.feedback ?? null,
      reviewedAt: new Date(),
    },
    include: { user: true },
  });

  // Notify the student
  const curriculum = await getCurriculum();
  const mod = curriculum.find((m) => m.slug === updated.moduleSlug);
  const songTitle = mod?.songTitle ?? mod?.title ?? "your song";
  const modIdx = curriculum.findIndex((m) => m.slug === updated.moduleSlug);
  const nextSongModule =
    body.status === "approved"
      ? curriculum.slice(modIdx + 1).find((m) => m.kind === "song")
      : null;

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? new URL(req.url).origin;

  if (updated.user.email) {
    void sendEmail({
      to: updated.user.email,
      ...buildReviewEmail({
        studentEmail: updated.user.email,
        songTitle,
        status: body.status,
        feedback: body.feedback ?? null,
        baseUrl,
        unlockedSongTitle: nextSongModule?.songTitle ?? nextSongModule?.title ?? null,
      }),
    });
  }

  return NextResponse.json({ submission: updated });
}
