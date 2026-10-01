import Reveal from "./Reveal";
import { timeline } from "@/data/content";

export default function Timeline() {
  return (
    <section
      id="path"
      className="relative w-full overflow-hidden bg-ink py-28 md:py-36"
      aria-label="Career timeline"
    >
      <div className="relative z-10 mx-auto max-w-4xl px-6 md:px-10">
        <Reveal>
          <p className="mb-4 font-sans text-xs uppercase tracking-[0.4em] text-gold-soft/80">
            Section V
          </p>
          <h2 className="font-serif-display text-4xl text-parchment sm:text-5xl">
            The Path
          </h2>
        </Reveal>

        <ol className="relative mt-16 flex flex-col gap-14 pl-8 sm:pl-10">
          <div
            className="absolute left-[3px] top-2 bottom-2 w-px bg-gradient-to-b from-gold/60 via-gold/20 to-transparent sm:left-[5px]"
            aria-hidden="true"
          />
          {timeline.map((entry, i) => (
            <Reveal as="li" key={entry.period + entry.title} delay={i * 0.1}>
              <div className="relative">
                <span
                  className="absolute -left-8 top-1.5 h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-gold shadow-[0_0_12px_rgba(185,147,74,0.6)] sm:-left-10"
                  aria-hidden="true"
                />
                <p className="font-sans text-xs uppercase tracking-[0.25em] text-gold-soft/70">
                  {entry.period}
                </p>
                <h3 className="mt-2 font-serif-display text-2xl text-parchment sm:text-3xl">
                  {entry.title}
                </h3>
                {entry.org && (
                  <p className="mt-1 font-sans text-sm text-parchment/55">
                    {entry.org}
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
