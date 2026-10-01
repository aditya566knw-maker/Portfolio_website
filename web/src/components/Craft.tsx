"use client";

import { useState } from "react";
import Reveal from "./Reveal";
import ParallaxLayer from "./ParallaxLayer";
import FloatingElement from "./FloatingElement";
import { skillCategories } from "@/data/content";

export default function Craft() {
  const [activeKey, setActiveKey] = useState(skillCategories[0].key);
  const active =
    skillCategories.find((c) => c.key === activeKey) ?? skillCategories[0];

  return (
    <section
      id="craft"
      className="relative w-full overflow-hidden bg-jade/40 py-28 md:py-36"
      aria-label="Skills and craft"
    >
      <ParallaxLayer
        src="/images/scene/study-1920.webp"
        alt="A moonlit study with botanical arrangements, ink brushes, and scrolls"
        speed={-0.5}
        mouseStrength={5}
        className="opacity-25"
        quality={65}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-jade/60 to-ink" />

      <FloatingElement
        src="/images/elements/botanical-900.webp"
        alt=""
        widthClass="w-64 sm:w-80 md:w-[26rem]"
        className="-left-16 top-10 opacity-20 sm:opacity-25"
        motion="none"
        speed={-0.3}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        <Reveal>
          <p className="mb-4 font-sans text-xs uppercase tracking-[0.4em] text-gold-soft/80">
            Section II
          </p>
          <h2 className="font-serif-display text-4xl text-parchment sm:text-5xl">
            The Craft
          </h2>
          <p className="mt-5 max-w-lg font-sans text-sm leading-relaxed text-parchment/60">
            A cultivated set of tools, gathered like specimens in a study —
            each category a small garden of its own.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Category selector */}
          <div className="lg:col-span-4">
            <ul className="flex flex-col gap-1 border-l border-gold/15">
              {skillCategories.map((cat, i) => (
                <Reveal as="li" key={cat.key} delay={i * 0.06}>
                  <button
                    type="button"
                    onClick={() => setActiveKey(cat.key)}
                    className={`cursor-hover -ml-px block w-full border-l py-3 pl-6 pr-4 text-left font-serif-display text-2xl transition-all duration-300 sm:text-3xl ${
                      activeKey === cat.key
                        ? "border-gold text-gold-soft"
                        : "border-transparent text-parchment/45 hover:text-parchment/80"
                    }`}
                    aria-pressed={activeKey === cat.key}
                  >
                    {cat.title}
                  </button>
                </Reveal>
              ))}
            </ul>
          </div>

          {/* Active category detail */}
          <div className="lg:col-span-8">
            <div
              key={active.key}
              className="relative min-h-[280px] border border-gold/15 bg-ink/40 p-8 backdrop-blur-[2px] sm:p-10"
              style={{ animation: "fade-up 0.6s cubic-bezier(0.16,1,0.3,1)" }}
            >
              <div className="flex flex-wrap gap-x-3 gap-y-4">
                {active.skills.map((skill, i) => (
                  <span
                    key={skill}
                    className="cursor-hover group relative border border-gold/25 px-4 py-2 font-sans text-sm text-parchment/80 transition-all duration-300 hover:border-gold hover:text-gold-soft"
                    style={{
                      animation: `fade-up 0.5s cubic-bezier(0.16,1,0.3,1) ${
                        i * 0.05
                      }s both`,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
