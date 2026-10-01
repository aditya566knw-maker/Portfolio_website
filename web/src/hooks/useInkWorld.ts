"use client";

import { useEffect } from "react";

/* ============================================================
   useInkWorld — faithful React port of static/script.js.
   Runs the imperative behavior layer in a single useEffect
   against the DOM (ids/classes rendered by the JSX match the
   static site). Mirrors script.js almost line-for-line. All
   listeners / rAF / intervals / timeouts are torn down on
   cleanup so it is idempotent under React StrictMode.
   ============================================================ */

/* The world engine's sparkle hook, exposed for other handlers. */
declare global {
  interface Window {
    InkWorld?: {
      sparkleAt: (x: number, y: number) => void;
      debugState: () => unknown;
    };
  }
}

type Disposer = () => void;

interface SkillCategory {
  key: string;
  skills: { name: string; symbol: string; note: string }[];
}

interface Project {
  slug: string;
  name: string;
  role: string;
  category: string;
  description: string;
  tools: string[];
  outcome: string;
  featured?: boolean;
}

/* ------------------------------------------------------------
   10. Craft section — skill category data (verbatim)
   ------------------------------------------------------------ */
export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    key: "marketing",
    skills: [
      { name: "Meta Ads", symbol: "◈", note: "Audience, creative, spend — tuned together." },
      { name: "Google Ads", symbol: "◇", note: "Intent-driven acquisition across search & display." },
      { name: "Campaign Planning", symbol: "卷", note: "From brief to calendar to measured outcome." },
      { name: "Consumer Research", symbol: "眼", note: "Listening before positioning." },
      { name: "Competitive Intelligence", symbol: "鏡", note: "Reading the market's other players closely." },
    ],
  },
  {
    key: "analytics",
    skills: [
      { name: "Power BI", symbol: "柱", note: "Raw data, shaped into a decision-ready view." },
      { name: "Google Analytics / GA4", symbol: "径", note: "Tracing the visitor's actual path." },
      { name: "Google Search Console", symbol: "尋", note: "What the archive is found for, and how." },
      { name: "Performance Tracking", symbol: "度", note: "Measuring what the strategy claimed it would do." },
      { name: "Data Visualization", symbol: "圖", note: "Numbers, redrawn as something legible." },
    ],
  },
  {
    key: "branding",
    skills: [
      { name: "Brand Identity", symbol: "印", note: "A mark that carries meaning at a glance." },
      { name: "Market Positioning", symbol: "位", note: "Where a brand stands relative to everything else." },
      { name: "Strategic Storytelling", symbol: "筆", note: "The narrative underneath the campaign." },
      { name: "Content Strategy", symbol: "簡", note: "What gets said, where, and in what order." },
    ],
  },
  {
    key: "ai",
    skills: [
      { name: "ChatGPT", symbol: "靈", note: "Reasoning and drafting, paired with judgment." },
      { name: "Claude", symbol: "墨", note: "Longer-context thinking, written work, review." },
      { name: "Gemini", symbol: "星", note: "Multimodal exploration and research." },
      { name: "Prompt Engineering", symbol: "咒", note: "Asking precisely enough to get precision back." },
      { name: "AI Image Generation", symbol: "彩", note: "Concept art and visual drafts, generated and directed." },
      { name: "AI Video Generation", symbol: "影", note: "Motion, generated from a still idea." },
      { name: "Automated Workflows", symbol: "環", note: "Systems that keep running after the setup is done." },
    ],
  },
  {
    key: "development",
    skills: [
      { name: "Vibe Coding", symbol: "織", note: "Building software by describing intent, not syntax." },
      { name: "HTML/CSS", symbol: "骨", note: "The bones and skin of a page." },
      { name: "Website Workflows", symbol: "徑", note: "From draft to deployed, repeatably." },
      { name: "AI-Assisted Development", symbol: "伴", note: "Pairing with a model through the build itself." },
    ],
  },
];

/* ------------------------------------------------------------
   11. Work section — project data (verbatim)
   ------------------------------------------------------------ */
export const PROJECTS: Project[] = [
  {
    slug: "workwitness",
    name: "WorkWitness",
    role: "Product & Strategy",
    category: "AI · Product · Automation",
    description:
      "An AI chief of staff for modern teams — built to bring together AI, automation and team intelligence into a single working layer for productivity.",
    tools: ["AI", "Product Strategy", "Automation", "Team Intelligence"],
    outcome:
      "Positioned as a modern AI-powered business productivity product, built at the intersection of strategy and generative technology.",
    featured: true,
  },
  {
    slug: "quanta-heal",
    name: "The Quanta Heal",
    role: "Brand & Marketing",
    category: "Brand Strategy · Digital Marketing",
    description:
      "Brand strategy and digital marketing support, shaping positioning and campaign direction for the venture.",
    tools: ["Brand Identity", "Campaign Planning", "Content Strategy"],
    outcome: "Contributed brand and marketing direction for the venture.",
  },
  {
    slug: "vyom-cloud",
    name: "Vyom Cloud",
    role: "Marketing & Analytics",
    category: "Digital Marketing · Analytics",
    description:
      "Marketing and analytics work supporting the venture's digital presence and performance tracking.",
    tools: ["Google Ads", "Analytics", "Performance Tracking"],
    outcome: "Supported the venture's digital marketing and analytics efforts.",
  },
  {
    slug: "navjyoti",
    name: "Navjyoti",
    role: "Brand Strategy",
    category: "Brand Strategy · Positioning",
    description:
      "Strategic brand and positioning work as part of independent consulting engagements.",
    tools: ["Market Positioning", "Brand Strategy"],
    outcome: "Delivered brand strategy direction as an independent consultant.",
  },
  {
    slug: "mangalshree",
    name: "Mangalshree",
    role: "Marketing",
    category: "Digital Marketing",
    description: "Digital marketing engagement focused on campaign planning and brand presence.",
    tools: ["Campaign Planning", "Digital Marketing"],
    outcome: "Delivered marketing support as part of consulting work.",
  },
  {
    slug: "shree-sai-digital",
    name: "Shree Sai Digital",
    role: "Marketing",
    category: "Digital Marketing",
    description: "Digital marketing engagement supporting campaign execution and brand visibility.",
    tools: ["Meta Ads", "Digital Marketing"],
    outcome: "Delivered marketing support as part of consulting work.",
  },
  {
    slug: "logmeonce",
    name: "LogMeOnce",
    role: "Marketing Associate",
    category: "Digital Marketing",
    description:
      "Marketing associate work during the engagement at Maltar Services, supporting campaign and content efforts.",
    tools: ["Meta Ads", "Google Ads", "Content Strategy"],
    outcome: "Contributed to marketing execution as Marketing Associate.",
  },
  {
    slug: "strategic-visualization",
    name: "Strategic Visualization",
    role: "Business Analytics",
    category: "Power BI · Data Visualization",
    description:
      "Business analytics and data visualization work translating raw data into strategic, decision-ready dashboards.",
    tools: ["Power BI", "Data Visualization", "Business Analytics"],
    outcome: "Applied analytics and visualization to support strategic decisions.",
  },
];

/* Module-level guard: the world engine canvas loop + DOM ripple/dust
   nodes must not be instantiated twice (React StrictMode double-mount
   in dev). The second mount is a no-op; cleanup releases the lock. */
let worldEngineLock = false;

export function useInkWorld() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const disposers: Disposer[] = [];
    const addDisposer = (d: Disposer) => disposers.push(d);

    /* --------------------------------------------------------
       1. Shared state & helpers
       -------------------------------------------------------- */
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;

    function clamp(value: number, min: number, max: number) {
      return Math.max(min, Math.min(max, value));
    }
    function lerp(start: number, end: number, t: number) {
      return start + (end - start) * t;
    }

    // helper: addEventListener + register its remover
    function on(
      target: Window | Document | HTMLElement,
      type: string,
      handler: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) {
      target.addEventListener(type, handler, options);
      addDisposer(() => target.removeEventListener(type, handler, options));
    }

    /* --------------------------------------------------------
       2. Smooth scroll
       -------------------------------------------------------- */
    const htmlEl = document.documentElement;
    if (prefersReduced) {
      htmlEl.classList.add("no-smooth-scroll");
      addDisposer(() => htmlEl.classList.remove("no-smooth-scroll"));
    }

    function scrollToTarget(selector: string) {
      const el = document.querySelector(selector);
      if (!el) return;
      el.scrollIntoView({
        behavior: prefersReduced ? "auto" : "smooth",
        block: "start",
      });
    }

    /* --------------------------------------------------------
       3. Custom cursor
       -------------------------------------------------------- */
    (function initCustomCursor() {
      const cursorEnabled = isFinePointer && !isCoarsePointer && !prefersReduced;
      if (!cursorEnabled) return;

      const cursorEl = document.getElementById("custom-cursor");
      if (!cursorEl) return;
      const dotEl = cursorEl.querySelector<HTMLElement>(".cursor-dot");
      const ringEl = cursorEl.querySelector<HTMLElement>(".cursor-ring");
      const trailEl = cursorEl.querySelector<HTMLElement>(".cursor-trail");
      if (!dotEl || !ringEl) return;

      cursorEl.hidden = false;
      document.body.classList.add("cursor-enabled");
      addDisposer(() => {
        cursorEl.hidden = true;
        document.body.classList.remove("cursor-enabled");
      });

      let targetX = window.innerWidth / 2;
      let targetY = window.innerHeight / 2;
      let ringX = targetX;
      let ringY = targetY;
      let trailX = targetX;
      let trailY = targetY;

      on(
        window,
        "pointermove",
        (ev) => {
          const e = ev as PointerEvent;
          targetX = e.clientX;
          targetY = e.clientY;
          dotEl.style.transform = "translate3d(" + targetX + "px, " + targetY + "px, 0)";

          const target = (e.target as Element).closest(
            'a, button, [role="button"], input, textarea, .cursor-hover, [data-cursor]'
          );
          const mode = target
            ? target.closest('[data-cursor="inspect"]')
              ? "inspect"
              : target.closest('[data-cursor="decorative"]')
              ? "decorative"
              : "active"
            : null;

          ringEl.classList.toggle("is-active", mode === "active");
          ringEl.classList.toggle("is-inspect", mode === "inspect");
          ringEl.classList.toggle("is-decorative", mode === "decorative");
        },
        { passive: true }
      );

      on(window, "pointerdown", () => {
        ringEl.classList.add("is-pressed");
      });
      on(window, "pointerup", () => {
        ringEl.classList.remove("is-pressed");
      });

      let cursorRaf = 0;
      function tick() {
        ringX = lerp(ringX, targetX, 0.22);
        ringY = lerp(ringY, targetY, 0.22);
        ringEl!.style.transform = "translate3d(" + ringX + "px, " + ringY + "px, 0)";

        if (trailEl) {
          trailX = lerp(trailX, ringX, 0.12);
          trailY = lerp(trailY, ringY, 0.12);
          trailEl.style.transform = "translate3d(" + trailX + "px, " + trailY + "px, 0)";
        }
        cursorRaf = requestAnimationFrame(tick);
      }
      cursorRaf = requestAnimationFrame(tick);
      addDisposer(() => cancelAnimationFrame(cursorRaf));
    })();

    /* --------------------------------------------------------
       4. Loading screen
       -------------------------------------------------------- */
    let heroReadyCallbacks: Array<() => void> = [];
    function onHeroReady(cb: () => void) {
      heroReadyCallbacks.push(cb);
    }
    function fireHeroReady() {
      heroReadyCallbacks.forEach((cb) => cb());
      heroReadyCallbacks = [];
    }

    // timeout/raf helpers that auto-register cleanup
    const timeouts: number[] = [];
    const intervals: number[] = [];
    function setT(fn: () => void, ms: number) {
      const id = window.setTimeout(fn, ms);
      timeouts.push(id);
      return id;
    }
    function setI(fn: () => void, ms: number) {
      const id = window.setInterval(fn, ms);
      intervals.push(id);
      return id;
    }
    addDisposer(() => {
      timeouts.forEach((id) => window.clearTimeout(id));
      intervals.forEach((id) => window.clearInterval(id));
    });

    (function initLoadingScreen() {
      const screenEl = document.getElementById("loading-screen");
      if (!screenEl) return;
      const labelEl = screenEl.querySelector<HTMLElement>(".loader-label");
      const titleEl = screenEl.querySelector<HTMLElement>(".loader-title");
      if (!labelEl || !titleEl) return;

      function finish() {
        screenEl!.classList.add("is-hidden");
        screenEl!.addEventListener(
          "transitionend",
          function () {
            screenEl!.hidden = true;
          },
          { once: true }
        );
        fireHeroReady();
      }

      if (prefersReduced) {
        requestAnimationFrame(function () {
          screenEl.hidden = true;
          fireHeroReady();
        });
        return;
      }

      let t = 0;
      setT(function () {
        labelEl.classList.add("is-visible");
      }, (t += 200));

      setT(function () {
        labelEl.classList.remove("is-visible");
        labelEl.classList.add("is-fading");
      }, (t = 200 + 600 + 500));

      setT(
        function () {
          titleEl.classList.add("is-visible");
        },
        t - 100 > 0 ? t - 100 : t
      );

      setT(function () {
        titleEl.classList.remove("is-visible");
        titleEl.classList.add("is-fading");
      }, (t += 900 + 400));

      setT(function () {
        finish();
      }, (t += 500));
    })();

    /* --------------------------------------------------------
       5. Hero intro animation
       -------------------------------------------------------- */
    (function initHero() {
      const bgEl = document.getElementById("hero-bg");
      const mistEl = document.getElementById("hero-mist");
      const raysEl = document.getElementById("hero-rays");
      const featherElLocal = document.getElementById("hero-feather");
      const titleEl = document.getElementById("hero-title");
      const ctaEl = document.getElementById("hero-cta");
      if (!bgEl) return;

      let played = false;

      function playIntro() {
        if (played) return;
        played = true;

        if (prefersReduced) {
          [bgEl, mistEl, raysEl, featherElLocal, titleEl, ctaEl].forEach(function (el) {
            if (el) el.classList.add("is-visible");
          });
          return;
        }

        setT(function () {
          bgEl!.classList.add("is-visible");
        }, 200);

        setT(function () {
          if (featherElLocal) featherElLocal.classList.add("is-visible");
        }, 900);

        setT(function () {
          if (mistEl) mistEl.classList.add("is-visible");
          if (raysEl) raysEl.classList.add("is-visible");
        }, 1100);

        setT(function () {
          if (titleEl) titleEl.classList.add("is-visible");
        }, 1700);

        setT(function () {
          if (ctaEl) ctaEl.classList.add("is-visible");
        }, 2200);

        setT(function () {
          let breathingIn = false;
          bgEl!.classList.add("is-drifting");
          setI(function () {
            breathingIn = !breathingIn;
            bgEl!.style.transform = breathingIn ? "scale(1.03)" : "scale(1)";
          }, 22000);
        }, 2600);
      }

      onHeroReady(playIntro);

      const featherEl = document.getElementById("hero-feather");
      function departFeather() {
        if (featherEl && !prefersReduced) featherEl.classList.add("is-departing");
      }
      if (featherEl && "IntersectionObserver" in window) {
        const heroSection = document.getElementById("top");
        if (heroSection) {
          const io = new IntersectionObserver(
            function (entries) {
              entries.forEach(function (entry) {
                if (entry.isIntersecting) featherEl.classList.remove("is-departing");
              });
            },
            { threshold: 0.6 }
          );
          io.observe(heroSection);
          addDisposer(() => io.disconnect());
        }
      }

      const enterArchiveBtn = document.querySelector<HTMLElement>(
        '.hero-cta [data-scroll-target="#archive"]'
      );
      const exploreWorkBtn = document.querySelector<HTMLElement>(
        '.hero-cta [data-scroll-target="#work"]'
      );
      if (enterArchiveBtn) {
        on(enterArchiveBtn, "click", function () {
          departFeather();
          scrollToTarget("#archive");
        });
      }
      if (exploreWorkBtn) {
        on(exploreWorkBtn, "click", function () {
          departFeather();
          scrollToTarget("#work");
        });
      }
    })();

    /* --------------------------------------------------------
       5b. Hero layered parallax
       -------------------------------------------------------- */
    (function initHeroLiving() {
      if (prefersReduced) return;

      const bgImg = document.querySelector<HTMLElement>(".hero-bg-img");
      const featherEl = document.getElementById("hero-feather-parallax");
      if (!bgImg && !featherEl) return;

      const mouseEnabled = !isCoarsePointer;
      if (!mouseEnabled) return;

      let mx = 0;
      let my = 0;
      let bgX = 0;
      let bgY = 0;
      let featherX = 0;
      let featherY = 0;

      on(
        window,
        "mousemove",
        (ev) => {
          const e = ev as MouseEvent;
          mx = (e.clientX / window.innerWidth - 0.5) * 2;
          my = (e.clientY / window.innerHeight - 0.5) * 2;
        },
        { passive: true }
      );

      let raf = 0;
      (function tick() {
        bgX = lerp(bgX, mx * 6, 0.04);
        bgY = lerp(bgY, my * 4, 0.04);
        if (bgImg) {
          bgImg.style.transform = "translate3d(" + bgX + "px, " + bgY + "px, 0)";
        }
        featherX = lerp(featherX, mx * 16, 0.05);
        featherY = lerp(featherY, my * 12, 0.05);
        if (featherEl) {
          featherEl.style.transform =
            "translate3d(" +
            featherX +
            "px, " +
            featherY +
            "px, 0) rotate(" +
            (mx * 3).toFixed(2) +
            "deg)";
        }
        raf = requestAnimationFrame(tick);
      })();
      addDisposer(() => cancelAnimationFrame(raf));
    })();

    /* --------------------------------------------------------
       6. Navigation
       -------------------------------------------------------- */
    (function initNavigation() {
      const headerEl = document.getElementById("site-header");
      const toggleBtn = document.getElementById("nav-toggle");
      const mobileMenu = document.getElementById("mobile-menu");
      if (!headerEl || !toggleBtn || !mobileMenu) return;

      function onScroll() {
        headerEl!.classList.toggle("is-scrolled", window.scrollY > 40);
      }
      onScroll();
      on(window, "scroll", onScroll, { passive: true });

      const navLinks = Array.prototype.slice.call(
        document.querySelectorAll(".nav-links a[href^='#']")
      ) as HTMLAnchorElement[];
      const trackedSections = navLinks
        .map(function (link) {
          const id = link.getAttribute("href");
          const section = id && id !== "#top" ? document.querySelector(id) : null;
          return section ? { link, section } : null;
        })
        .filter(Boolean) as { link: HTMLAnchorElement; section: Element }[];

      if (trackedSections.length) {
        let navTicking = false;
        function updateActiveNav() {
          navTicking = false;
          const probeY = window.innerHeight * 0.5;
          const current = trackedSections.filter(function (t) {
            const r = t.section.getBoundingClientRect();
            return r.top <= probeY && r.bottom >= probeY;
          })[0];
          navLinks.forEach(function (l) {
            l.classList.toggle("is-active", !!current && l === current.link);
          });
        }
        function onNavScroll() {
          if (navTicking) return;
          navTicking = true;
          requestAnimationFrame(updateActiveNav);
        }
        on(window, "scroll", onNavScroll, { passive: true });
        on(window, "resize", onNavScroll);
        updateActiveNav();
      }

      function closeMobileMenu() {
        toggleBtn!.setAttribute("aria-expanded", "false");
        toggleBtn!.setAttribute("aria-label", "Open menu");
        mobileMenu!.classList.remove("is-open");
      }

      on(toggleBtn, "click", function () {
        const isOpen = toggleBtn.getAttribute("aria-expanded") === "true";
        toggleBtn.setAttribute("aria-expanded", String(!isOpen));
        toggleBtn.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
        mobileMenu.classList.toggle("is-open", !isOpen);
      });

      document.querySelectorAll<HTMLAnchorElement>("[data-scroll-link]").forEach(function (link) {
        on(link, "click", function (ev) {
          const e = ev as MouseEvent;
          const href = link.getAttribute("href");
          if (!href || href.charAt(0) !== "#") return;
          e.preventDefault();
          closeMobileMenu();
          scrollToTarget(href === "#top" ? "#top" : href);
        });
      });
    })();

    /* --------------------------------------------------------
       7. Scroll-reveal
       -------------------------------------------------------- */
    (function initReveal() {
      const revealEls = document.querySelectorAll(".reveal");
      if (!revealEls.length) return;

      if (prefersReduced || !("IntersectionObserver" in window)) {
        revealEls.forEach(function (el) {
          el.classList.add("is-visible");
        });
        return;
      }

      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
      );

      revealEls.forEach(function (el) {
        observer.observe(el);
      });
      addDisposer(() => observer.disconnect());
    })();

    /* --------------------------------------------------------
       7b. The Path — progressive timeline line
       -------------------------------------------------------- */
    (function initTimelineReveal() {
      const line = document.querySelector(".timeline-line");
      if (!line) return;
      if (prefersReduced || !("IntersectionObserver" in window)) {
        line.classList.add("is-visible");
        return;
      }
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              line.classList.add("is-visible");
              observer.unobserve(line);
            }
          });
        },
        { threshold: 0.15 }
      );
      observer.observe(line);
      addDisposer(() => observer.disconnect());
    })();

    /* --------------------------------------------------------
       8. Parallax layers
       -------------------------------------------------------- */
    (function initParallaxLayers() {
      const layers = Array.prototype.slice.call(
        document.querySelectorAll(".parallax-layer")
      ) as HTMLElement[];
      if (!layers.length || prefersReduced) return;

      let mouseX = 0;
      let mouseY = 0;
      const mouseEnabled = !isCoarsePointer;

      if (mouseEnabled) {
        on(
          window,
          "mousemove",
          (ev) => {
            const e = ev as MouseEvent;
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
          },
          { passive: true }
        );
      }

      const state = layers.map(function (layer) {
        return {
          el: layer,
          img: layer.querySelector<HTMLElement>(".parallax-img"),
          speed: parseFloat(layer.dataset.speed || "0"),
          mouseStrength: parseFloat(layer.dataset.mouseStrength || "0"),
          cx: 0,
          cy: 0,
        };
      });

      let raf = 0;
      function tick() {
        const viewportH = window.innerHeight;

        state.forEach(function (item) {
          if (!item.img) return;

          const rect = item.el.getBoundingClientRect();
          const progress = clamp(
            1 - (rect.top + rect.height) / (viewportH + rect.height),
            0,
            1
          );
          const scrollOffsetPercent = item.speed * 12 * (progress - 0.5) * 2;

          const targetX = mouseEnabled ? mouseX * item.mouseStrength : 0;
          const targetY = mouseEnabled ? mouseY * item.mouseStrength : 0;
          item.cx = lerp(item.cx, targetX, 0.06);
          item.cy = lerp(item.cy, targetY, 0.06);

          item.img.style.transform =
            "translate3d(" +
            item.cx +
            "px, calc(" +
            item.cy +
            "px + " +
            scrollOffsetPercent +
            "%), 0)";
        });

        raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);
      addDisposer(() => cancelAnimationFrame(raf));
    })();

    /* --------------------------------------------------------
       8b. Section-entry ink transitions
       -------------------------------------------------------- */
    (function initSectionInkTransitions() {
      const inks = Array.prototype.slice.call(
        document.querySelectorAll("[data-section-ink]")
      ) as HTMLElement[];
      if (!inks.length || prefersReduced || !("IntersectionObserver" in window)) return;

      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            const el = entry.target as HTMLElement;
            if (entry.isIntersecting && !el.dataset.played) {
              el.dataset.played = "true";
              el.classList.add("is-active");
              setT(function () {
                el.classList.add("is-retracting");
              }, 2200);
            }
          });
        },
        { threshold: 0.2 }
      );

      inks.forEach(function (el) {
        observer.observe(el);
      });
      addDisposer(() => observer.disconnect());
    })();

    /* --------------------------------------------------------
       9. Floating elements
       -------------------------------------------------------- */
    (function initFloatingElements() {
      const els = Array.prototype.slice.call(
        document.querySelectorAll(".craft-botanical")
      ) as HTMLElement[];
      if (!els.length || prefersReduced || isCoarsePointer) return;

      let mouseX = 0;
      on(
        window,
        "mousemove",
        (ev) => {
          const e = ev as MouseEvent;
          mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        },
        { passive: true }
      );

      const state = els.map(function (el) {
        return { el, cx: 0, strength: 6 };
      });

      let raf = 0;
      function tick() {
        state.forEach(function (item) {
          const target = mouseX * item.strength;
          item.cx = lerp(item.cx, target, 0.05);
          item.el.style.transform = "translate3d(" + item.cx + "px, 0, 0)";
        });
        raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);
      addDisposer(() => cancelAnimationFrame(raf));
    })();

    /* --------------------------------------------------------
       9b. THE WORLD ENGINE
       -------------------------------------------------------- */
    (function initWorldEngine() {
      const canvas = document.getElementById("world-canvas") as HTMLCanvasElement | null;
      if (!canvas || !canvas.getContext) return;
      if (prefersReduced) return;
      // StrictMode double-mount guard: only one engine owns the canvas.
      if (worldEngineLock) return;
      worldEngineLock = true;
      addDisposer(() => {
        worldEngineLock = false;
      });

      const isMobile = window.matchMedia("(max-width: 639px)").matches;
      const ctx = canvas.getContext("2d")!;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      let vw = 0;
      let vh = 0;

      // track DOM nodes we append (ripple/dust) so cleanup removes them
      const spawnedNodes = new Set<HTMLElement>();

      function resize() {
        vw = window.innerWidth;
        vh = window.innerHeight;
        canvas!.width = vw * dpr;
        canvas!.height = vh * dpr;
        canvas!.style.width = vw + "px";
        canvas!.style.height = vh + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      resize();
      on(window, "resize", resize);

      const wind = { angle: 0.15, strength: 0.5, t: 0 };
      let mouseNudge = 0;
      let lastScrollY = window.scrollY;
      let scrollNudge = 0;

      if (!isCoarsePointer) {
        on(
          window,
          "mousemove",
          (ev) => {
            const e = ev as MouseEvent;
            mouseNudge = (e.clientX / window.innerWidth - 0.5) * 0.6;
          },
          { passive: true }
        );
      }
      on(
        window,
        "scroll",
        function () {
          const dy = window.scrollY - lastScrollY;
          lastScrollY = window.scrollY;
          scrollNudge = clamp(scrollNudge + dy * 0.004, -0.8, 0.8);
        },
        { passive: true }
      );

      function updateWind(dt: number) {
        wind.t += dt;
        scrollNudge = lerp(scrollNudge, 0, 0.02);
        const base = Math.sin(wind.t * 0.00012) * 0.7;
        wind.angle = lerp(wind.angle, base + mouseNudge * 0.5 + scrollNudge * 0.3, 0.01);
        wind.strength = lerp(
          wind.strength,
          0.4 + Math.abs(mouseNudge) * 0.3 + Math.abs(scrollNudge) * 0.4,
          0.02
        );
      }

      interface SectionConfig {
        density: number;
        leaves: boolean;
        gold: boolean;
        dust: boolean;
        mist: boolean;
        fireflies: boolean;
        water?: [number, number];
        ground?: [number, number];
      }
      interface SectionEntry {
        id: string;
        el: HTMLElement;
        config: SectionConfig;
      }

      const SECTION_CONFIG: Record<string, SectionConfig> = {
        top: { density: isMobile ? 0.35 : 1, leaves: true, gold: true, dust: true, mist: false, fireflies: false },
        archive: { density: isMobile ? 0.3 : 0.8, leaves: true, gold: false, dust: true, mist: true, fireflies: false, water: [0.55, 0.62] },
        craft: { density: isMobile ? 0.25 : 0.7, leaves: false, gold: true, dust: true, mist: true, fireflies: true },
        work: { density: isMobile ? 0.2 : 0.55, leaves: false, gold: true, dust: true, mist: false, fireflies: false },
        "ai-lab": { density: 0, leaves: false, gold: false, dust: false, mist: false, fireflies: false },
        path: { density: isMobile ? 0.2 : 0.5, leaves: true, gold: false, dust: false, mist: true, fireflies: false, ground: [0.88, 0.94] },
        certifications: { density: isMobile ? 0.15 : 0.35, leaves: false, gold: true, dust: false, mist: false, fireflies: false },
        contact: { density: isMobile ? 0.4 : 1, leaves: true, gold: false, dust: false, mist: true, fireflies: true, water: [0.62, 0.7] },
      };
      const sectionEls = Object.keys(SECTION_CONFIG)
        .map(function (id): SectionEntry | null {
          const el = document.getElementById(id);
          return el ? { id, el, config: SECTION_CONFIG[id] } : null;
        })
        .filter(Boolean) as SectionEntry[];

      let rectCache: Record<string, DOMRect> = {};
      function rectFor(section: SectionEntry) {
        const cached = rectCache[section.id];
        if (cached) return cached;
        const r = section.el.getBoundingClientRect();
        rectCache[section.id] = r;
        return r;
      }

      function activeSections() {
        return sectionEls.filter(function (s) {
          const r = rectFor(s);
          return r.bottom > -200 && r.top < vh + 200;
        });
      }

      function spawnRipple(x: number, y: number) {
        const el = document.createElement("div");
        el.className = "env-ripple";
        el.style.left = x + "px";
        el.style.top = y + "px";
        document.body.appendChild(el);
        spawnedNodes.add(el);
        window.setTimeout(function () {
          el.remove();
          spawnedNodes.delete(el);
        }, 2300);
      }
      function spawnDust(x: number, y: number) {
        const n = 3 + Math.floor(Math.random() * 2);
        for (let i = 0; i < n; i++) {
          const el = document.createElement("div");
          el.className = "env-dust";
          const dx = (Math.random() - 0.5) * 24;
          const dy = -4 - Math.random() * 10;
          el.style.left = x + "px";
          el.style.top = y + "px";
          el.style.setProperty("--dust-x", dx + "px");
          el.style.setProperty("--dust-y", dy + "px");
          document.body.appendChild(el);
          spawnedNodes.add(el);
          window.setTimeout(
            (function (node: HTMLElement) {
              return function () {
                node.remove();
                spawnedNodes.delete(node);
              };
            })(el),
            950
          );
        }
      }

      let reactionBudgetThisFrame = 0;

      interface Particle {
        kind: "leaf" | "dust" | "gold" | "mist" | "firefly";
        section: SectionEntry;
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        alpha: number;
        targetAlpha: number;
        life: number;
        color?: string;
        // leaf
        angle?: number;
        spin?: number;
        wobble?: number;
        wobbleSpeed?: number;
        hue?: string;
        settled?: boolean;
        settleT?: number;
        directionChangeAt?: number;
        // gold
        twinkle?: number;
        // firefly
        blinkT?: number;
        blinkSpeed?: number;
        wanderAngle?: number;
      }

      function checkReaction(
        section: SectionEntry,
        particle: Particle,
        prevFraction: number
      ) {
        if (reactionBudgetThisFrame > 2) return false;
        const rect = rectFor(section);
        const cfg = section.config;
        if (!rect.height) return false;
        const curFraction = (particle.y - rect.top) / rect.height;
        if (cfg.water) {
          const w0 = cfg.water[0];
          const w1 = cfg.water[1];
          if (prevFraction < w0 && curFraction >= w0 && curFraction <= w1 + 0.06) {
            spawnRipple(particle.x, rect.top + rect.height * w0);
            reactionBudgetThisFrame++;
            return true;
          }
        }
        if (cfg.ground) {
          const g0 = cfg.ground[0];
          const g1 = cfg.ground[1];
          if (prevFraction < g0 && curFraction >= g0 && curFraction <= g1 + 0.06) {
            spawnDust(particle.x, rect.top + rect.height * g0);
            reactionBudgetThisFrame++;
            return true;
          }
        }
        return false;
      }

      let particles: Particle[] = [];
      const MAX_PARTICLES = isMobile ? 26 : isCoarsePointer ? 40 : 70;
      const LEAF_FALL_RATE = 0.16;

      function spawnLeaf(section: SectionEntry): Particle {
        const rect = section.el.getBoundingClientRect();
        return {
          kind: "leaf",
          section,
          x: rect.left + Math.random() * rect.width,
          y: rect.top - 10 - Math.random() * 120,
          vx: (Math.random() - 0.5) * 0.15,
          vy: 0.25 + Math.random() * 0.35,
          size: 5 + Math.random() * 5,
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.025,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.008 + Math.random() * 0.012,
          hue: Math.random() < 0.5 ? "rgba(180, 90, 58," : "rgba(201, 163, 92,",
          alpha: 0,
          targetAlpha: 0.55 + Math.random() * 0.3,
          settled: false,
          settleT: 0,
          life: 0,
          directionChangeAt: 4000 + Math.random() * 6000,
        };
      }

      function spawnMote(section: SectionEntry, kind: Particle["kind"]): Particle {
        const rect = section.el.getBoundingClientRect();
        const base: Particle = {
          kind,
          section,
          x: rect.left + Math.random() * rect.width,
          y: rect.top + Math.random() * rect.height,
          alpha: 0,
          life: 0,
          vx: 0,
          vy: 0,
          size: 0,
          targetAlpha: 0,
        };
        if (kind === "dust") {
          base.vx = (Math.random() - 0.5) * 0.05;
          base.vy = -0.03 - Math.random() * 0.05;
          base.size = 0.6 + Math.random() * 1.1;
          base.targetAlpha = 0.2 + Math.random() * 0.25;
          base.color = "224, 189, 126";
        } else if (kind === "gold") {
          base.vx = (Math.random() - 0.5) * 0.06;
          base.vy = -0.05 - Math.random() * 0.08;
          base.size = 0.8 + Math.random() * 1.3;
          base.targetAlpha = 0.3 + Math.random() * 0.35;
          base.color = "240, 207, 143";
          base.twinkle = Math.random() * Math.PI * 2;
        } else if (kind === "mist") {
          base.vx = (Math.random() - 0.5) * 0.03;
          base.vy = -0.008 - Math.random() * 0.015;
          base.size = 30 + Math.random() * 50;
          base.targetAlpha = 0.03 + Math.random() * 0.04;
          base.color = "232, 215, 181";
        } else if (kind === "firefly") {
          base.vx = (Math.random() - 0.5) * 0.12;
          base.vy = (Math.random() - 0.5) * 0.1;
          base.size = 1.4 + Math.random() * 1;
          base.targetAlpha = 0;
          base.color = "224, 189, 126";
          base.blinkT = Math.random() * Math.PI * 2;
          base.blinkSpeed = 0.02 + Math.random() * 0.02;
          base.wanderAngle = Math.random() * Math.PI * 2;
        }
        return base;
      }

      function seedForSection(section: SectionEntry) {
        const cfg = section.config;
        const rect = section.el.getBoundingClientRect();
        const area = Math.max(rect.height, 1) / vh;
        const budget = Math.round(area * cfg.density * (isMobile ? 5 : 9));
        const made: Particle[] = [];
        if (cfg.leaves) {
          for (let i = 0; i < Math.min(budget, isMobile ? 3 : 6); i++) made.push(spawnLeaf(section));
        }
        if (cfg.gold) {
          for (let g = 0; g < Math.min(budget, 8); g++) made.push(spawnMote(section, "gold"));
        }
        if (cfg.dust) {
          for (let d = 0; d < Math.min(budget, 10); d++) made.push(spawnMote(section, "dust"));
        }
        if (cfg.mist) {
          for (let m = 0; m < Math.min(budget, 4); m++) made.push(spawnMote(section, "mist"));
        }
        if (cfg.fireflies) {
          for (let f = 0; f < Math.min(budget, 5); f++) made.push(spawnMote(section, "firefly"));
        }
        return made;
      }

      const seededSections: Record<string, boolean> = {};

      function ensureSeeded() {
        const active = activeSections();
        const activeIds: Record<string, boolean> = {};
        active.forEach(function (s) {
          activeIds[s.id] = true;
        });

        const needsRoom = active.some(function (s) {
          return !seededSections[s.id];
        });

        if (needsRoom && particles.length >= MAX_PARTICLES) {
          particles = particles.filter(function (p) {
            return activeIds[p.section.id];
          });
        }

        active.forEach(function (s) {
          if (!seededSections[s.id] && particles.length < MAX_PARTICLES) {
            seededSections[s.id] = true;
            particles = particles.concat(seedForSection(s));
          }
        });
      }

      function respawn(p: Particle): Particle | null {
        const section = p.section;
        const rect = rectFor(section);
        if (rect.bottom < -400 || rect.top > vh + 400) return null;
        if (p.kind === "leaf") return spawnLeaf(section);
        return spawnMote(section, p.kind);
      }

      let lastT = performance.now();
      let engineRaf = 0;

      function tick(now: number) {
        const dt = Math.min(now - lastT, 48);
        lastT = now;
        reactionBudgetThisFrame = 0;
        rectCache = {};

        updateWind(dt);
        ensureSeeded();

        ctx.clearRect(0, 0, vw, vh);

        const windX = Math.cos(wind.angle) * wind.strength;

        for (let i = particles.length - 1; i >= 0; i--) {
          let p = particles[i];
          p.life += dt;
          p.alpha = lerp(p.alpha, p.targetAlpha, 0.02);

          if (p.kind === "leaf") {
            if (!p.settled) {
              const rectBefore = rectFor(p.section);
              const prevFraction = rectBefore.height
                ? (p.y - rectBefore.top) / rectBefore.height
                : -1;

              p.wobble! += p.wobbleSpeed! * dt * 0.06;
              if (p.life > p.directionChangeAt!) {
                p.vx += (Math.random() - 0.5) * 0.12;
                p.directionChangeAt = p.life + 3000 + Math.random() * 5000;
              }
              p.vy = lerp(p.vy, 0.3 + wind.strength * 0.08, 0.01);
              p.vx = lerp(p.vx, windX * 0.5 + Math.sin(p.wobble!) * 0.08, 0.02);
              p.x += p.vx * dt * LEAF_FALL_RATE;
              p.y += p.vy * dt * LEAF_FALL_RATE;
              p.angle! += p.spin! * dt * 0.06;

              const sectionRect = rectFor(p.section);
              const floor = sectionRect.top + sectionRect.height * 0.97;
              checkReaction(p.section, p, prevFraction);
              if (p.y >= floor && floor < vh + 40) {
                p.settled = true;
                p.settleT = 0;
                p.y = floor;
                p.vx = 0;
                p.vy = 0;
              }
            } else {
              p.settleT! += dt;
              if (p.settleT! > 3200) {
                p.targetAlpha = 0;
                if (p.alpha < 0.02) {
                  const r = respawn(p);
                  if (r) {
                    particles[i] = r;
                  } else {
                    particles.splice(i, 1);
                  }
                  continue;
                }
              }
            }
            if (p.y > vh + 60 || p.x < -60 || p.x > vw + 60) {
              const r = respawn(p);
              if (r) {
                particles[i] = r;
              } else {
                particles.splice(i, 1);
                continue;
              }
              p = particles[i];
            }
          } else if (p.kind === "dust" || p.kind === "gold") {
            p.x += (p.vx + windX * 0.15) * dt * 0.06;
            p.y += p.vy * dt * 0.06;
            if (p.kind === "gold") {
              p.twinkle! += 0.002 * dt;
            }
            if (p.y < -20 || p.x < -40 || p.x > vw + 40) {
              const r = respawn(p);
              if (r) {
                particles[i] = r;
              } else {
                particles.splice(i, 1);
                continue;
              }
            }
          } else if (p.kind === "mist") {
            p.x += (p.vx + windX * 0.1) * dt * 0.06;
            p.y += p.vy * dt * 0.06;
            if (p.y < -80) {
              const r = respawn(p);
              if (r) {
                particles[i] = r;
              } else {
                particles.splice(i, 1);
                continue;
              }
            }
          } else if (p.kind === "firefly") {
            p.blinkT! += p.blinkSpeed! * dt * 0.06;
            p.targetAlpha = Math.max(0, Math.sin(p.blinkT!)) * 0.6;
            p.wanderAngle! += (Math.random() - 0.5) * 0.05;
            p.x += (Math.cos(p.wanderAngle!) * 0.1 + windX * 0.05) * dt * 0.06;
            p.y += Math.sin(p.wanderAngle!) * 0.08 * dt * 0.06;
            const fRect = rectFor(p.section);
            if (p.y < fRect.top - 40 || p.y > fRect.bottom + 40) {
              p.wanderAngle = -p.wanderAngle!;
            }
          }

          // Draw
          ctx.save();
          ctx.globalAlpha = clamp(p.alpha, 0, 1);
          if (p.kind === "leaf") {
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle!);
            ctx.fillStyle = p.hue! + (p.settled ? 0.35 : 0.55) + ")";
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.42, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            continue;
          }
          if (p.kind === "mist") {
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            grad.addColorStop(0, "rgba(" + hexToRgbTriplet(p.color!) + ", " + p.alpha + ")");
            grad.addColorStop(1, "rgba(" + hexToRgbTriplet(p.color!) + ", 0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            continue;
          }
          const alphaOut =
            p.kind === "gold" ? p.alpha * (0.6 + 0.4 * Math.sin(p.twinkle!)) : p.alpha;
          ctx.globalAlpha = clamp(alphaOut, 0, 1);
          ctx.fillStyle = "rgba(" + (p.color || "224, 189, 126") + ", 1)";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        engineRaf = requestAnimationFrame(tick);
      }

      function hexToRgbTriplet(v: string) {
        return v;
      }

      engineRaf = requestAnimationFrame(tick);
      addDisposer(() => {
        cancelAnimationFrame(engineRaf);
        // remove any ripple/dust nodes still in the DOM
        spawnedNodes.forEach((node) => node.remove());
        spawnedNodes.clear();
        if (window.InkWorld) delete window.InkWorld;
      });

      window.InkWorld = {
        sparkleAt: function (x: number, y: number) {
          spawnDust(x, y);
        },
        debugState: function () {
          const bySection: Record<string, { total: number; leaves: number }> = {};
          particles.forEach(function (p) {
            const id = p.section.id;
            bySection[id] = bySection[id] || { total: 0, leaves: 0 };
            bySection[id].total++;
            if (p.kind === "leaf") bySection[id].leaves++;
          });
          return {
            total: particles.length,
            max: MAX_PARTICLES,
            bySection,
            seeded: Object.keys(seededSections),
          };
        },
      };
    })();

    /* --------------------------------------------------------
       12. AI Lab — ink splash scroll-scrub reveal
       -------------------------------------------------------- */
    (function initAiLabInk() {
      const sectionEl = document.getElementById("ai-lab");
      const inkEl = document.getElementById("ai-lab-ink");
      if (!sectionEl || !inkEl || prefersReduced) {
        if (inkEl) {
          inkEl.style.opacity = "0.9";
          inkEl.style.setProperty("--ink-scale", "1");
          inkEl.style.setProperty("--ink-rotate", "0deg");
        }
        return;
      }

      function update() {
        const rect = sectionEl!.getBoundingClientRect();
        const viewportH = window.innerHeight;

        const startY = viewportH * 0.7;
        const endY = viewportH * 0.1;
        const progress = clamp((startY - rect.top) / (startY - endY), 0, 1);

        const opacity = lerp(0, 0.9, progress);
        const scale = lerp(0.7, 1, progress);
        const rotate = lerp(-6, 0, progress);

        inkEl!.style.opacity = String(opacity);
        inkEl!.style.setProperty("--ink-scale", String(scale));
        inkEl!.style.setProperty("--ink-rotate", rotate + "deg");
      }

      let ticking = false;
      function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          update();
          ticking = false;
        });
      }

      update();
      on(window, "scroll", onScroll, { passive: true });
      on(window, "resize", onScroll);
    })();

    /* --------------------------------------------------------
       12b. AI Lab — floating nodes + connections
       -------------------------------------------------------- */
    (function initAiLabNodes() {
      const section = document.getElementById("ai-lab");
      const canvas = document.getElementById("ai-lab-nodes") as HTMLCanvasElement | null;
      if (!section || !canvas || !canvas.getContext || prefersReduced) return;

      const isMobile = window.matchMedia("(max-width: 639px)").matches;
      const ctx = canvas.getContext("2d")!;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      let w = 0;
      let h = 0;
      interface Node {
        x: number;
        y: number;
        vx: number;
        vy: number;
        r: number;
        pulse: number;
      }
      const nodes: Node[] = [];
      const count = isMobile ? 8 : 16;
      let visible = false;

      function resize() {
        w = section!.clientWidth;
        h = section!.clientHeight;
        canvas!.width = w * dpr;
        canvas!.height = h * dpr;
        canvas!.style.width = w + "px";
        canvas!.style.height = h + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      function makeNode(): Node {
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.06,
          vy: (Math.random() - 0.5) * 0.06,
          r: 1 + Math.random() * 1.6,
          pulse: Math.random() * Math.PI * 2,
        };
      }

      resize();
      for (let i = 0; i < count; i++) nodes.push(makeNode());
      on(window, "resize", resize);

      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            visible = entry.isIntersecting;
          });
        },
        { threshold: 0.05 }
      );
      observer.observe(section);
      addDisposer(() => observer.disconnect());

      const maxLinkDist = isMobile ? 90 : 150;

      let raf = 0;
      function tick() {
        if (visible) {
          ctx.clearRect(0, 0, w, h);
          nodes.forEach(function (n) {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < 0 || n.x > w) n.vx *= -1;
            if (n.y < 0 || n.y > h) n.vy *= -1;
            n.pulse += 0.015;
          });

          for (let a = 0; a < nodes.length; a++) {
            for (let b = a + 1; b < nodes.length; b++) {
              const dx = nodes[a].x - nodes[b].x;
              const dy = nodes[a].y - nodes[b].y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < maxLinkDist) {
                ctx.save();
                ctx.globalAlpha = (1 - dist / maxLinkDist) * 0.18;
                ctx.strokeStyle = "rgba(224, 189, 126, 1)";
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(nodes[a].x, nodes[a].y);
                ctx.lineTo(nodes[b].x, nodes[b].y);
                ctx.stroke();
                ctx.restore();
              }
            }
          }

          nodes.forEach(function (n) {
            const glow = 0.4 + 0.3 * Math.sin(n.pulse);
            ctx.save();
            ctx.globalAlpha = glow;
            ctx.fillStyle = "rgba(240, 207, 143, 1)";
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });
        }
        raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);
      addDisposer(() => cancelAnimationFrame(raf));
    })();

    /* --------------------------------------------------------
       12c. Certifications — ink reaction on hover
       -------------------------------------------------------- */
    (function initCertifications() {
      if (isCoarsePointer) return;
      const cards = document.querySelectorAll<HTMLElement>(".certification-card");
      cards.forEach(function (card) {
        on(card, "mouseenter", function () {
          if (!window.InkWorld) return;
          const r = card.getBoundingClientRect();
          window.InkWorld.sparkleAt(r.right - 24, r.bottom - 24);
        });
      });
    })();

    /* --------------------------------------------------------
       13. Footer year  (handled declaratively in Footer.tsx)
       -------------------------------------------------------- */

    // ---- master cleanup ----
    return () => {
      disposers.forEach((d) => d());
    };
  }, []);
}
