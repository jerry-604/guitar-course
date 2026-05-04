import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";

type Body = {
  userMessage: string;
  assistantMessage: string;
};

/**
 * Saves a (user, assistant) turn to the user's chat history. Called by the
 * client after the streaming response from /api/chat completes — that way
 * we don't need any tee-stream gymnastics in the streaming route itself.
 */
export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const userMessage = (body.userMessage ?? "").trim();
  const assistantMessage = (body.assistantMessage ?? "").trim();
  if (!userMessage || !assistantMessage) {
    return NextResponse.json(
      { error: "userMessage and assistantMessage are required" },
      { status: 400 },
    );
  }

  const user = await getOrCreateUser().catch(() => null);
  if (!user) {
    // Guest sessions persist client-side via localStorage. Quietly succeed
    // so the client can call persist unconditionally.
    return NextResponse.json({ ok: false, reason: "guest" });
  }

  await prisma.chatMessage.createMany({
    data: [
      { userId: user.id, role: "user", content: userMessage },
      { userId: user.id, role: "assistant", content: assistantMessage },
    ],
  });

  return NextResponse.json({ ok: true });
}
