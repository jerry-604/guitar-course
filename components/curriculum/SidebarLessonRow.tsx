"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, Circle, Lock } from "lucide-react";
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
        className="flex items-center gap-2 rounded px-2 py-1 text-sm text-muted-foreground/60 cursor-not-allowed"
        aria-disabled="true"
        title="Complete the previous song to unlock"
      >
        <Lock className="h-4 w-4 shrink-0" />
        <span className="truncate">{title}</span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded px-2 py-1 text-sm",
        isActive
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent/50 text-muted-foreground",
      )}
    >
      {isComplete ? (
        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
      ) : (
        <Circle className="h-4 w-4 shrink-0" />
      )}
      <span className="truncate">{title}</span>
    </Link>
  );
}
