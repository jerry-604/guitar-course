"use client";

import { useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import {
  completeLesson,
  uncompleteLesson,
} from "@/app/actions/lessonCompletion";
import { cn } from "@/lib/utils";

type Props = {
  lessonId: string;
  isComplete: boolean;
};

export function LessonCompleteButton({ lessonId, isComplete }: Props) {
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      if (isComplete) {
        await uncompleteLesson(lessonId);
      } else {
        await completeLesson(lessonId);
      }
    });
  };

  return (
    <button
      onClick={onClick}
      disabled={isPending}
      className={cn(
        "group inline-flex items-center gap-3 border px-5 py-2.5 font-display text-sm transition-colors disabled:opacity-60",
        isComplete
          ? "border-foreground/30 text-foreground hover:border-foreground"
          : "border-foreground bg-foreground text-background hover:bg-primary hover:border-primary",
      )}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isComplete ? (
        <span className="grid h-3.5 w-3.5 place-items-center border border-current">
          <Check className="h-2.5 w-2.5" strokeWidth={3} />
        </span>
      ) : (
        <span className="grid h-3.5 w-3.5 place-items-center border border-current" />
      )}
      {isComplete ? "Completed. Tap to undo" : "Mark this lesson complete"}
    </button>
  );
}
