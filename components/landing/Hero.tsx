import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export function Hero() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        Guitar — beginner to song
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">
        A free, step-by-step course that takes you from holding a guitar for the
        first time to playing real songs all the way through.
      </p>
      <div className="mt-10 flex justify-center gap-4">
        <SignedOut>
          <Button asChild size="lg">
            <Link href="/sign-up">Start learning →</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </SignedOut>
        <SignedIn>
          <Button asChild size="lg">
            <Link href="/learn">Continue learning →</Link>
          </Button>
        </SignedIn>
      </div>
    </section>
  );
}
