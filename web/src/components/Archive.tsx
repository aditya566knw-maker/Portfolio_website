import Image from "next/image";
import Reveal from "./Reveal";
import ParallaxLayer from "./ParallaxLayer";
import { education, identity } from "@/data/content";

export default function Archive() {
  return (
    <section
      id="archive"
      className="relative w-full overflow-hidden bg-ink py-28 md:py-36"
      aria-label="About Aditya Singh"
    >
      <ParallaxLayer
        src="/images/scene/library-1920.webp"
        alt="An ancient candlelit library archive, scrolls and books lining tall shelves"
        speed={-0.6}
        mouseStrength={6}
        className="opacity-35"
        quality={65}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/85 to-ink" />

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-16 px-6 md:grid-cols-12 md:px-10">
        <div className="md:col-span-5">
          <Reveal>
            <p className="mb-4 font-sans text-xs uppercase tracking-[0.4em] text-gold-soft/80">
              Section I
            </p>
            <h2 className="font-serif-display text-4xl text-parchment sm:text-5xl">
              The Archive
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-6 max-w-md font-serif-display text-lg italic leading-relaxed text-parchment/70">
              &ldquo;I work across marketing, analytics, brand strategy and
              AI-powered creative workflows.&rdquo;
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="mt-6 max-w-md font-sans text-sm leading-relaxed text-parchment/60">
              Based in {identity.location}, currently serving as{" "}
              {identity.role}. This archive holds the record of a path built
              at the crossing of business, data, and creative technology.
            </p>
          </Reveal>
        </div>

        <div className="md:col-span-7">
          <Reveal delay={0.1} className="mb-6">
            <p className="font-sans text-xs uppercase tracking-[0.4em] text-gold-soft/60">
              Education
            </p>
          </Reveal>
          <ol className="flex flex-col gap-8">
            {education.map((entry, i) => (
              <Reveal key={entry.degree} delay={0.15 + i * 0.12} as="li">
                <div className="group relative border-l border-gold/25 py-1 pl-8">
                  <span className="absolute -left-[5px] top-2 h-[9px] w-[9px] rounded-full bg-gold/70 transition-colors group-hover:bg-gold" />
                  <p className="font-serif-display text-2xl text-parchment sm:text-3xl">
                    {entry.degree}
                  </p>
                  <p className="mt-1 font-sans text-sm text-parchment/60">
                    {entry.school}
                  </p>
                  <p className="mt-1 font-sans text-xs uppercase tracking-[0.2em] text-gold-soft/70">
                    {entry.period}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={0.4} className="mt-14">
            <div className="relative border border-gold/15 bg-parchment/[0.03] p-8 backdrop-blur-[2px]">
              <div className="pointer-events-none absolute -right-6 -top-10 w-24 opacity-70 sm:w-28">
                <Image
                  src="/images/elements/scroll-480.webp"
                  alt=""
                  width={480}
                  height={320}
                  className="h-auto w-full object-contain"
                />
              </div>
              <p className="max-w-sm font-serif-display text-lg leading-relaxed text-parchment/80">
                Marketing, business, data and AI — read not as separate
                disciplines, but as one continuous craft.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
