/**
 * URL rewriter shared by server and client. Any video URL pointing at our
 * Cloudflare R2 bucket gets rewritten to the same-origin /api/video/...
 * proxy, which sidesteps networks doing TLS inspection on r2.dev that breaks
 * cert validation for the bucket. Anything else passes through untouched.
 *
 * Pure function with no React/Next dependency so server pages can call it
 * before passing URLs to client components — guaranteeing no raw R2 URL
 * ever ships to the browser.
 */
const R2_HOST = "pub-3410e1e40f1a47128a7371ab17d56ad3.r2.dev";

export function toProxiedVideoUrl(url: string): string {
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
