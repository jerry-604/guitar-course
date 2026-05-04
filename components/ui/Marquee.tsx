/**
 * Pure-CSS horizontal marquee. Renders the children twice (back-to-back)
 * and translates the wrapper -50% over `--duration` for seamless looping.
 */
export function Marquee({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <div
      className={`relative w-full overflow-hidden border-y border-foreground/15 bg-card ${className ?? ""}`}
      aria-hidden
    >
      <div className="flex whitespace-nowrap will-change-transform animate-marquee">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="mx-6 inline-flex items-center gap-6 py-3 font-display text-sm tracking-tight text-foreground/65"
          >
            {item}
            <span className="text-primary/70">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
