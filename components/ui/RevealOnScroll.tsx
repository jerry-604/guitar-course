"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  /** Delay in ms before the reveal begins (use to stagger siblings). */
  delay?: number;
  /** Override the underlying element. Defaults to div. */
  as?: "div" | "section" | "article" | "li";
  className?: string;
};

/**
 * Tiny scroll-into-view fade + lift. Native IntersectionObserver, no deps.
 * Once revealed, it stays revealed (no re-trigger). Honors the user's
 * prefers-reduced-motion: if they've opted out of motion, the content
 * is shown immediately.
 */
export function RevealOnScroll({
  children,
  delay = 0,
  as = "div",
  className,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const Tag = as as "div";

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-[opacity,transform] duration-700 ease-out will-change-transform",
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
