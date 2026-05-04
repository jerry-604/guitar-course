"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { X, Mail, Lock } from "lucide-react";

type Props = {
  trigger: React.ReactNode;
  songTitle: string;
  songArtist: string;
  blockingSongTitle: string;
  blockingHref: string;
};

/**
 * Click-target on the locked Side B card on the landing page. Instead of
 * navigating to a URL that immediately bounces (or now renders the locked
 * view), we explain the gating up-front so the user understands what to
 * do before they tap into the course.
 */
export function SongLockModal({
  trigger,
  songTitle,
  songArtist,
  blockingSongTitle,
  blockingHref,
}: Props) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 border border-foreground/15 bg-card p-8 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
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
            <div>
              <Dialog.Title className="caps text-primary">
                Locked
              </Dialog.Title>
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
              recorded yourself playing it start to finish, and Jeremiah
              has reviewed your tape and given you the green light.
            </p>
            <p className="text-sm leading-relaxed text-foreground/60">
              The tape-submission workflow is still being built. For now,
              finish the previous song&apos;s tutorial and email a link to
              your recording.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-foreground/10 pt-6 sm:flex-row sm:items-center">
            <SignedOut>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-3 border border-foreground bg-foreground px-5 py-2.5 font-display text-sm text-background transition-colors hover:bg-primary hover:border-primary"
              >
                Start the course →
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href={blockingHref}
                className="inline-flex items-center justify-center gap-3 border border-foreground bg-foreground px-5 py-2.5 font-display text-sm text-background transition-colors hover:bg-primary hover:border-primary"
              >
                Practice {blockingSongTitle} →
              </Link>
            </SignedIn>
            <a
              href={`mailto:jeremiahomolewa.work@gmail.com?subject=Tape%20submission%20-%20${encodeURIComponent(blockingSongTitle)}`}
              className="editorial-cta editorial-cta--primary inline-flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email a tape link
            </a>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
