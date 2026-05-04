/**
 * A small editorial ornament between sections. SVG, currentColor, scales
 * with the surrounding text. Pattern: hairline rule on each side with a
 * stylized vinyl-record-meets-asterisk centerpiece.
 */
export function SectionDivider({
  variant = "default",
}: {
  variant?: "default" | "dark";
}) {
  const baseClass = variant === "dark" ? "text-[#E9DEC9]/35" : "text-foreground/30";
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center gap-4 py-12 ${baseClass}`}
    >
      <span className="h-px w-16 bg-current sm:w-24" />
      <Ornament />
      <span className="h-px w-16 bg-current sm:w-24" />
    </div>
  );
}

function Ornament() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Outer vinyl ring */}
      <circle
        cx="14"
        cy="14"
        r="11"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.6"
      />
      {/* Inner ring */}
      <circle
        cx="14"
        cy="14"
        r="6.5"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.5"
      />
      {/* Asterisk-style spokes */}
      <g stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.85">
        <line x1="14" y1="3" x2="14" y2="9" />
        <line x1="14" y1="19" x2="14" y2="25" />
        <line x1="3" y1="14" x2="9" y2="14" />
        <line x1="19" y1="14" x2="25" y2="14" />
        <line x1="6.5" y1="6.5" x2="10" y2="10" />
        <line x1="18" y1="18" x2="21.5" y2="21.5" />
        <line x1="6.5" y1="21.5" x2="10" y2="18" />
        <line x1="18" y1="10" x2="21.5" y2="6.5" />
      </g>
      {/* Center dot */}
      <circle cx="14" cy="14" r="1.5" fill="currentColor" />
    </svg>
  );
}
