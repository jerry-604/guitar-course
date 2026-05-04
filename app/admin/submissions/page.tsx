import { prisma } from "@/lib/prisma";
import { getCurriculum } from "@/lib/queries/curriculum";
import { SubmissionRow } from "@/components/admin/SubmissionRow";

export const dynamic = "force-dynamic"; // never cache

export default async function AdminSubmissionsPage() {
  const [submissions, curriculum] = await Promise.all([
    prisma.submission.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { user: true },
    }),
    getCurriculum(),
  ]);

  const moduleTitle = (slug: string) => {
    const m = curriculum.find((c) => c.slug === slug);
    return m?.songTitle ?? m?.title ?? slug;
  };

  const pending = submissions.filter((s) => s.status === "pending");
  const reviewed = submissions.filter((s) => s.status !== "pending");

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
      <header className="mb-10 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="caps mb-2">Tape submissions</div>
          <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            {pending.length === 0
              ? "Inbox zero."
              : `${pending.length} ${pending.length === 1 ? "tape" : "tapes"} waiting`}
          </h1>
        </div>
        <div className="caps">
          {submissions.length} total · {reviewed.length} reviewed
        </div>
      </header>

      {pending.length > 0 && (
        <section className="mb-12">
          <div className="caps mb-4 text-primary">Pending review</div>
          <div className="space-y-4">
            {pending.map((s) => (
              <SubmissionRow
                key={s.id}
                submission={{
                  id: s.id,
                  videoUrl: s.videoUrl,
                  source: s.source,
                  status: s.status,
                  feedback: s.feedback,
                  createdAt: s.createdAt.toISOString(),
                  studentName: s.user.name,
                  studentEmail: s.user.email,
                  songTitle: moduleTitle(s.moduleSlug),
                }}
              />
            ))}
          </div>
        </section>
      )}

      {reviewed.length > 0 && (
        <section>
          <div className="caps mb-4">Reviewed</div>
          <div className="space-y-4">
            {reviewed.map((s) => (
              <SubmissionRow
                key={s.id}
                submission={{
                  id: s.id,
                  videoUrl: s.videoUrl,
                  source: s.source,
                  status: s.status,
                  feedback: s.feedback,
                  createdAt: s.createdAt.toISOString(),
                  studentName: s.user.name,
                  studentEmail: s.user.email,
                  songTitle: moduleTitle(s.moduleSlug),
                }}
              />
            ))}
          </div>
        </section>
      )}

      {submissions.length === 0 && (
        <div className="border border-dashed border-border p-12 text-center">
          <p className="text-foreground/70">
            No submissions yet. Once students start sending tapes, they show
            up here.
          </p>
        </div>
      )}
    </main>
  );
}
