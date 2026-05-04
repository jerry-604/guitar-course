"use client";

import { useState, useTransition, type FormEvent } from "react";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { Upload, Link as LinkIcon, Loader2, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "upload" | "link";

type Props = {
  moduleSlug: string;
  blockingSongTitle: string;
};

/**
 * Two-tab tape submission form embedded on the locked song view.
 * - Upload tab: client-side direct-to-Blob upload via signed URL
 * - Link tab: paste a hosted URL (Drive / YouTube unlisted / Vimeo / Loom)
 * Either path POSTs to /api/submissions, which records the row and emails
 * Jeremiah.
 */
export function SubmissionForm({ moduleSlug, blockingSongTitle }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("upload");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function submitLink(e: FormEvent) {
    e.preventDefault();
    if (!link.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const resp = await fetch("/api/submissions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          moduleSlug,
          videoUrl: link.trim(),
          source: "link",
        }),
      });
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j.error ?? `Submission failed (${resp.status})`);
      }
      startTransition(() => router.refresh());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function submitUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    setError(null);
    setProgress(0);

    try {
      // Upload directly to Vercel Blob with a signed URL from our API.
      const blob = await upload(`tapes/${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/submissions/upload",
        contentType: file.type,
        onUploadProgress: (e) => setProgress(Math.round(e.percentage)),
      });

      // Record the submission row + email Jeremiah.
      const resp = await fetch("/api/submissions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          moduleSlug,
          videoUrl: blob.url,
          source: "upload",
        }),
      });
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j.error ?? `Submission failed (${resp.status})`);
      }
      startTransition(() => router.refresh());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border border-foreground/15 bg-card">
      {/* Tabs */}
      <div className="flex border-b border-foreground/15">
        <TabButton
          active={tab === "upload"}
          onClick={() => setTab("upload")}
          icon={<Upload className="h-3.5 w-3.5" />}
          label="Upload a video"
        />
        <TabButton
          active={tab === "link"}
          onClick={() => setTab("link")}
          icon={<LinkIcon className="h-3.5 w-3.5" />}
          label="Paste a link"
        />
      </div>

      <div className="p-5 sm:p-6">
        {tab === "upload" ? (
          <form onSubmit={submitUpload} className="space-y-4">
            <div>
              <label className="caps mb-2 block">Pick a video file</label>
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                disabled={submitting}
                className="block w-full font-body text-sm text-foreground file:mr-3 file:border file:border-foreground/30 file:bg-transparent file:px-3 file:py-1.5 file:font-display file:text-xs file:uppercase file:tracking-wider file:text-foreground hover:file:border-foreground"
              />
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/50">
                MP4 / MOV / WEBM · up to 500&nbsp;MB · stays private to Jeremiah
              </p>
            </div>

            {submitting && progress > 0 && progress < 100 && (
              <div>
                <div className="caps mb-1.5">Uploading · {progress}%</div>
                <div className="h-px w-full bg-border">
                  <div
                    className="h-px bg-primary transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <SubmitRow
              submitting={submitting}
              disabled={!file}
              ctaIdle="Send tape for review"
              ctaBusy="Sending…"
            />
          </form>
        ) : (
          <form onSubmit={submitLink} className="space-y-4">
            <div>
              <label
                htmlFor="tape-link"
                className="caps mb-2 block"
              >
                Paste a hosted video link
              </label>
              <input
                id="tape-link"
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                disabled={submitting}
                placeholder="https://drive.google.com/file/d/…"
                className="w-full border border-foreground/20 bg-transparent px-3 py-2.5 font-body text-sm text-foreground placeholder:text-foreground/35 focus:border-foreground focus:outline-none"
              />
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/50">
                Google Drive · YouTube unlisted · Vimeo · Loom · anything
                Jeremiah can open
              </p>
            </div>

            <SubmitRow
              submitting={submitting}
              disabled={!link.trim()}
              ctaIdle="Send link for review"
              ctaBusy="Sending…"
            />
          </form>
        )}

        {error && (
          <div className="mt-4 flex items-start gap-2 border border-destructive/40 bg-destructive/[0.05] p-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 px-4 py-3 font-display text-sm transition-colors",
        active
          ? "bg-foreground/[0.04] text-foreground"
          : "text-foreground/55 hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function SubmitRow({
  submitting,
  disabled,
  ctaIdle,
  ctaBusy,
}: {
  submitting: boolean;
  disabled: boolean;
  ctaIdle: string;
  ctaBusy: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <button
        type="submit"
        disabled={submitting || disabled}
        className="inline-flex items-center justify-center gap-2 border border-foreground bg-foreground px-5 py-2.5 font-display text-sm text-background transition-colors hover:bg-primary hover:border-primary disabled:opacity-40"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        {submitting ? ctaBusy : ctaIdle}
      </button>
    </div>
  );
}
