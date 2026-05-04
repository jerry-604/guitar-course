import { NextRequest } from "next/server";

// Edge runtime: near-zero cold start, web-API streaming. Critical for video
// proxying — the previous Node serverless runtime added 500ms-2s cold start
// per cold instance, which felt like "videos take forever to load" on
// networks where users actually need the proxy (TLS-inspecting school /
// corporate WiFi that breaks raw r2.dev cert validation).
export const runtime = "edge";

// Whitelist exactly one upstream — anything else 403's so this can't be
// abused as an open proxy.
const R2_BASE = "https://pub-3410e1e40f1a47128a7371ab17d56ad3.r2.dev";

const HEADERS_TO_FORWARD: readonly string[] = [
  "range",
  "if-range",
  "if-none-match",
  "if-modified-since",
];
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

  // Re-encode each segment so spaces/unicode survive the round-trip.
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
  // Cache aggressively at Vercel's edge: first user warms the cache, every
  // subsequent request for that video is served from the POP without
  // re-hitting R2. Videos are content-addressed and won't change.
  respHeaders.set(
    "cache-control",
    "public, max-age=31536000, s-maxage=31536000, immutable",
  );

  return new Response(upstream.body, {
    status: upstream.status,
    headers: respHeaders,
  });
}
