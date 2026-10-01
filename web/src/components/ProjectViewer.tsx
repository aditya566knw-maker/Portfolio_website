"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { Project } from "@/data/projects";

interface ProjectViewerProps {
  project: Project | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function ProjectViewer({
  project,
  onClose,
  onNext,
  onPrev,
}: ProjectViewerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!project) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    if (!reduced) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      );
      gsap.fromTo(
        scrollRef.current,
        { opacity: 0, scaleY: 0.85, y: 20 },
        { opacity: 1, scaleY: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [project, onClose, onNext, onPrev]);

  if (!project) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/90 backdrop-blur-md p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-viewer-title"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        ref={scrollRef}
        className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto border border-gold/25 bg-ink px-7 py-10 shadow-[0_0_80px_rgba(0,0,0,0.6)] sm:px-12 sm:py-14"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(232,215,181,0.5) 2px, rgba(232,215,181,0.5) 3px)",
          }}
          aria-hidden="true"
        />

        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          className="cursor-hover absolute right-5 top-5 font-sans text-xs uppercase tracking-[0.2em] text-parchment/60 transition-colors hover:text-gold-soft"
        >
          Close ✕
        </button>

        <p className="font-sans text-xs uppercase tracking-[0.35em] text-gold-soft/70">
          {project.category}
        </p>
        <h3
          id="project-viewer-title"
          className="mt-3 font-serif-display text-4xl text-parchment sm:text-5xl"
        >
          {project.name}
        </h3>
        <p className="mt-2 font-sans text-sm uppercase tracking-[0.15em] text-parchment/50">
          {project.role}
        </p>

        <p className="mt-8 max-w-lg font-serif-display text-lg leading-relaxed text-parchment/80">
          {project.description}
        </p>

        <div className="mt-8">
          <p className="mb-3 font-sans text-xs uppercase tracking-[0.3em] text-gold-soft/60">
            Tools &amp; Skills
          </p>
          <div className="flex flex-wrap gap-2">
            {project.tools.map((tool) => (
              <span
                key={tool}
                className="border border-gold/20 px-3 py-1.5 font-sans text-xs text-parchment/70"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-gold/10 pt-6">
          <p className="mb-2 font-sans text-xs uppercase tracking-[0.3em] text-gold-soft/60">
            Purpose
          </p>
          <p className="max-w-lg font-sans text-sm leading-relaxed text-parchment/65">
            {project.outcome}
          </p>
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-gold/10 pt-6">
          <button
            type="button"
            onClick={onPrev}
            className="cursor-hover link-gold font-sans text-xs uppercase tracking-[0.2em] text-parchment/70 hover:text-gold-soft"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={onNext}
            className="cursor-hover link-gold font-sans text-xs uppercase tracking-[0.2em] text-parchment/70 hover:text-gold-soft"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
