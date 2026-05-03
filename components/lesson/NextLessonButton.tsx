import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  next: { moduleSlug: string; lessonSlug: string } | null;
};

export function NextLessonButton({ next }: Props) {
  if (!next) {
    return (
      <Button disabled variant="ghost">
        You&apos;ve reached the end 🎉
      </Button>
    );
  }
  return (
    <Button asChild variant="outline">
      <Link href={`/learn/${next.moduleSlug}/${next.lessonSlug}`}>
        Next lesson <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );
}
