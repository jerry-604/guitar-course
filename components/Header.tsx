import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import DarkModeToggle from "@/components/DarkModeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-3 min-w-0">
          <span className="font-display text-lg font-semibold tracking-tight sm:text-xl">
            Guitar Course
          </span>
          <span className="caps hidden truncate sm:inline">a country track</span>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-3">
          <SignedIn>
            <Link
              href="/learn"
              className="hidden font-display text-sm text-foreground transition-opacity hover:opacity-70 sm:inline"
            >
              Continue
            </Link>
            <DarkModeToggle />
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <DarkModeToggle />
            <SignInButton mode="modal">
              <button className="hidden font-display text-sm text-foreground/80 transition-colors hover:text-foreground sm:inline">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="border border-foreground bg-foreground px-3 py-1.5 font-display text-sm text-background transition-colors hover:bg-primary hover:border-primary sm:px-4">
                Sign up
              </button>
            </SignUpButton>
          </SignedOut>
        </nav>
      </div>
    </header>
  );
}
