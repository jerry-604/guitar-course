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
