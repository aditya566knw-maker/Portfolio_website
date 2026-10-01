"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Reveal from "./Reveal";
import ParallaxLayer from "./ParallaxLayer";
import { projects } from "@/data/projects";

const ProjectViewer = dynamic(() => import("./ProjectViewer"), {
  ssr: false,
});

export default function Work() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const next = useCallback(
    () => setActiveIndex((i) => (i === null ? null : (i + 1) % projects.length)),
    []
  );
  const prev = useCallback(
    () =>
      setActiveIndex((i) =>
        i === null ? null : (i - 1 + projects.length) % projects.length
      ),
    []
  );

  const active = activeIndex !== null ? projects[activeIndex] : null;

  return (
    <section
      id="work"
      className="relative w-full overflow-hidden bg-ink py-28 md:py-36"
      aria-label="Selected work"
    >
      <ParallaxLayer
        src="/images/scene/library-1920.webp"
        alt="Grand ancient archive hall with towering shelves of scrolls"
        speed={-0.4}
        mouseStrength={4}
        className="opacity-20"
        quality={65}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/90 to-ink" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        <Reveal>
          <p className="mb-4 font-sans text-xs uppercase tracking-[0.4em] text-gold-soft/80">
            Section III
          </p>
          <h2 className="font-serif-display text-4xl text-parchment sm:text-5xl">
            The Work
          </h2>
          <p className="mt-5 max-w-lg font-sans text-sm leading-relaxed text-parchment/60">
            Each record below opens like a scroll pulled from the shelf —
            a project, a role, a purpose.
          </p>
        </Reveal>

        <ol className="mt-16 flex flex-col divide-y divide-gold/10 border-y border-gold/10">
          {projects.map((project, i) => (
            <Reveal as="li" key={project.slug} delay={Math.min(i * 0.05, 0.3)}>
              <button
                type="button"
                onClick={() => setActiveIndex(i)}
                className="cursor-hover group flex w-full items-center justify-between gap-6 py-7 text-left transition-colors duration-300 hover:bg-gold/[0.03] sm:py-8"
              >
                <div className="flex items-baseline gap-4 sm:gap-8">
                  <span className="font-sans text-xs text-gold-soft/40 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-serif-display text-2xl text-parchment transition-colors duration-300 group-hover:text-gold-soft sm:text-3xl">
                      {project.name}
                      {project.featured && (
                        <span className="ml-3 align-middle font-sans text-[0.6rem] uppercase tracking-[0.2em] text-crimson/80">
                          Featured
                        </span>
                      )}
                    </h3>
                    <p className="mt-1 font-sans text-xs uppercase tracking-[0.15em] text-parchment/45">
                      {project.category}
                    </p>
                  </div>
                </div>
                <span className="hidden shrink-0 font-sans text-xs uppercase tracking-[0.2em] text-parchment/40 transition-all duration-300 group-hover:text-gold-soft group-hover:tracking-[0.3em] sm:inline">
                  Open →
                </span>
              </button>
            </Reveal>
          ))}
        </ol>
      </div>

      <ProjectViewer
        project={active}
        onClose={close}
        onNext={next}
        onPrev={prev}
      />
    </section>
  );
}
