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
