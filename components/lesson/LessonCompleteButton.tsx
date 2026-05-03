"use client";

import { useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  completeLesson,
  uncompleteLesson,
} from "@/app/actions/lessonCompletion";

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
    <Button
      onClick={onClick}
      disabled={isPending}
      variant={isComplete ? "outline" : "default"}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isComplete ? (
        <Check className="mr-2 h-4 w-4" />
      ) : null}
      {isComplete ? "Completed — undo" : "Mark as complete"}
    </Button>
  );
}
