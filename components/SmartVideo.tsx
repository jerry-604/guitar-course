"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const R2_BASE = "https://pub-3410e1e40f1a47128a7371ab17d56ad3.r2.dev";

type SmartVideoProps = {
  /**
   * Either a full https://...r2.dev URL or a bare R2 path like
   * "motivation-1.mp4". Anything else is used verbatim.
   */
  src: string;
  poster?: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  preload?: "none" | "metadata" | "auto";
  ariaHidden?: boolean;
};

/**
 * Tries to load the video directly from Cloudflare R2 first (fastest, free
 * bandwidth, edge-cached at R2). If the browser fires an error event —
 * which happens on networks doing TLS inspection on r2.dev — we swap the
 * src to our same-origin /api/video/... edge proxy and let the player
 * recover. School WiFi works, normal networks stay fast.
 */
export function SmartVideo({
  src,
  poster,
  className,
  controls,
  autoPlay,
  muted,
  loop,
  playsInline,
  preload = "metadata",
  ariaHidden,
}: SmartVideoProps) {
  // Idempotent: accept full R2 URL, bare R2 path, or already-proxied
  // /api/video/... path and resolve to canonical (directUrl, proxyUrl).
  let directUrl: string;
  let proxyUrl: string;
  if (src.startsWith("/api/video/")) {
    proxyUrl = src;
    directUrl = `${R2_BASE}${src.slice("/api/video".length)}`;
  } else if (src.startsWith("http")) {
    directUrl = src;
    try {
      const u = new URL(src);
      proxyUrl = `/api/video${u.pathname}`;
    } catch {
      proxyUrl = src;
    }
  } else {
    const cleanPath = `/${src.replace(/^\//, "")}`;
    directUrl = `${R2_BASE}${cleanPath}`;
    proxyUrl = `/api/video${cleanPath}`;
  }

  const [currentSrc, setCurrentSrc] = useState(directUrl);
  const failedRef = useRef(false);
  const ref = useRef<HTMLVideoElement | null>(null);

  // If the network blocks the direct URL (cert error, DNS block, etc),
  // <video> fires "error" and we swap to the proxy URL.
  const handleError = () => {
    if (failedRef.current) return;
    failedRef.current = true;
    if (currentSrc !== proxyUrl) {
      setCurrentSrc(proxyUrl);
    }
  };

  // Some browsers don't fire `error` for stuck loads — they just hang.
  // Watchdog: if metadata hasn't loaded after 4 seconds, force fallback.
  useEffect(() => {
    if (failedRef.current) return;
    const el = ref.current;
    if (!el) return;
    const timer = window.setTimeout(() => {
      if (
        !failedRef.current &&
        el.readyState < 1 /* HAVE_NOTHING / HAVE_METADATA */
      ) {
        handleError();
      }
    }, 4000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSrc]);

  return (
    <video
      ref={ref}
      key={currentSrc}
      src={currentSrc}
      poster={poster}
      controls={controls}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      preload={preload}
      onError={handleError}
      aria-hidden={ariaHidden}
      className={cn(className)}
    />
  );
}
