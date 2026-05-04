import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { sendEmail, buildContactEmail } from "@/lib/email";

// Where contact-form messages get delivered. Defaults to ADMIN_EMAIL if
// not set explicitly. Useful when the inbox you grade from (ADMIN_EMAIL,
// matched against your Clerk login) differs from the inbox Resend can
// actually deliver to (e.g. while you're still on free-tier "test mode").
const CONTACT_EMAIL =
  process.env.CONTACT_EMAIL ??
  process.env.ADMIN_EMAIL ??
  "jeremiahomolewa.work@gmail.com";

type Body = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: "Message is too long" }, { status: 400 });
  }

  // Pull identity from Clerk if signed in; require submitted email if not.
  const { userId } = await auth();
  let fromEmail = (body.email ?? "").trim();
  let fromName = (body.name ?? "").trim() || null;

  if (userId) {
    const user = await currentUser();
    const clerkEmail = user?.emailAddresses[0]?.emailAddress ?? null;
    const clerkName =
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null;
    if (clerkEmail) fromEmail = fromEmail || clerkEmail;
    if (clerkName) fromName = fromName || clerkName;
  }

  if (!fromEmail || !/^.+@.+\..+$/.test(fromEmail)) {
    return NextResponse.json(
      { error: "A valid email is required so Jerry can reply" },
      { status: 400 },
    );
  }

  const result = await sendEmail({
    to: CONTACT_EMAIL,
    ...buildContactEmail({
      fromName,
      fromEmail,
      subject: body.subject ?? null,
      message,
      isSignedIn: Boolean(userId),
    }),
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        error:
          result.reason === "no-key"
            ? "Email service not configured. Tell Jerry to set RESEND_API_KEY."
            : `Couldn't send: ${result.message ?? "unknown error"}`,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
