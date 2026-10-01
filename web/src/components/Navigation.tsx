"use client";

import { useEffect, useState } from "react";
import { getLenis } from "./SmoothScroll";

const LINKS = [
  { href: "#archive", label: "Archive" },
  { href: "#craft", label: "Craft" },
  { href: "#work", label: "Work" },
  { href: "#ai-lab", label: "AI Lab" },
  { href: "#contact", label: "Contact" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (!el) return;
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(el as HTMLElement, { duration: 1.4 });
    } else {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-ink/80 backdrop-blur-md border-b border-gold/10"
          : "bg-transparent"
      }`}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10"
        aria-label="Primary"
      >
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            goTo("#top");
          }}
          className="cursor-hover font-serif-display text-lg tracking-[0.2em] text-parchment"
        >
          INK<span className="text-gold">OF</span>JATAYU
        </a>

        <ul className="hidden items-center gap-9 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(link.href);
                }}
                className="link-gold cursor-hover font-sans text-xs uppercase tracking-[0.22em] text-parchment/80 transition-colors hover:text-gold-soft"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="cursor-hover flex flex-col gap-1.5 p-2 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`block h-px w-6 bg-gold-soft transition-transform duration-300 ${
              open ? "translate-y-[3px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-px w-6 bg-gold-soft transition-opacity duration-300 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`block h-px w-6 bg-gold-soft transition-transform duration-300 ${
              open ? "-translate-y-[3px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      <div
        className={`overflow-hidden bg-ink/95 backdrop-blur-md transition-[max-height] duration-500 ease-in-out md:hidden ${
          open ? "max-h-80" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col gap-1 px-6 pb-6">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(link.href);
                }}
                className="block py-3 font-serif-display text-xl text-parchment/90"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
