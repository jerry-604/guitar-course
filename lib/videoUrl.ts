/**
 * URL rewriter shared by server and client. By default we serve videos
 * directly from Cloudflare R2 — same-origin proxying through a Vercel
 * serverless function added cold-start latency and burned platform
 * bandwidth for no benefit on most networks.
 *
 * If we ever encounter users on networks that do TLS inspection of
 * r2.dev (some corporate Wi-Fi, schools, restrictive antivirus), flip
 * PROXY_R2_VIDEOS to true and the same-origin /api/video/[...path]
 * route handler will take over transparently.
 */
// Default ON: school/corporate WiFi often does TLS inspection on r2.dev
// which breaks cert validation. Edge-runtime proxy + edge cache keeps
// latency low for everyone, including networks that don't need the proxy.
const PROXY_R2_VIDEOS = true;
const R2_HOST = "pub-3410e1e40f1a47128a7371ab17d56ad3.r2.dev";

export function toProxiedVideoUrl(url: string): string {
  if (!PROXY_R2_VIDEOS) return url;
  try {
    const u = new URL(url);
    if (u.hostname === R2_HOST) {
      return `/api/video${u.pathname}`;
    }
    return url;
  } catch {
    return url;
  }
}
