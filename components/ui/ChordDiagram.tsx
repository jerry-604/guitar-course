import { cn } from "@/lib/utils";

/**
 * Hand-drawn-feel guitar chord shape. Six strings, conventional chord-box
 * orientation: low E on the left (string 6), high E on the right (string 1).
 * Fret numbers go 1..N down from the nut. Open = "O" above the nut, muted = "X".
 *
 * Drawn with stroke="currentColor" so it inherits the parent's color and
 * works seamlessly in both light and dark themes. The chord-name caption
 * is rendered OUTSIDE the SVG, as a sibling figcaption, so the gap
 * between the fret box and the letter is controlled with normal margins.
 */

export type ChordShape = {
  name: string;
  /** 6 entries, low-E first. Each: 0 = open, "x" = muted, 1+ = fret. */
  positions: (number | "x")[];
  /** Optional finger numbers (1-4) per string, low-E first. */
  fingers?: (number | null | undefined)[];
};

export const D_MAJOR: ChordShape = {
  name: "D",
  positions: ["x", "x", 0, 2, 3, 2],
  fingers: [null, null, null, 1, 3, 2],
};

// 4-finger "fancy" G as taught in the Good Guitarist video — index on
// string 5 fret 2, middle on string 6 fret 3, ring on string 2 fret 3,
// pinky on string 1 fret 3. Sounds fuller than the 3-finger version.
export const G_MAJOR: ChordShape = {
  name: "G",
  positions: [3, 2, 0, 0, 3, 3],
  fingers: [2, 1, null, null, 3, 4],
};

export const C_MAJOR: ChordShape = {
  name: "C",
  positions: ["x", 3, 2, 0, 1, 0],
  fingers: [null, 3, 2, null, 1, null],
};

type Props = {
  shape: ChordShape;
  size?: "sm" | "md" | "lg";
  showFingerNumbers?: boolean;
  className?: string;
};

const SIZE_MAP = {
  sm: { w: 80, h: 95, dotR: 4, fontMark: 9, fontFinger: 7, captionClass: "text-base" },
  md: { w: 120, h: 140, dotR: 6, fontMark: 12, fontFinger: 10, captionClass: "text-2xl" },
  lg: { w: 180, h: 210, dotR: 9, fontMark: 16, fontFinger: 14, captionClass: "text-4xl sm:text-5xl" },
};

export function ChordDiagram({
  shape,
  size = "md",
  showFingerNumbers = false,
  className,
}: Props) {
  const dim = SIZE_MAP[size];
  const PAD_TOP = 26; // room for X/O labels above nut
  const PAD_BOTTOM = 14; // small bottom margin inside SVG (no caption inside)
  const SIDE = 12;
  const stringCount = 6;
  const fretCount = 4;

  const innerW = dim.w - SIDE * 2;
  const innerH = dim.h - PAD_TOP - PAD_BOTTOM;
  const stringStep = innerW / (stringCount - 1);
  const fretStep = innerH / fretCount;
  const nutY = PAD_TOP;

  return (
    <figure
      className={cn(
        "inline-flex flex-col items-center text-foreground",
        size === "lg" ? "gap-6" : size === "md" ? "gap-4" : "gap-3",
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${dim.w} ${dim.h}`}
        width={dim.w}
        height={dim.h}
        role="img"
        aria-label={`${shape.name} chord shape`}
      >
        {/* Nut (thick line) */}
        <line
          x1={SIDE}
          x2={dim.w - SIDE}
          y1={nutY}
          y2={nutY}
          stroke="currentColor"
          strokeWidth={size === "lg" ? 4 : size === "md" ? 3 : 2}
          strokeLinecap="round"
        />

        {/* Frets */}
        {Array.from({ length: fretCount }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={SIDE}
            x2={dim.w - SIDE}
            y1={nutY + fretStep * (i + 1)}
            y2={nutY + fretStep * (i + 1)}
            stroke="currentColor"
            strokeOpacity={0.35}
            strokeWidth={1}
          />
        ))}

        {/* Strings */}
        {Array.from({ length: stringCount }).map((_, i) => (
          <line
            key={`str-${i}`}
            x1={SIDE + stringStep * i}
            x2={SIDE + stringStep * i}
            y1={nutY}
            y2={nutY + innerH}
            stroke="currentColor"
            strokeOpacity={0.55}
            strokeWidth={1}
          />
        ))}

        {/* Open / muted markers above nut */}
        {shape.positions.map((p, idx) => {
          const x = SIDE + stringStep * idx;
          const y = nutY - 8;
          if (p === "x") {
            return (
              <text
                key={`mark-${idx}`}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize={dim.fontMark}
                fontFamily="ui-monospace, monospace"
                fill="currentColor"
                opacity={0.75}
              >
                ×
              </text>
            );
          }
          if (p === 0) {
            return (
              <circle
                key={`mark-${idx}`}
                cx={x}
                cy={y - dim.fontMark / 3}
                r={dim.fontMark / 2.5}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.75}
                strokeWidth={1}
              />
            );
          }
          return null;
        })}

        {/* Finger dots */}
        {shape.positions.map((p, idx) => {
          if (p === "x" || p === 0) return null;
          const fret = p as number;
          if (fret < 1 || fret > fretCount) return null;
          const x = SIDE + stringStep * idx;
          const y = nutY + fretStep * (fret - 0.5);
          const fingerNum = shape.fingers?.[idx];
          return (
            <g key={`dot-${idx}`}>
              <circle cx={x} cy={y} r={dim.dotR} fill="hsl(var(--primary))" />
              {showFingerNumbers && fingerNum && (
                <text
                  x={x}
                  y={y + dim.fontFinger / 3}
                  textAnchor="middle"
                  fontSize={dim.fontFinger}
                  fontFamily="Georgia, serif"
                  fontWeight={600}
                  fill="hsl(var(--primary-foreground))"
                >
                  {fingerNum}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <figcaption
        className={cn(
          "font-display font-medium italic leading-none text-foreground",
          dim.captionClass,
        )}
      >
        {shape.name}
      </figcaption>
    </figure>
  );
}
