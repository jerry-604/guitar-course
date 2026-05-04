import { NextRequest } from "next/server";

// Whitelist exactly one upstream — anything else 403's so this can't be abused
// as an open proxy.
const R2_BASE = "https://pub-3410e1e40f1a47128a7371ab17d56ad3.r2.dev";

// Forward only the headers that matter for media streaming.
const HEADERS_TO_FORWARD: readonly string[] = ["range", "if-range", "if-none-match"];
const HEADERS_TO_RETURN: readonly string[] = [
  "content-type",
  "content-length",
  "content-range",
  "accept-ranges",
  "etag",
  "last-modified",
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  if (!path?.length) return new Response("Bad request", { status: 400 });

  // Re-encode each segment so spaces and unicode survive the round-trip.
  const upstreamUrl = `${R2_BASE}/${path.map(encodeURIComponent).join("/")}`;

  const fwdHeaders = new Headers();
  for (const h of HEADERS_TO_FORWARD) {
    const v = req.headers.get(h);
    if (v) fwdHeaders.set(h, v);
  }

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, { headers: fwdHeaders });
  } catch (err) {
    return new Response(`Upstream fetch failed: ${(err as Error).message}`, {
      status: 502,
    });
  }

  const respHeaders = new Headers();
  for (const h of HEADERS_TO_RETURN) {
    const v = upstream.headers.get(h);
    if (v) respHeaders.set(h, v);
  }
  if (!respHeaders.has("accept-ranges")) {
    respHeaders.set("accept-ranges", "bytes");
  }
  // Cache aggressively at the edge — these are immutable assets.
  respHeaders.set("cache-control", "public, max-age=3600, s-maxage=86400");

  return new Response(upstream.body, {
    status: upstream.status,
    headers: respHeaders,
  });
}
