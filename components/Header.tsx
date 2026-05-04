import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="group flex items-baseline gap-3">
          <span className="font-display text-xl font-semibold tracking-tight">
            Guitar Course
          </span>
          <span className="caps hidden sm:inline">a country track</span>
        </Link>

        <nav className="flex items-center gap-6">
          <SignedIn>
            <Link
              href="/learn"
              className="font-display text-sm text-foreground transition-opacity hover:opacity-70"
            >
              Continue
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="font-display text-sm text-foreground/80 transition-colors hover:text-foreground">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="border border-foreground bg-foreground px-4 py-1.5 font-display text-sm text-background transition-colors hover:bg-primary hover:border-primary">
                Sign up
              </button>
            </SignUpButton>
          </SignedOut>
        </nav>
      </div>
    </header>
  );
}
