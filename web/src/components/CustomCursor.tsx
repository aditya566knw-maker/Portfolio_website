"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Elegant custom cursor: a small dot with a trailing gold ring.
 * Disabled entirely on touch devices / coarse pointers and when the user
 * prefers reduced motion.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  // This component is loaded with ssr:false (see layout.tsx), so window is
  // always available here and this lazy initializer never runs during SSR
  // or hydration — safe to read matchMedia directly without an effect.
  const [enabled] = useState(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    return fine && !reduced;
  });
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    document.body.classList.add("cursor-enabled");

    let ringX = 0;
    let ringY = 0;
    let targetX = 0;
    let targetY = 0;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      }
      const el = e.target as HTMLElement | null;
      const interactive = !!el?.closest(
        'a, button, [role="button"], input, textarea, .cursor-hover'
      );
      setActive(interactive);
    };

    const tick = () => {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      document.body.classList.remove("cursor-enabled");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none">
      <div
        ref={dotRef}
        className="fixed left-0 top-0 z-[9999] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-soft will-change-transform"
        style={{ transition: "transform 0.03s linear" }}
      />
      <div
        ref={ringRef}
        className="fixed left-0 top-0 z-[9998] -translate-x-1/2 -translate-y-1/2 rounded-full border will-change-transform transition-[width,height,opacity,border-color] duration-300 ease-out"
        style={{
          width: active ? 46 : 28,
          height: active ? 46 : 28,
          borderColor: active
            ? "rgba(185,147,74,0.85)"
            : "rgba(185,147,74,0.45)",
          opacity: 0.9,
        }}
      />
    </div>
  );
}
