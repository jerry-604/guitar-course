import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * Issues short-lived signed upload URLs for the client-side @vercel/blob
 * `upload()` call. Blocks unauthenticated requests; restricts mime types
 * and size so the bucket can't be turned into a free file host.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        return {
          allowedContentTypes: [
            "video/mp4",
            "video/quicktime",
            "video/webm",
            "video/x-m4v",
          ],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId, pathname }),
          maximumSizeInBytes: 500 * 1024 * 1024, // 500 MB
        };
      },
      onUploadCompleted: async () => {
        // No-op: the client posts to /api/submissions with the resulting
        // blob URL once the upload finishes.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
