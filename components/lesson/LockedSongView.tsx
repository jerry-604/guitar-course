import Link from "next/link";
import { Lock, ArrowLeft, Mail } from "lucide-react";

type Props = {
  lockedModule: {
    title: string;
    songTitle?: string | null;
    songArtist?: string | null;
    description?: string | null;
  };
  blockingModule:
    | {
        slug: string;
        title: string;
        songTitle?: string | null;
        firstLessonSlug?: string;
      }
    | null;
};

/**
 * Rendered in place of a lesson when the user navigates into a song module
 * that's still gated (their previous song hasn't been completed/graded yet).
 * Replaces the previous behavior of silently redirecting to /learn, which
 * was confusing — the URL would change to something the user didn't pick.
 */
export function LockedSongView({ lockedModule, blockingModule }: Props) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
      <div className="mb-6 sm:mb-8">
        <Link
          href="/learn"
          className="caps inline-flex items-center gap-2 hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to your course
        </Link>
      </div>

      <div className="border border-primary/30 bg-primary/[0.04] p-6 sm:p-8 md:p-12">
        <div className="flex items-start gap-4 sm:gap-5">
          <div className="wax-seal shrink-0">
            <Lock className="h-4 w-4" />
          </div>
          <div className="space-y-2">
            <div className="caps text-primary">Locked</div>
            <h1 className="font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              {lockedModule.songTitle ?? lockedModule.title}
            </h1>
            {lockedModule.songArtist && (
              <div className="caps">by {lockedModule.songArtist}</div>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-5 text-foreground/80">
          <p className="text-lg leading-relaxed">
            This song unlocks once you&apos;ve recorded yourself playing
            {blockingModule?.songTitle ? (
              <>
                {" "}
                <em className="text-foreground">
                  {blockingModule.songTitle}
                </em>
              </>
            ) : (
              " the previous song"
            )}{" "}
            from start to finish and Jeremiah has reviewed your tape.
          </p>
          <p className="leading-relaxed text-foreground/65">
            The grading workflow is still being built. For now, finish the
            tutorial first, then email Jeremiah a link to your recording.
            He&apos;ll mark it green-light and this section opens up.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-stretch gap-4 border-t border-primary/15 pt-6 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-3">
          {blockingModule?.firstLessonSlug && (
            <Link
              href={`/learn/${blockingModule.slug}/${blockingModule.firstLessonSlug}`}
              className="group inline-flex items-center justify-center gap-3 border border-foreground bg-foreground px-5 py-2.5 font-display text-sm text-background transition-colors hover:bg-primary hover:border-primary"
            >
              {blockingModule.songTitle
                ? `Practice ${blockingModule.songTitle}`
                : "Continue the tutorial"}
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          )}
          <a
            href="mailto:jeremiahomolewa.work@gmail.com?subject=Tape%20submission%20for%20The%20Cowboy%20Rides%20Away"
            className="editorial-cta editorial-cta--primary group justify-center sm:justify-start"
          >
            <Mail className="h-4 w-4" />
            Email Jeremiah a tape link
          </a>
        </div>
      </div>
    </article>
  );
}
