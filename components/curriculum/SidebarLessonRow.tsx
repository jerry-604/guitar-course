"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  title: string;
  isComplete: boolean;
  isLocked?: boolean;
};

export function SidebarLessonRow({ href, title, isComplete, isLocked }: Props) {
  const pathname = usePathname();
  const isActive = pathname === href;

  if (isLocked) {
    return (
      <div
        className="flex items-center gap-3 px-2 py-1.5 text-sm text-muted-foreground/60 cursor-not-allowed"
        aria-disabled="true"
        title="Complete the previous song to unlock"
      >
        <span className="grid h-4 w-4 place-items-center text-[10px]">
          <Lock className="h-3 w-3" />
        </span>
        <span className="truncate font-body">{title}</span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 px-2 py-1.5 text-sm transition-colors",
        isActive
          ? "bg-primary/8 text-foreground"
          : "text-foreground/75 hover:text-foreground hover:bg-muted/30",
      )}
    >
      <span
        className={cn(
          "grid h-4 w-4 place-items-center border text-[10px]",
          isComplete
            ? "border-primary bg-primary text-primary-foreground"
            : isActive
            ? "border-foreground"
            : "border-muted-foreground/40 group-hover:border-foreground/70",
        )}
      >
        {isComplete && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <span className="truncate font-body">{title}</span>
    </Link>
  );
}
