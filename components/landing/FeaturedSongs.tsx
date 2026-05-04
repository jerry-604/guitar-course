import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import { getCurriculum } from "@/lib/queries/curriculum";
import { SongLockModal } from "@/components/landing/SongLockModal";

export async function FeaturedSongs() {
  const curriculum = await getCurriculum();
  const songs = curriculum.filter((m) => m.kind === "song");
  const sideA = songs[0];

  return (
    <section className="border-b border-border/60 bg-card">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-24">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 sm:mb-14 sm:flex-row sm:items-end sm:gap-8">
          <div>
            <div className="caps mb-3">The destinations</div>
            <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl">
              Two songs you&apos;ll&nbsp;play.
            </h2>
          </div>
          <p className="max-w-md text-foreground/75 leading-relaxed">
            Both George Strait. Both 100% playable on a beginner&apos;s
            three-chord toolkit. Side B opens after Jeremiah grades your tape
            of Side A.
          </p>
        </div>

        <div className="grid gap-8 sm:gap-10 md:grid-cols-2">
          {songs.map((song, idx) => {
            const isLocked = idx > 0; // landing always shows Side A as available
            const cover = (
              <div className="relative block aspect-square overflow-hidden border border-border/60 bg-muted/30 group">
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

                {isLocked && (
                  <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-foreground shadow-sm">
                    <Lock className="h-3 w-3" />
                    <span>Side B</span>
                  </div>
                )}

                <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-background/95 font-display text-base font-semibold text-foreground shadow-sm">
                  {idx === 0 ? "A" : "B"}
                </div>
              </div>
            );

            const meta = (
              <div className="mt-5 flex items-baseline justify-between gap-4">
                <div className="min-w-0">
                  <div className="caps mb-1">
                    Song {idx + 1} · {song.songArtist}
                  </div>
                  <h3 className="font-display text-2xl font-medium tracking-tight">
                    {song.songTitle}
                  </h3>
                </div>
                <span className="editorial-cta editorial-cta--primary shrink-0 pointer-events-none">
                  {isLocked ? "Why locked?" : "Begin"}
                </span>
              </div>
            );

            return (
              <article key={song.slug} className="flex flex-col">
                {isLocked ? (
                  <SongLockModal
                    trigger={
                      <button type="button" className="block w-full text-left">
                        {cover}
                        {meta}
                      </button>
                    }
                    songTitle={song.songTitle ?? song.title}
                    songArtist={song.songArtist ?? "George Strait"}
                    blockingSongTitle={
                      sideA?.songTitle ?? sideA?.title ?? "the previous song"
                    }
                    blockingHref={
                      sideA
                        ? `/learn/${sideA.slug}/${sideA.lessons[0]?.slug ?? ""}`
                        : "/learn"
                    }
                  />
                ) : (
                  <Link
                    href={`/learn/${song.slug}/${song.lessons[0]?.slug ?? ""}`}
                    className="block"
                  >
                    {cover}
                    {meta}
                  </Link>
                )}
                {song.description && (
                  <p className="mt-4 text-foreground/75 leading-relaxed">
                    {song.description}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
