"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ExternalLink, Loader2, Upload, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Submission = {
  id: string;
  videoUrl: string;
  source: "upload" | "link";
  status: "pending" | "approved" | "rejected";
  feedback: string | null;
  createdAt: string;
  studentName: string | null;
  studentEmail: string | null;
  songTitle: string;
};

export function SubmissionRow({ submission }: { submission: Submission }) {
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [busy, setBusy] = useState<"approved" | "rejected" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const isResolved = submission.status !== "pending";

  async function review(status: "approved" | "rejected") {
    setBusy(status);
    setError(null);
    try {
      const resp = await fetch(`/api/admin/submissions/${submission.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status, feedback: feedback.trim() || null }),
      });
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j.error ?? `Failed (${resp.status})`);
      }
      startTransition(() => router.refresh());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className="border border-border/70 bg-card p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="caps">
            {submission.source === "upload" ? (
              <>
                <Upload className="inline-block mr-1 h-3 w-3 align-text-bottom" />
                upload
              </>
            ) : (
              <>
                <LinkIcon className="inline-block mr-1 h-3 w-3 align-text-bottom" />
                hosted link
              </>
            )}{" "}
            · {new Date(submission.createdAt).toLocaleString()}
          </div>
          <h2 className="mt-1 font-display text-xl font-medium tracking-tight">
            {submission.songTitle}
          </h2>
          <div className="mt-1 text-sm text-foreground/75">
            {submission.studentName ?? submission.studentEmail ?? "Unknown student"}
            {submission.studentEmail && (
              <span className="ml-2 text-foreground/50">
                {submission.studentEmail}
              </span>
            )}
          </div>
        </div>

        <StatusBadge status={submission.status} />
      </div>

      {/* Inline player */}
      <div className="mt-4 border border-foreground/15 bg-black p-1">
        {submission.source === "upload" ? (
          <video
            src={submission.videoUrl}
            controls
            playsInline
            preload="metadata"
            className="aspect-video w-full bg-black"
          />
        ) : (
          <div className="aspect-video w-full grid place-items-center bg-black/95 text-[#E9DEC9]">
            <div className="text-center space-y-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-65">
                Hosted on an external site
              </div>
              <a
                href={submission.videoUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 border border-[#E9DEC9]/30 px-4 py-2 font-display text-sm text-[#E9DEC9] hover:bg-[#E9DEC9]/10"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open video
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Feedback + actions (only for pending; reviewed shows the recorded feedback) */}
      {!isResolved ? (
        <div className="mt-4 space-y-3">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Optional feedback for the student (sent in the email)"
            rows={2}
            className="w-full border border-foreground/15 bg-transparent px-3 py-2 font-body text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground focus:outline-none"
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void review("approved")}
              className="inline-flex items-center gap-2 border border-foreground bg-foreground px-4 py-2 font-display text-sm text-background transition-colors hover:bg-green-700 hover:border-green-700 disabled:opacity-50"
            >
              {busy === "approved" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Approve
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void review("rejected")}
              className="inline-flex items-center gap-2 border border-foreground/30 px-4 py-2 font-display text-sm text-foreground transition-colors hover:border-destructive hover:text-destructive disabled:opacity-50"
            >
              {busy === "rejected" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <X className="h-3.5 w-3.5" />
              )}
              Send back
            </button>
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
        </div>
      ) : (
        submission.feedback && (
          <div className="mt-4 border-t border-border pt-3">
            <div className="caps mb-1">Feedback sent</div>
            <p className="italic text-sm text-foreground/80">
              &ldquo;{submission.feedback}&rdquo;
            </p>
          </div>
        )
      )}
    </article>
  );
}

function StatusBadge({ status }: { status: Submission["status"] }) {
  const meta = {
    pending: { label: "Pending", cls: "border-foreground/30 text-foreground" },
    approved: {
      label: "Approved",
      cls: "border-green-700/40 bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300",
    },
    rejected: {
      label: "Sent back",
      cls: "border-destructive/40 bg-destructive/[0.05] text-destructive",
    },
  }[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 border font-mono text-[10px] uppercase tracking-[0.18em]",
        meta.cls,
      )}
    >
      {meta.label}
    </span>
  );
}
