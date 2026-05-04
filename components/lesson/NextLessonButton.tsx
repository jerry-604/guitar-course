import Link from "next/link";

type Props = {
  next: { moduleSlug: string; lessonSlug: string } | null;
};

export function NextLessonButton({ next }: Props) {
  if (!next) {
    return (
      <span className="caps">You&apos;ve reached the end</span>
    );
  }
  return (
    <Link
      href={`/learn/${next.moduleSlug}/${next.lessonSlug}`}
      className="editorial-cta editorial-cta--primary group"
    >
      Next lesson
      <span className="transition-transform group-hover:translate-x-1">→</span>
    </Link>
  );
}
