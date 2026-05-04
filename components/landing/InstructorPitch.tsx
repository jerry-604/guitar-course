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
        </div>

        <div className="md:col-span-7 space-y-6 text-lg leading-relaxed text-foreground/85">
          <p>
            Every lesson here was watched, vetted, and ordered by someone who
            used to teach bass and piano for a living. There are thousands of
            beginner guitar videos online. Most of them assume you already
            know things you don&apos;t.
          </p>
          <p>
            This is the path I wish someone had handed me — three open chords,
            three transitions, and a real country song you can actually play.
            No interruptions, no &ldquo;watch this next&rdquo; algorithm,
            no ad breaks in the middle of a strumming pattern.
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
          <p className="caps pt-2">
            All vetted · downloaded · ad-free
          </p>
        </div>
      </div>
    </section>
  );
}
