import { redirect } from "next/navigation";
import Link from "next/link";
import { isCurrentUserAdmin } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isCurrentUserAdmin())) redirect("/");

  return (
    <div>
      <div className="border-b border-border/60 bg-foreground text-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-background/65">
            Admin · grading dashboard
          </div>
          <Link
            href="/learn"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-background/65 underline-offset-4 transition-colors hover:text-background hover:underline"
          >
            Back to course
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
