"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";

interface LoadingScreenProps {
  onDone: () => void;
}

export default function LoadingScreen({ onDone }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced) {
      // Defer out of the synchronous effect body to avoid a same-tick
      // cascading setState; still resolves before the next paint.
      queueMicrotask(() => {
        setVisible(false);
        onDone();
      });
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setVisible(false);
        onDone();
      },
    });

    tl.to(".loader-label", { opacity: 1, duration: 0.6, delay: 0.2 })
      .to(".loader-label", { opacity: 0, duration: 0.5, delay: 0.5 })
      .to(
        ".loader-title",
        { opacity: 1, letterSpacing: "0.35em", duration: 0.9, ease: "power2.out" },
        "-=0.1"
      )
      .to(".loader-title", { opacity: 0, duration: 0.5, delay: 0.4 })
      .to(".loader-screen", { opacity: 0, duration: 0.8, ease: "power2.inOut" });

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div
      className="loader-screen fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink"
      role="status"
      aria-live="polite"
    >
      <p className="loader-label mb-6 font-sans text-xs uppercase tracking-[0.4em] text-gold/70 opacity-0">
        Entering the Archive
      </p>
      <h1 className="loader-title font-serif-display text-3xl tracking-[0.15em] text-parchment opacity-0 md:text-4xl">
        INKOFJATAYU
      </h1>
    </div>
  );
}
