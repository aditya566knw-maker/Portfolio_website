"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { identity } from "@/data/content";
import { getLenis } from "./SmoothScroll";

interface HeroProps {
  /** Fires the intro animation once the loading screen has finished. */
  ready: boolean;
}

export default function Hero({ ready }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const featherRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  useEffect(() => {
    if (!ready || played.current) return;
    played.current = true;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced) {
      gsap.set(
        [bgRef.current, mistRef.current, featherRef.current, titleRef.current, ctaRef.current],
        { opacity: 1, y: 0, x: 0 }
      );
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    tl.set(bgRef.current, { opacity: 0, scale: 1.08 })
      .set(mistRef.current, { opacity: 0 })
      .set(featherRef.current, { opacity: 0, y: -40, rotate: -8 })
      .set(titleRef.current, { opacity: 0, y: 24 })
      .set(ctaRef.current, { opacity: 0, y: 16 })
      .to(bgRef.current, { opacity: 1, scale: 1, duration: 2.4, ease: "power1.out" }, 0.2)
      .to(featherRef.current, { opacity: 0.9, y: 0, rotate: 0, duration: 1.8, ease: "power2.out" }, 0.9)
      .to(mistRef.current, { opacity: 1, duration: 1.8 }, 1.1)
      .to(titleRef.current, { opacity: 1, y: 0, duration: 1.2 }, 1.7)
      .to(ctaRef.current, { opacity: 1, y: 0, duration: 1, pointerEvents: "auto" }, 2.2);

    // Gentle continuous camera drift on the background
    gsap.to(bgRef.current, {
      scale: 1.06,
      duration: 18,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      delay: 2.6,
    });

    return () => {
      tl.kill();
    };
  }, [ready]);

  const scrollToArchive = () => {
    const el = document.querySelector("#archive");
    const lenis = getLenis();
    if (el && lenis) lenis.scrollTo(el as HTMLElement, { duration: 1.6 });
    else el?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToWork = () => {
    const el = document.querySelector("#work");
    const lenis = getLenis();
    if (el && lenis) lenis.scrollTo(el as HTMLElement, { duration: 1.6 });
    else el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative flex h-[100svh] min-h-[640px] w-full items-center justify-center overflow-hidden bg-ink"
      aria-label="Introduction"
    >
      {/* Background environment */}
      <div ref={bgRef} className="absolute inset-0">
        <Image
          src="/images/scene/gate-1920.webp"
          alt="A moonlit ancient palace courtyard, lanterns glowing among autumn maples and distant mountains"
          fill
          priority
          sizes="100vw"
          quality={80}
          className="object-cover"
          style={{ objectPosition: "center 40%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/20 to-ink" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
      </div>

      {/* Mist layer */}
      <div
        ref={mistRef}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink via-ink/40 to-transparent"
      />

      {/* Feather element drifting in foreground */}
      <div
        ref={featherRef}
        className="pointer-events-none absolute right-[6%] top-[14%] w-28 opacity-0 sm:w-36 md:right-[10%] md:w-44 lg:w-52"
      >
        <div className="animate-drift">
          <Image
            src="/images/elements/feather-480.webp"
            alt=""
            width={480}
            height={720}
            className="h-auto w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
          />
        </div>
      </div>

      {/* Typography */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <div ref={titleRef} className="opacity-0">
          <p className="mb-4 font-sans text-[0.65rem] uppercase tracking-[0.5em] text-gold-soft/90 sm:text-xs">
            {identity.brand}
          </p>
          <h1 className="font-serif-display text-5xl leading-[1.05] text-parchment text-balance sm:text-6xl md:text-7xl lg:text-8xl">
            {identity.name}
          </h1>
          <p className="mx-auto mt-6 max-w-xs font-sans text-[0.6rem] uppercase tracking-[0.2em] text-parchment/70 sm:max-w-none sm:whitespace-nowrap sm:text-xs sm:tracking-[0.25em] md:text-sm">
            {identity.positioning.join("  ·  ")}
          </p>
          <p className="mx-auto mt-6 max-w-[85vw] font-serif-display text-lg italic text-parchment/60 sm:max-w-md sm:text-xl">
            &ldquo;{identity.statement}&rdquo;
          </p>
        </div>

        <div
          ref={ctaRef}
          className="pointer-events-none mt-12 flex flex-col items-center gap-5 opacity-0 sm:flex-row sm:gap-8"
        >
          <button
            type="button"
            onClick={scrollToArchive}
            className="cursor-hover group relative overflow-hidden border border-gold/50 px-8 py-3 font-sans text-xs uppercase tracking-[0.25em] text-parchment transition-colors duration-500 hover:border-gold"
          >
            <span className="relative z-10 transition-colors duration-500 group-hover:text-ink">
              Enter the Archive
            </span>
            <span className="absolute inset-0 -translate-x-full bg-gold transition-transform duration-500 ease-out group-hover:translate-x-0" />
          </button>
          <button
            type="button"
            onClick={scrollToWork}
            className="link-gold cursor-hover font-sans text-xs uppercase tracking-[0.25em] text-parchment/70 transition-colors hover:text-gold-soft"
          >
            Explore My Work
          </button>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 opacity-60">
        <div className="h-10 w-px animate-pulse bg-gradient-to-b from-gold to-transparent" />
      </div>
    </section>
  );
}
