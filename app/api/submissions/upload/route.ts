import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET, R2_PUBLIC_BASE } from "@/lib/r2";

const ALLOWED_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
]);
const MAX_BYTES = 500 * 1024 * 1024; // 500 MB

type Body = {
  filename?: string;
  contentType?: string;
  size?: number;
};

/**
 * Browser → R2 direct upload via a short-lived presigned PUT URL.
 *
 * Flow:
 *  1. Client POSTs filename + content-type + size here
 *  2. We auth, validate, build a unique R2 key, and sign a PUT URL
 *  3. Client PUTs the file straight at R2 (no bytes through Vercel)
 *  4. Client then POSTs the resulting public URL to /api/submissions
 *
 * R2 needs CORS configured to allow PUT from our origin. See README /
 * the deploy notes — one-time bucket setting.
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const filename = (body.filename ?? "").trim();
  const contentType = (body.contentType ?? "").trim();
  const size = Number(body.size ?? 0);

  if (!filename) {
    return NextResponse.json({ error: "filename required" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${contentType || "(none)"}` },
      { status: 400 },
    );
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File must be 1 byte – ${MAX_BYTES} bytes` },
      { status: 400 },
    );
  }

  // Build a deterministic, collision-resistant key under tapes/.
  const ext = (filename.split(".").pop() ?? "mp4").toLowerCase().slice(0, 8);
  const safeUserSlug = userId.replace(/[^a-zA-Z0-9_-]/g, "").slice(-12);
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 10);
  const key = `tapes/${safeUserSlug}-${ts}-${rand}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
    ContentLength: size,
  });

  let uploadUrl: string;
  try {
    uploadUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });
  } catch (err) {
    console.error("[upload] presign error", err);
    return NextResponse.json(
      { error: "Couldn't sign upload URL — check R2 credentials" },
      { status: 500 },
    );
  }

  // The public URL once the upload completes — served via our custom
  // domain so school WiFi MITM doesn't break playback later.
  const publicUrl = `${R2_PUBLIC_BASE}/${key}`;

  return NextResponse.json({ uploadUrl, publicUrl, key });
}
