import { ContactModal } from "@/components/contact/ContactModal";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-5 py-10 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 sm:px-6 sm:py-12">
        <div>
          <div className="font-display text-lg font-medium">Guitar Course</div>
          <div className="caps mt-1">A country track · est. 2026</div>
          <ContactModal
            trigger={
              <button
                type="button"
                className="editorial-cta editorial-cta--primary mt-4 text-sm"
              >
                Message Jerry →
              </button>
            }
          />
        </div>
        <p className="max-w-md text-sm text-foreground/65 leading-relaxed">
          Built as a small, free, single-curriculum site. Tutorials are the
          property of their respective creators, used here in a non-commercial
          curated context. Reach out if you&apos;re a teacher featured and want
          your video swapped or removed.
        </p>
      </div>
    </footer>
  );
}
