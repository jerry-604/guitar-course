"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * Two-state toggle. Editorial style — no dropdown menu, no system option,
 * just the binary the reader actually wants.
 */
export function DarkModeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes hydrates client-side; render a stable button until then
  // to avoid mismatch + layout shift.
  useEffect(() => setMounted(true), []);

  const isDark = mounted ? theme === "dark" : false;

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "grid h-8 w-8 place-items-center text-foreground/70 transition-colors hover:text-foreground",
        className,
      )}
    >
      {mounted &&
        (isDark ? (
          <Sun className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.6} />
        ) : (
          <Moon className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.6} />
        ))}
    </button>
  );
}

export default DarkModeToggle;
