"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Reveal from "./Reveal";
import { aiLab } from "@/data/content";

export default function AILab() {
  const sectionRef = useRef<HTMLElement>(null);
  const inkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced || !sectionRef.current || !inkRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const tween = gsap.fromTo(
      inkRef.current,
      { opacity: 0, scale: 0.7, rotate: -6 },
      {
        opacity: 0.9,
        scale: 1,
        rotate: 0,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          end: "top 10%",
          scrub: 1,
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="ai-lab"
      className="relative w-full overflow-hidden bg-midnight py-32 md:py-44"
      aria-label="AI Lab"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(17,28,42,0.4),transparent_60%)]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink to-transparent" />

      {/* Ink splash — the section's defining visual motif */}
      <div
        ref={inkRef}
        className="pointer-events-none absolute right-[-35%] top-8 w-[160%] opacity-0 sm:right-[-5%] sm:top-1/2 sm:w-[90%] sm:-translate-y-1/2 md:right-0 md:w-[70%] lg:w-[60%]"
        aria-hidden="true"
      >
        <Image
          src="/images/elements/ink-splash-900.webp"
          alt=""
          width={900}
          height={600}
          className="h-auto w-full object-contain opacity-40 sm:opacity-100"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10">
        <Reveal>
          <p className="mb-4 font-sans text-xs uppercase tracking-[0.4em] text-gold-soft/80">
            Section IV
          </p>
          <h2 className="font-serif-display text-4xl text-parchment sm:text-5xl">
            {aiLab.heading}
          </h2>
          <p className="mt-5 max-w-md font-serif-display text-xl italic text-parchment/60">
            {aiLab.tagline}
          </p>
        </Reveal>

        <div className="mt-16 grid max-w-xl grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
          {aiLab.capabilities.map((item, i) => (
            <Reveal key={item} delay={i * 0.08}>
              <div className="group flex items-center gap-4 border-b border-gold/10 pb-4">
                <span className="h-1 w-1 shrink-0 rounded-full bg-gold/60 transition-all duration-300 group-hover:w-4 group-hover:bg-gold" />
                <span className="font-sans text-sm text-parchment/75 transition-colors duration-300 group-hover:text-parchment">
                  {item}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
