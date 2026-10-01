"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PROJECTS } from "@/hooks/useInkWorld";

/* The Work section — project list + project viewer modal.
   Mirrors script.js section 11: list rendering (index padStart,
   featured span, Open →), open/close viewer, prev/next, keyboard
   (Esc/←/→), focus management, body overflow lock, hover sparkle. */
export default function Work() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarse = () =>
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  const open = useCallback((index: number) => {
    if (typeof document !== "undefined") {
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";
    }
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setActiveIndex(index);
    // Let the element mount (hidden removed), then add is-visible so the
    // opacity/transform transition runs — mirrors the forced reflow.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsVisible(true));
    });
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);
    if (typeof document !== "undefined") document.body.style.overflow = "";
    const delay = prefersReduced ? 0 : 400;
    hideTimerRef.current = window.setTimeout(() => {
      setActiveIndex(null);
    }, delay);
    const last = lastFocusedRef.current;
    if (last && typeof last.focus === "function") last.focus();
  }, [prefersReduced]);

  const next = useCallback(() => {
    setActiveIndex((i) => (i === null ? i : (i + 1) % PROJECTS.length));
  }, []);
  const prev = useCallback(() => {
    setActiveIndex((i) => (i === null ? i : (i - 1 + PROJECTS.length) % PROJECTS.length));
  }, []);

  // Keyboard handling while the viewer is open.
  useEffect(() => {
    if (activeIndex === null) return;
    function onKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  }, [activeIndex, close, next, prev]);

  // Focus the close button once the viewer becomes visible.
  useEffect(() => {
    if (isVisible && closeBtnRef.current) closeBtnRef.current.focus();
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      if (typeof document !== "undefined") document.body.style.overflow = "";
    };
  }, []);

  function onRowEnter(e: React.MouseEvent<HTMLButtonElement>) {
    if (isCoarse() || !window.InkWorld) return;
    const r = e.currentTarget.getBoundingClientRect();
    window.InkWorld.sparkleAt(r.left + 14, r.top + r.height / 2);
  }

  const project = activeIndex !== null ? PROJECTS[activeIndex] : null;

  return (
    <>
      <ol id="work-list" className="work-list" data-cursor="inspect">
        {PROJECTS.map((p, i) => (
          <li className="reveal" key={p.slug}>
            <button
              type="button"
              className="work-item-btn cursor-hover"
              data-index={String(i)}
              onClick={() => open(i)}
              onMouseEnter={onRowEnter}
            >
              <div className="work-item-left">
                <span className="work-item-index">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="work-item-name">
                    {p.name}
                    {p.featured ? <span className="work-item-featured">Featured</span> : null}
                  </h3>
                  <p className="work-item-category">{p.category}</p>
                </div>
              </div>
              <span className="work-item-open">Open →</span>
            </button>
          </li>
        ))}
      </ol>

      <div
        id="project-viewer"
        className={"project-viewer" + (isVisible ? " is-visible" : "")}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-viewer-title"
        hidden={project === null}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="project-viewer-scroll">
          <div className="project-viewer-texture" aria-hidden="true"></div>
          <button
            type="button"
            id="project-viewer-close"
            className="project-viewer-close cursor-hover"
            ref={closeBtnRef}
            onClick={close}
          >
            Close ✕
          </button>
          <div className="project-viewer-seal" aria-hidden="true">
            記
          </div>

          <p id="project-viewer-category" className="eyebrow eyebrow-tight">
            {project?.category}
          </p>
          <h3 id="project-viewer-title" className="project-viewer-title">
            {project?.name}
          </h3>
          <p id="project-viewer-role" className="project-viewer-role">
            {project?.role}
          </p>

          <p id="project-viewer-description" className="project-viewer-description">
            {project?.description}
          </p>

          <div className="project-viewer-block">
            <p className="eyebrow eyebrow-tight">Tools &amp; Skills</p>
            <div id="project-viewer-tools" className="project-viewer-tools">
              {project?.tools.map((tool) => (
                <span key={tool}>{tool}</span>
              ))}
            </div>
          </div>

          <div className="project-viewer-block project-viewer-purpose">
            <p className="eyebrow eyebrow-tight">Purpose</p>
            <p id="project-viewer-outcome" className="project-viewer-outcome">
              {project?.outcome}
            </p>
          </div>

          <div className="project-viewer-nav">
            <button
              type="button"
              id="project-viewer-prev"
              className="link-gold cursor-hover"
              onClick={prev}
            >
              ← Previous
            </button>
            <button
              type="button"
              id="project-viewer-next"
              className="link-gold cursor-hover"
              onClick={next}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
