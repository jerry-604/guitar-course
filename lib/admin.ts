import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Admin gate. Set ADMIN_EMAIL on the deploy to grant access to /admin
 * routes and the submission-review API. Falls back to "deny everyone"
 * if the env var is missing — so a misconfigured deploy never leaks.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;

  const { userId } = await auth();
  if (!userId) return false;

  const user = await currentUser();
  if (!user) return false;

  const emails = user.emailAddresses.map((e) => e.emailAddress.toLowerCase());
  return emails.includes(adminEmail.toLowerCase());
}
