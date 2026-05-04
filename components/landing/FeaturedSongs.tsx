import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import { getCurriculum } from "@/lib/queries/curriculum";

export async function FeaturedSongs() {
  const curriculum = await getCurriculum();
  const songs = curriculum.filter((m) => m.kind === "song");

  return (
    <section className="border-b border-border/60 bg-card">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-14 flex items-end justify-between gap-8 flex-wrap">
          <div>
            <div className="caps mb-3">The destinations</div>
            <h2 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
              Two songs you&apos;ll&nbsp;play.
            </h2>
          </div>
          <p className="max-w-md text-foreground/75 leading-relaxed">
            Both George Strait. Both 100% playable on a beginner&apos;s
            three-chord toolkit. The second one waits until the first one&apos;s
            in your hands.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          {songs.map((song, idx) => (
            <article
              key={song.slug}
              className="group flex flex-col gap-5"
            >
              {/* Album-spread style cover image */}
              <Link
                href={`/learn/${song.slug}/${song.lessons[0]?.slug ?? ""}`}
                className="relative block aspect-square overflow-hidden border border-border/60 bg-muted/30"
              >
                {song.coverImageUrl ? (
                  <Image
                    src={song.coverImageUrl}
                    alt={`${song.songTitle} cover art`}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="caps">cover coming</span>
                  </div>
                )}

                {/* Lock for second song until first is complete (display-only) */}
                {idx === 1 && (
                  <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-foreground shadow-sm">
                    <Lock className="h-3 w-3" />
                    <span>Side B</span>
                  </div>
                )}

                {/* Side label like a vinyl */}
                <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-background/95 font-display text-base font-semibold text-foreground shadow-sm">
                  {idx === 0 ? "A" : "B"}
                </div>
              </Link>

              <div className="flex items-baseline justify-between gap-4">
                <div className="min-w-0">
                  <div className="caps mb-1">
                    Song {idx + 1} · {song.songArtist}
                  </div>
                  <h3 className="font-display text-2xl font-medium tracking-tight">
                    {song.songTitle}
                  </h3>
                </div>
                <Link
                  href={`/learn/${song.slug}/${song.lessons[0]?.slug ?? ""}`}
                  className="editorial-cta editorial-cta--primary shrink-0"
                >
                  {idx === 0 ? "Begin" : "Preview"}
                </Link>
              </div>
              {song.description && (
                <p className="text-foreground/75 leading-relaxed">
                  {song.description}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
