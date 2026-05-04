export function InstructorPitch() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 py-24 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="caps mb-4">Why this curriculum</div>
          <h2 className="font-display text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
            Curated.
            <br />
            <span className="italic text-primary">Not assembled.</span>
          </h2>
          <p className="caps mt-6">— Jeremiah</p>
        </div>

        <div className="md:col-span-7 space-y-6 text-lg leading-relaxed text-foreground/85">
          <p>
            Hi — I&apos;m Jeremiah. I&apos;m a professional bass guitarist.
            Back in Nigeria, before I moved to the US, I played multiple
            concerts and tutored bass and piano students one-on-one. So
            when I say I picked the videos on this site, I mean I sat with
            every one of them with the eye of somebody who&apos;s actually
            put a chord under a beginner&apos;s fingers and watched them
            get it.
          </p>
          <p>
            There are thousands of beginner guitar videos online. Most of
            them assume you already know things you don&apos;t. The ones
            here are the ones I&apos;d hand a student — clear, in the
            right order, no surprise prerequisites buried halfway through,
            nothing that wastes your first hour with a guitar in your hand.
          </p>
          <p>
            Three open chords, three transitions, and a real country song
            you can actually play. No interruptions, no &ldquo;watch this
            next&rdquo; algorithm, no ad breaks in the middle of a
            strumming pattern.
          </p>
          <p>
            The teachers featured here:
          </p>
          <ul className="grid grid-cols-2 gap-x-8 gap-y-2 font-display text-foreground sm:grid-cols-4">
            <li>JustinGuitar</li>
            <li>Good Guitarist</li>
            <li>Dad Rock Dojo</li>
            <li>Kevin Nickens</li>
          </ul>

          <div className="border-t border-border/60 pt-6 mt-8 space-y-2">
            <div className="caps">If you have any questions</div>
            <p className="text-base text-foreground/85">
              Ask <strong className="font-display text-primary">Jeremiah AI</strong>
              {" "}— the floating chat in the bottom-right corner — for instant
              help during a lesson. For anything that needs a real human reply,
              email me at{" "}
              <a
                href="mailto:jeremiahomolewa.work@gmail.com"
                className="font-display text-primary underline-offset-4 transition-colors hover:underline"
              >
                jeremiahomolewa.work@gmail.com
              </a>
              .
            </p>
          </div>

          <p className="caps pt-4">
            All vetted · downloaded · ad-free
          </p>
        </div>
      </div>
    </section>
  );
}
