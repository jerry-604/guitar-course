import Link from "next/link";
import { Lock, ArrowLeft, Clock, CheckCircle2, XCircle } from "lucide-react";
import { SubmissionForm } from "@/components/lesson/SubmissionForm";

type Submission = {
  id: string;
  status: "pending" | "approved" | "rejected";
  feedback: string | null;
  createdAt: Date;
} | null;

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
  /** Most recent submission for the BLOCKING song (the one that needs grading). */
  blockingSubmission: Submission;
};

export function LockedSongView({
  lockedModule,
  blockingModule,
  blockingSubmission,
}: Props) {
  const blockingSongTitle =
    blockingModule?.songTitle ?? blockingModule?.title ?? "the previous song";

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

        <div className="mt-8 space-y-4 text-foreground/80">
          <p className="text-lg leading-relaxed">
            This song unlocks once you&apos;ve sent in a tape of{" "}
            <em className="text-foreground">{blockingSongTitle}</em> and
            Jerry has given it the green light.
          </p>
        </div>

        {/* Submission status (if any) */}
        {blockingSubmission && (
          <SubmissionStatus submission={blockingSubmission} />
        )}

        {/* Show the form if there's no pending tape, or the last one was rejected */}
        {(!blockingSubmission || blockingSubmission.status === "rejected") &&
          blockingModule && (
            <div className="mt-8">
              <div className="caps mb-3">
                {blockingSubmission?.status === "rejected"
                  ? "Send another take"
                  : "Send your tape"}
              </div>
              <SubmissionForm
                moduleSlug={blockingModule.slug}
                blockingSongTitle={blockingSongTitle}
              />
            </div>
          )}

        {/* Always offer the practice link back to the blocking song */}
        {blockingModule?.firstLessonSlug && (
          <div className="mt-8 flex flex-col items-stretch gap-3 border-t border-primary/15 pt-6 sm:flex-row sm:items-center">
            <Link
              href={`/learn/${blockingModule.slug}/${blockingModule.firstLessonSlug}`}
              className="group inline-flex items-center justify-center gap-3 border border-foreground/30 px-5 py-2.5 font-display text-sm text-foreground transition-colors hover:border-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              Practice {blockingSongTitle}
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}

function SubmissionStatus({ submission }: { submission: NonNullable<Submission> }) {
  if (submission.status === "pending") {
    return (
      <div className="mt-8 flex items-start gap-3 border border-foreground/15 bg-foreground/[0.03] p-4">
        <Clock className="mt-0.5 h-4 w-4 text-foreground/65 shrink-0" />
        <div>
          <div className="caps text-foreground/85">Tape received</div>
          <p className="mt-1 text-sm leading-relaxed text-foreground/75">
            Sent {timeAgo(submission.createdAt)}. Jerry usually reviews
            tapes within a couple of days. You&apos;ll get an email when this
            song unlocks.
          </p>
        </div>
      </div>
    );
  }
  if (submission.status === "approved") {
    return (
      <div className="mt-8 flex items-start gap-3 border border-green-700/30 bg-green-50 p-4 dark:bg-green-950/20">
        <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-700 shrink-0 dark:text-green-500" />
        <div>
          <div className="caps text-green-800 dark:text-green-300">
            Tape approved
          </div>
          <p className="mt-1 text-sm leading-relaxed text-foreground/80">
            Reload the page if this song hasn&apos;t opened up yet.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-8 flex items-start gap-3 border border-destructive/30 bg-destructive/[0.05] p-4">
      <XCircle className="mt-0.5 h-4 w-4 text-destructive shrink-0" />
      <div>
        <div className="caps text-destructive">Send another take</div>
        {submission.feedback && (
          <p className="mt-1 text-sm leading-relaxed italic text-foreground/85">
            &ldquo;{submission.feedback}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}

function timeAgo(d: Date): string {
  const ms = Date.now() - new Date(d).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
