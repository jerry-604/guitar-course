"use client";

import { useEffect, useState } from "react";

/**
 * Hairline oxblood progress bar that fills as the user scrolls down the
 * page. Sticks to the very top of the viewport. Pure CSS transform for
 * smoothness; no layout thrash.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const p = docHeight <= 0 ? 0 : Math.min(1, Math.max(0, scrollTop / docHeight));
      setProgress(p);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed left-0 top-0 z-[60] h-0.5 w-full pointer-events-none"
    >
      <div
        className="h-full origin-left bg-primary"
        style={{ transform: `scaleX(${progress})`, transition: "transform 80ms linear" }}
      />
    </div>
  );
}
