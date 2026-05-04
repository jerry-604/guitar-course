"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { X, Upload, Link as LinkIcon, Lock, ArrowRight } from "lucide-react";

type Props = {
  trigger: React.ReactNode;
  songTitle: string;
  songArtist: string;
  blockingSongTitle: string;
  blockingHref: string;
  /** href that takes a signed-in user straight into the tape-submission form */
  submitHref: string;
};

/**
 * Click-target on the locked Side B card on the landing page. Explains the
 * grading gate before the user dives in. Signed-in users get a one-click
 * "Send a tape" button straight into the submission form; signed-out users
 * are pushed to sign up first.
 */
export function SongLockModal({
  trigger,
  songTitle,
  songArtist,
  blockingSongTitle,
  blockingHref,
  submitHref,
}: Props) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg max-h-[92vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-foreground/15 bg-card p-6 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:p-8">
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Close"
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center text-foreground/60 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>

          <div className="flex items-start gap-4">
            <div className="wax-seal shrink-0">
              <Lock className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <Dialog.Title className="caps text-primary">Locked</Dialog.Title>
              <Dialog.Description className="mt-1 font-display text-2xl font-medium leading-tight tracking-tight">
                {songTitle}
              </Dialog.Description>
              <div className="caps mt-1.5">by {songArtist}</div>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-foreground/80">
            <p className="leading-relaxed">
              This song opens after you&apos;ve worked through{" "}
              <em className="text-foreground">{blockingSongTitle}</em>,
              recorded yourself playing it start to finish, and Jerry
              has reviewed your tape and given you the green light.
            </p>
          </div>

          {/* How to submit — explains the two-channel form behind the link */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="border border-foreground/10 bg-foreground/[0.025] p-3">
              <div className="caps mb-1.5 flex items-center gap-1.5">
                <Upload className="h-3 w-3" />
                Upload
              </div>
              <p className="text-xs leading-relaxed text-foreground/65">
                Drop an MP4 from your phone or laptop. Stays private.
              </p>
            </div>
            <div className="border border-foreground/10 bg-foreground/[0.025] p-3">
              <div className="caps mb-1.5 flex items-center gap-1.5">
                <LinkIcon className="h-3 w-3" />
                Paste a link
              </div>
              <p className="text-xs leading-relaxed text-foreground/65">
                Drive · YouTube unlisted · Vimeo · Loom — anything Jerry
                can open.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-foreground/10 pt-6 sm:flex-row sm:items-center">
            <SignedOut>
              <Link
                href="/sign-up"
                className="group inline-flex items-center justify-center gap-2 border border-foreground bg-foreground px-5 py-2.5 font-display text-sm text-background transition-colors hover:bg-primary hover:border-primary"
              >
                Start the course
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/sign-in"
                className="editorial-cta editorial-cta--primary justify-center sm:justify-start"
              >
                Already enrolled? Sign in
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href={submitHref}
                className="group inline-flex items-center justify-center gap-2 border border-foreground bg-foreground px-5 py-2.5 font-display text-sm text-background transition-colors hover:bg-primary hover:border-primary"
              >
                Send a tape
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href={blockingHref}
                className="editorial-cta editorial-cta--primary justify-center sm:justify-start"
              >
                Practice {blockingSongTitle} first
              </Link>
            </SignedIn>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
