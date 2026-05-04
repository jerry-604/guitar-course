import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ messages: [] });

  const rows = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true },
  });

  return NextResponse.json({ messages: rows });
}

export async function DELETE() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ ok: true });

  await prisma.chatMessage.deleteMany({ where: { userId } });
  return NextResponse.json({ ok: true });
}
