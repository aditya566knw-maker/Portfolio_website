"use client";

import { useEffect, useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import gsap from "gsap";

interface ParallaxLayerProps {
  src: string | StaticImageData;
  alt: string;
  /** Relative scroll speed factor: <1 drifts slower than scroll (background), >1 faster (foreground). */
  speed?: number;
  /** Mouse parallax strength in pixels at max mouse offset. 0 disables. */
  mouseStrength?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  /** CSS object-position */
  objectPosition?: string;
  children?: never;
}

/**
 * A single depth layer used to build pseudo-3D scenes from 2D art.
 * Combines a slow scroll-linked drift (GSAP) with subtle mouse-driven
 * parallax, respecting prefers-reduced-motion.
 */
export default function ParallaxLayer({
  src,
  alt,
  speed = 0,
  mouseStrength = 0,
  className = "",
  sizes = "100vw",
  priority = false,
  quality = 70,
  objectPosition = "center",
}: ParallaxLayerProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduced) return;

    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    let mx = 0;
    let my = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;

    const onMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      mx = nx * mouseStrength;
      my = ny * mouseStrength;
    };

    const tick = () => {
      cx += (mx - cx) * 0.06;
      cy += (my - cy) * 0.06;
      inner.style.setProperty("--mx", `${cx}px`);
      inner.style.setProperty("--my", `${cy}px`);
      raf = requestAnimationFrame(tick);
    };

    if (mouseStrength > 0 && !coarse) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      raf = requestAnimationFrame(tick);
    }

    let scrollAnim: gsap.core.Tween | null = null;
    if (speed !== 0) {
      scrollAnim = gsap.to(inner, {
        yPercent: speed * 12,
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
        },
      });
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(raf);
      scrollAnim?.scrollTrigger?.kill();
      scrollAnim?.kill();
    };
  }, [speed, mouseStrength]);

  return (
    <div ref={wrapRef} className={`absolute inset-0 overflow-hidden ${className}`}>
      <div
        ref={innerRef}
        className="absolute inset-0"
        style={{
          transform: "translate3d(var(--mx, 0), var(--my, 0), 0)",
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={quality}
          className="object-cover"
          style={{ objectPosition }}
        />
      </div>
    </div>
  );
}
