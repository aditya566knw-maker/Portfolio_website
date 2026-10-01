"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";

interface FloatingElementProps {
  src: string;
  alt: string;
  widthClass: string;
  className?: string;
  /** "float" = slow vertical drift (feather/botanical), "sway" = pendulum rotation (lantern) */
  motion?: "float" | "sway" | "none";
  speed?: number;
  mouseStrength?: number;
  style?: React.CSSProperties;
  priority?: boolean;
}

export default function FloatingElement({
  src,
  alt,
  widthClass,
  className = "",
  motion = "float",
  speed = 0,
  mouseStrength = 0,
  style,
  priority = false,
}: FloatingElementProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const el = ref.current;
    if (!el || reduced) return;

    let scrollAnim: gsap.core.Tween | null = null;
    if (speed !== 0) {
      scrollAnim = gsap.to(el, {
        yPercent: speed * 10,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
        },
      });
    }

    let raf = 0;
    if (mouseStrength > 0 && !coarse) {
      let mx = 0;
      let cx = 0;
      const onMove = (e: MouseEvent) => {
        mx = (e.clientX / window.innerWidth - 0.5) * 2 * mouseStrength;
      };
      const tick = () => {
        cx += (mx - cx) * 0.05;
        el.style.setProperty("--fx", `${cx}px`);
        raf = requestAnimationFrame(tick);
      };
      window.addEventListener("mousemove", onMove, { passive: true });
      raf = requestAnimationFrame(tick);
      return () => {
        window.removeEventListener("mousemove", onMove);
        cancelAnimationFrame(raf);
        scrollAnim?.scrollTrigger?.kill();
        scrollAnim?.kill();
      };
    }

    return () => {
      scrollAnim?.scrollTrigger?.kill();
      scrollAnim?.kill();
    };
  }, [speed, mouseStrength]);

  const motionClass =
    motion === "float"
      ? "animate-drift"
      : motion === "sway"
      ? "animate-sway"
      : "";

  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute will-change-transform ${widthClass} ${className}`}
      style={{
        transform: "translate3d(var(--fx, 0), 0, 0)",
        ...style,
      }}
    >
      <div className={motionClass} style={{ transformOrigin: "50% 0%" }}>
        <Image
          src={src}
          alt={alt}
          width={900}
          height={900}
          priority={priority}
          className="h-auto w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
        />
      </div>
    </div>
  );
}
