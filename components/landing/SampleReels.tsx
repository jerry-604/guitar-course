const CDN = "https://videos.thanielguitarlessons.com";

type Reel = {
  src: string;
  label: string;
  sublabel: string;
};

const REELS: Reel[] = [
  {
    src: `${CDN}/77k8ho_1.mp4`,
    label: "Piano",
    sublabel: "Studio cut",
  },
  {
    src: `${CDN}/6fn5rd_1.mp4`,
    label: "Piano",
    sublabel: "Live take",
  },
  {
    src: `${CDN}/rdfq6d_1.mp4`,
    label: "Guitar",
    sublabel: "Jazz concert solo",
  },
];

/**
 * Three short clips of Jerry actually playing — drops directly into the
 * InstructorPitch as proof for the "professional bass guitarist" claim.
 * Autoplay muted loop so the proof is ambient, not a click-to-play wall.
 * Controls are exposed so visitors can unmute or scrub.
 */
export function SampleReels() {
  return (
    <div className="mt-8">
      <div className="caps mb-3">Receipts · hear me play</div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
        {REELS.map((r) => (
          <figure key={r.src} className="space-y-2">
            <div className="border border-foreground/15 bg-black p-1 shadow-sm">
              <video
                src={r.src}
                autoPlay
                muted
                loop
                playsInline
                controls
                preload="metadata"
                className="aspect-video w-full bg-black"
              />
            </div>
            <figcaption className="caps flex items-baseline justify-between text-foreground/70">
              <span className="text-foreground/85">{r.label}</span>
              <span>{r.sublabel}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
