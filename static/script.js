/* ============================================================
   INKOFJATAYU — Aditya Singh Portfolio
   Vanilla JS behavior layer (converted from the original
   React + GSAP + Lenis implementation).

   Sections in this file:
   1. Shared state & helpers
   2. Smooth scroll
   3. Custom cursor
   4. Loading screen
   5. Hero intro animation
   6. Navigation (scroll state + mobile menu + scroll-to-link)
   7. Scroll-reveal (IntersectionObserver replacement for GSAP ScrollTrigger)
   8. Parallax layers (scroll + mouse)
   9. Floating elements (mouse-driven horizontal drift)
   10. Craft section — skill category switching
   11. Work section — project list + project viewer modal
   12. AI Lab — ink splash scroll-scrub reveal
   13. Footer year
   ============================================================ */

(function () {
  "use strict";

  /* ------------------------------------------------------------
     1. Shared state & helpers
     ------------------------------------------------------------ */
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  var isFinePointer = window.matchMedia("(pointer: fine)").matches;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(start, end, t) {
    return start + (end - start) * t;
  }

  /* ------------------------------------------------------------
     2. Smooth scroll
     ------------------------------------------------------------
     The original used Lenis for inertia-based smooth scrolling.
     Here we rely on native CSS `scroll-behavior: smooth` (declared
     in style.css) for anchor/JS-triggered scrolls, which covers the
     same user-facing behavior without a scroll-jacking library.
     Reduced-motion users get instant scrolling instead. */
  var htmlEl = document.documentElement;
  if (prefersReduced) {
    htmlEl.classList.add("no-smooth-scroll");
  }

  function scrollToTarget(selector) {
    var el = document.querySelector(selector);
    if (!el) return;
    el.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
  }

  /* ------------------------------------------------------------
     3. Custom cursor
     ------------------------------------------------------------
     Dot tracks the raw pointer 1:1 (zero perceived latency). The ring
     eases behind it and swaps shape depending on what's under the
     pointer: plain interactive elements get a gentle expand, work-list
     items get a larger dashed "inspect" ring, decorative artwork gets
     the faintest widen. A single trailing ink droplet eases further
     behind still, for a quiet brush-trail feel — never a comet tail. */
  (function initCustomCursor() {
    var cursorEnabled = isFinePointer && !isCoarsePointer && !prefersReduced;
    if (!cursorEnabled) return;

    var cursorEl = document.getElementById("custom-cursor");
    var dotEl = cursorEl.querySelector(".cursor-dot");
    var ringEl = cursorEl.querySelector(".cursor-ring");
    var trailEl = cursorEl.querySelector(".cursor-trail");
    if (!cursorEl || !dotEl || !ringEl) return;

    cursorEl.hidden = false;
    document.body.classList.add("cursor-enabled");

    var targetX = window.innerWidth / 2;
    var targetY = window.innerHeight / 2;
    var ringX = targetX;
    var ringY = targetY;
    var trailX = targetX;
    var trailY = targetY;

    window.addEventListener(
      "pointermove",
      function (e) {
        targetX = e.clientX;
        targetY = e.clientY;
        dotEl.style.transform = "translate3d(" + targetX + "px, " + targetY + "px, 0)";

        var target = e.target.closest(
          'a, button, [role="button"], input, textarea, .cursor-hover, [data-cursor]'
        );
        var mode = target ? target.closest('[data-cursor="inspect"]') ? "inspect"
          : target.closest('[data-cursor="decorative"]') ? "decorative"
          : "active" : null;

        ringEl.classList.toggle("is-active", mode === "active");
        ringEl.classList.toggle("is-inspect", mode === "inspect");
        ringEl.classList.toggle("is-decorative", mode === "decorative");
      },
      { passive: true }
    );

    window.addEventListener("pointerdown", function () {
      ringEl.classList.add("is-pressed");
    });
    window.addEventListener("pointerup", function () {
      ringEl.classList.remove("is-pressed");
    });

    function tick() {
      ringX = lerp(ringX, targetX, 0.22);
      ringY = lerp(ringY, targetY, 0.22);
      ringEl.style.transform = "translate3d(" + ringX + "px, " + ringY + "px, 0)";

      if (trailEl) {
        trailX = lerp(trailX, ringX, 0.12);
        trailY = lerp(trailY, ringY, 0.12);
        trailEl.style.transform = "translate3d(" + trailX + "px, " + trailY + "px, 0)";
      }

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  /* ------------------------------------------------------------
     4. Loading screen
     ------------------------------------------------------------
     Reproduces the original GSAP timeline:
       label fades in -> label fades out -> title tracks in/fades in
       -> title fades out -> whole screen fades out -> hero intro fires
     Timings match the original (in seconds). */
  var heroReadyCallbacks = [];
  function onHeroReady(cb) {
    heroReadyCallbacks.push(cb);
  }
  function fireHeroReady() {
    heroReadyCallbacks.forEach(function (cb) {
      cb();
    });
    heroReadyCallbacks = [];
  }

  (function initLoadingScreen() {
    var screenEl = document.getElementById("loading-screen");
    var labelEl = screenEl.querySelector(".loader-label");
    var titleEl = screenEl.querySelector(".loader-title");

    function finish() {
      screenEl.classList.add("is-hidden");
      screenEl.addEventListener(
        "transitionend",
        function () {
          screenEl.hidden = true;
        },
        { once: true }
      );
      fireHeroReady();
    }

    if (prefersReduced) {
      // Defer slightly so listeners registered after this IIFE (e.g. Hero
      // init below) still receive the ready signal.
      window.requestAnimationFrame(function () {
        screenEl.hidden = true;
        fireHeroReady();
      });
      return;
    }

    // Timeline matches the original GSAP sequence:
    // 0.2s delay -> label in (0.6s) -> 0.5s delay -> label out (0.5s)
    // title in starts ~0.1s before label-out finishes, tracks/fades in (0.9s)
    // -> 0.4s delay -> title out (0.5s) -> screen fade out (0.8s)
    var t = 0;
    window.setTimeout(function () {
      labelEl.classList.add("is-visible");
    }, (t += 200));

    window.setTimeout(function () {
      labelEl.classList.remove("is-visible");
      labelEl.classList.add("is-fading");
    }, (t = 200 + 600 + 500));

    window.setTimeout(function () {
      titleEl.classList.add("is-visible");
    }, t - 100 > 0 ? t - 100 : t);

    window.setTimeout(function () {
      titleEl.classList.remove("is-visible");
      titleEl.classList.add("is-fading");
    }, (t += 900 + 400));

    window.setTimeout(function () {
      finish();
    }, (t += 500));
  })();

  /* ------------------------------------------------------------
     5. Hero intro animation
     ------------------------------------------------------------
     Matches the original timeline offsets (seconds from timeline
     start): bg 0.2->2.6, feather 0.9->2.7, mist 1.1->2.9,
     title 1.7->2.9, cta 2.2->3.2, then a slow continuous bg drift. */
  (function initHero() {
    var bgEl = document.getElementById("hero-bg");
    var mistEl = document.getElementById("hero-mist");
    var raysEl = document.getElementById("hero-rays");
    var featherEl = document.getElementById("hero-feather");
    var titleEl = document.getElementById("hero-title");
    var ctaEl = document.getElementById("hero-cta");
    if (!bgEl) return;

    var played = false;

    function playIntro() {
      if (played) return;
      played = true;

      if (prefersReduced) {
        [bgEl, mistEl, raysEl, featherEl, titleEl, ctaEl].forEach(function (el) {
          if (el) el.classList.add("is-visible");
        });
        return;
      }

      window.setTimeout(function () {
        bgEl.classList.add("is-visible");
      }, 200);

      window.setTimeout(function () {
        featherEl.classList.add("is-visible");
      }, 900);

      window.setTimeout(function () {
        mistEl.classList.add("is-visible");
        if (raysEl) raysEl.classList.add("is-visible");
      }, 1100);

      window.setTimeout(function () {
        titleEl.classList.add("is-visible");
      }, 1700);

      window.setTimeout(function () {
        ctaEl.classList.add("is-visible");
      }, 2200);

      // Gentle continuous "breathing" — an almost imperceptible
      // 1.00 -> 1.03 scale, toggled slowly so CSS eases between the two.
      window.setTimeout(function () {
        var breathingIn = false;
        bgEl.classList.add("is-drifting");
        window.setInterval(function () {
          breathingIn = !breathingIn;
          bgEl.style.transform = breathingIn ? "scale(1.03)" : "scale(1)";
        }, 22000);
      }, 2600);
    }

    onHeroReady(playIntro);

    // The feather as a transition actor: a deliberate CTA click (not
    // ordinary scrolling) sends it drifting up and across the frame,
    // as if caught in the same motion carrying the reader forward.
    // Resets once the hero scrolls back into view so it can replay.
    var featherEl = document.getElementById("hero-feather");
    function departFeather() {
      if (featherEl && !prefersReduced) featherEl.classList.add("is-departing");
    }
    if (featherEl && "IntersectionObserver" in window) {
      var heroSection = document.getElementById("top");
      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) featherEl.classList.remove("is-departing");
          });
        },
        { threshold: 0.6 }
      ).observe(heroSection);
    }

    // CTA buttons
    var enterArchiveBtn = document.querySelector('.hero-cta [data-scroll-target="#archive"]');
    var exploreWorkBtn = document.querySelector('.hero-cta [data-scroll-target="#work"]');
    if (enterArchiveBtn) {
      enterArchiveBtn.addEventListener("click", function () {
        departFeather();
        scrollToTarget("#archive");
      });
    }
    if (exploreWorkBtn) {
      exploreWorkBtn.addEventListener("click", function () {
        departFeather();
        scrollToTarget("#work");
      });
    }
  })();

  /* ------------------------------------------------------------
     5b. Hero layered parallax
     ------------------------------------------------------------
     "The painting is alive": background/palace drifts a hair on mouse
     move, the feather drifts more (foreground = more parallax) with a
     whisper of rotation. Ambient particles/leaves are handled by the
     shared World Engine (section 7b) so the whole page — hero included
     — draws from one particle system instead of several. */
  (function initHeroLiving() {
    if (prefersReduced) return;

    var bgImg = document.querySelector(".hero-bg-img");
    var featherEl = document.getElementById("hero-feather-parallax");
    if (!bgImg && !featherEl) return;

    var mouseEnabled = !isCoarsePointer;
    if (!mouseEnabled) return;

    var mx = 0;
    var my = 0;
    var bgX = 0;
    var bgY = 0;
    var featherX = 0;
    var featherY = 0;

    window.addEventListener(
      "mousemove",
      function (e) {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true }
    );

    (function tick() {
      // Background: barely-there drift (distant mountains/palace).
      bgX = lerp(bgX, mx * 6, 0.04);
      bgY = lerp(bgY, my * 4, 0.04);
      if (bgImg) {
        bgImg.style.transform = "translate3d(" + bgX + "px, " + bgY + "px, 0)";
      }
      // Foreground feather: responds more than the background, plus a
      // whisper of rotation for a light, airborne feel.
      featherX = lerp(featherX, mx * 16, 0.05);
      featherY = lerp(featherY, my * 12, 0.05);
      if (featherEl) {
        featherEl.style.transform =
          "translate3d(" + featherX + "px, " + featherY + "px, 0) rotate(" + (mx * 3).toFixed(2) + "deg)";
      }
      requestAnimationFrame(tick);
    })();
  })();

  /* ------------------------------------------------------------
     6. Navigation
     ------------------------------------------------------------ */
  (function initNavigation() {
    var headerEl = document.getElementById("site-header");
    var toggleBtn = document.getElementById("nav-toggle");
    var mobileMenu = document.getElementById("mobile-menu");

    function onScroll() {
      headerEl.classList.toggle("is-scrolled", window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Active-section indicator: lights up the nav link whose section is
    // currently most in view, so the reader always knows where they are
    // in the archive. Driven from a simple "which section contains the
    // viewport's vertical center" check on scroll, rather than
    // IntersectionObserver threshold-crossing — a large jump (a nav
    // click, or a big scrollIntoView) can otherwise skip straight past
    // a short section's enter/leave events and leave a stale link lit.
    var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a[href^='#']"));
    var trackedSections = navLinks
      .map(function (link) {
        var id = link.getAttribute("href");
        var section = id && id !== "#top" ? document.querySelector(id) : null;
        return section ? { link: link, section: section } : null;
      })
      .filter(Boolean);

    if (trackedSections.length) {
      var navTicking = false;
      function updateActiveNav() {
        navTicking = false;
        var probeY = window.innerHeight * 0.5;
        var current = trackedSections.filter(function (t) {
          var r = t.section.getBoundingClientRect();
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
      window.addEventListener("scroll", onNavScroll, { passive: true });
      window.addEventListener("resize", onNavScroll);
      updateActiveNav();
    }

    function closeMobileMenu() {
      toggleBtn.setAttribute("aria-expanded", "false");
      toggleBtn.setAttribute("aria-label", "Open menu");
      mobileMenu.classList.remove("is-open");
    }

    toggleBtn.addEventListener("click", function () {
      var isOpen = toggleBtn.getAttribute("aria-expanded") === "true";
      toggleBtn.setAttribute("aria-expanded", String(!isOpen));
      toggleBtn.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
      mobileMenu.classList.toggle("is-open", !isOpen);
    });

    // All scroll-triggered links (nav + mobile menu + hero CTA share this
    // pattern via data-scroll-link / data-scroll-target).
    document.querySelectorAll("[data-scroll-link]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        var href = link.getAttribute("href");
        if (!href || href.charAt(0) !== "#") return;
        e.preventDefault();
        closeMobileMenu();
        scrollToTarget(href === "#top" ? "#top" : href);
      });
    });
  })();

  /* ------------------------------------------------------------
     7. Scroll-reveal (replaces GSAP ScrollTrigger-driven Reveal.tsx)
     ------------------------------------------------------------ */
  (function initReveal() {
    var revealEls = document.querySelectorAll(".reveal");
    if (!revealEls.length) return;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
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
  })();

  /* ------------------------------------------------------------
     7b. The Path — progressive timeline line
     ------------------------------------------------------------
     The vertical line grows from top to bottom as the section is
     entered (CSS scaleY transition), rather than being fully drawn
     the instant it scrolls into range — the timeline reveals itself
     the way a scroll unrolls. */
  (function initTimelineReveal() {
    var line = document.querySelector(".timeline-line");
    if (!line) return;
    if (prefersReduced || !("IntersectionObserver" in window)) {
      line.classList.add("is-visible");
      return;
    }
    var observer = new IntersectionObserver(
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
  })();

  /* ------------------------------------------------------------
     8. Parallax layers (scroll-linked drift + mouse parallax)
     ------------------------------------------------------------
     Replaces ParallaxLayer.tsx's GSAP ScrollTrigger `scrub` tween and
     mouse-follow effect with a single shared rAF loop. */
  (function initParallaxLayers() {
    var layers = Array.prototype.slice.call(document.querySelectorAll(".parallax-layer"));
    if (!layers.length || prefersReduced) return;

    var mouseX = 0;
    var mouseY = 0;
    var mouseEnabled = !isCoarsePointer;

    if (mouseEnabled) {
      window.addEventListener(
        "mousemove",
        function (e) {
          mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
          mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        },
        { passive: true }
      );
    }

    var state = layers.map(function (layer) {
      return {
        el: layer,
        img: layer.querySelector(".parallax-img"),
        speed: parseFloat(layer.dataset.speed || "0"),
        mouseStrength: parseFloat(layer.dataset.mouseStrength || "0"),
        cx: 0,
        cy: 0,
      };
    });

    function tick() {
      var viewportH = window.innerHeight;

      state.forEach(function (item) {
        if (!item.img) return;

        // Scroll-linked drift: mapped from the element's position in the
        // viewport, scrubbing smoothly like the original ScrollTrigger.
        var rect = item.el.getBoundingClientRect();
        var progress = clamp(
          1 - (rect.top + rect.height) / (viewportH + rect.height),
          0,
          1
        );
        var scrollOffsetPercent = item.speed * 12 * (progress - 0.5) * 2;

        // Mouse parallax, eased toward target.
        var targetX = mouseEnabled ? mouseX * item.mouseStrength : 0;
        var targetY = mouseEnabled ? mouseY * item.mouseStrength : 0;
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

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  })();

  /* ------------------------------------------------------------
     8b. Section-entry ink transitions
     ------------------------------------------------------------
     Each chamber blooms with a faint ink wash the first time it's
     entered — "turning a page" rather than a hard cut — then the wash
     quietly retracts once the section has fully settled into view.
     Plays once per section per visit; cheap (a single class toggle). */
  (function initSectionInkTransitions() {
    var inks = Array.prototype.slice.call(document.querySelectorAll("[data-section-ink]"));
    if (!inks.length || prefersReduced || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var el = entry.target;
          if (entry.isIntersecting && !el.dataset.played) {
            el.dataset.played = "true";
            el.classList.add("is-active");
            window.setTimeout(function () {
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
  })();

  /* ------------------------------------------------------------
     9. Floating elements (botanical / lantern horizontal drift)
     ------------------------------------------------------------
     Replaces FloatingElement.tsx's mouse-driven horizontal parallax.
     Vertical float/sway motion is pure CSS (.float-anim / .sway-anim). */
  (function initFloatingElements() {
    var els = Array.prototype.slice.call(document.querySelectorAll(".craft-botanical"));
    if (!els.length || prefersReduced || isCoarsePointer) return;

    var mouseX = 0;
    window.addEventListener(
      "mousemove",
      function (e) {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      },
      { passive: true }
    );

    var state = els.map(function (el) {
      return { el: el, cx: 0, strength: 6 };
    });

    function tick() {
      state.forEach(function (item) {
        var target = mouseX * item.strength;
        item.cx = lerp(item.cx, target, 0.05);
        item.el.style.transform = "translate3d(" + item.cx + "px, 0, 0)";
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  /* ------------------------------------------------------------
     9b. THE WORLD ENGINE
     ------------------------------------------------------------
     One shared canvas, one rAF loop, covering the whole page. Three
     ideas make it feel like a living place rather than "more
     animations":

       1. A wind field — a single slowly-evolving value (direction +
          strength) that every particle type reads from, nudged very
          slightly by mouse position and scroll speed. Leaves catch it
          most, dust catches it least.
       2. Leaves have real behaviour: gravity, sideways wind drift,
          rotation, an occasional direction change, and a settle phase
          instead of an instant disappear. Some drift off, some rest.
       3. Landing is an event, not a despawn: a leaf/particle reaching
          a section's declared "water" band spawns a ripple; reaching
          a "ground" band spawns a small dust puff. Both are cheap CSS
          keyframe DOM nodes that remove themselves.

     Density is intentionally restrained (see SECTION_CONFIG) — this
     is a portfolio, not a particle-count showcase.
     ------------------------------------------------------------ */
  (function initWorldEngine() {
    var canvas = document.getElementById("world-canvas");
    if (!canvas || !canvas.getContext) return;
    if (prefersReduced) return;

    var isMobile = window.matchMedia("(max-width: 639px)").matches;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var vw = 0;
    var vh = 0;

    function resize() {
      vw = window.innerWidth;
      vh = window.innerHeight;
      canvas.width = vw * dpr;
      canvas.height = vh * dpr;
      canvas.style.width = vw + "px";
      canvas.style.height = vh + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    /* ---- Wind field --------------------------------------------- */
    // A single slow oscillator, nudged (not driven) by mouse-x and
    // scroll velocity. Consciously subtle: viewers should feel it
    // rather than see "wind" as a distinct effect.
    var wind = { angle: 0.15, strength: 0.5, t: 0 };
    var mouseNudge = 0;
    var lastScrollY = window.scrollY;
    var scrollNudge = 0;

    if (!isCoarsePointer) {
      window.addEventListener(
        "mousemove",
        function (e) {
          mouseNudge = (e.clientX / window.innerWidth - 0.5) * 0.6;
        },
        { passive: true }
      );
    }
    window.addEventListener(
      "scroll",
      function () {
        var dy = window.scrollY - lastScrollY;
        lastScrollY = window.scrollY;
        scrollNudge = clamp(scrollNudge + dy * 0.004, -0.8, 0.8);
      },
      { passive: true }
    );

    function updateWind(dt) {
      wind.t += dt;
      scrollNudge = lerp(scrollNudge, 0, 0.02);
      // Base sway is a slow sine drift; mouse/scroll nudge it further.
      var base = Math.sin(wind.t * 0.00012) * 0.7;
      wind.angle = lerp(wind.angle, base + mouseNudge * 0.5 + scrollNudge * 0.3, 0.01);
      wind.strength = lerp(wind.strength, 0.4 + Math.abs(mouseNudge) * 0.3 + Math.abs(scrollNudge) * 0.4, 0.02);
    }

    /* ---- Section reaction zones ----------------------------------
       Each section can declare a water band (ripple on contact) and/or
       a ground band (dust puff + settle), both expressed as a fraction
       of that section's own height so they track scroll/resize without
       re-measuring every frame. Sections not listed just let particles
       drift past and fade off the bottom of the viewport. */
    var SECTION_CONFIG = {
      top: { density: isMobile ? 0.35 : 1, leaves: true, gold: true, dust: true, mist: false, fireflies: false },
      archive: { density: isMobile ? 0.3 : 0.8, leaves: true, gold: false, dust: true, mist: true, fireflies: false, water: [0.55, 0.62] },
      craft: { density: isMobile ? 0.25 : 0.7, leaves: false, gold: true, dust: true, mist: true, fireflies: true },
      work: { density: isMobile ? 0.2 : 0.55, leaves: false, gold: true, dust: true, mist: false, fireflies: false },
      "ai-lab": { density: 0, leaves: false, gold: false, dust: false, mist: false, fireflies: false },
      path: { density: isMobile ? 0.2 : 0.5, leaves: true, gold: false, dust: false, mist: true, fireflies: false, ground: [0.88, 0.94] },
      certifications: { density: isMobile ? 0.15 : 0.35, leaves: false, gold: true, dust: false, mist: false, fireflies: false },
      contact: { density: isMobile ? 0.4 : 1, leaves: true, gold: false, dust: false, mist: true, fireflies: true, water: [0.62, 0.7] },
    };
    var sectionEls = Object.keys(SECTION_CONFIG)
      .map(function (id) {
        var el = document.getElementById(id);
        return el ? { id: id, el: el, config: SECTION_CONFIG[id] } : null;
      })
      .filter(Boolean);

    // One getBoundingClientRect() per section per frame, cached here and
    // reused by every particle that belongs to that section — not one
    // call per particle. With 40-70 particles this is the difference
    // between ~5 layout reads a frame and 100+, which was measurably
    // dropping frame rate (forced-reflow thrashing interleaved with the
    // canvas draw calls). Cleared once at the top of tick().
    var rectCache = {};
    function rectFor(section) {
      var cached = rectCache[section.id];
      if (cached) return cached;
      cached = section.el.getBoundingClientRect();
      rectCache[section.id] = cached;
      return cached;
    }

    function activeSections() {
      // Sections whose vertical span intersects the viewport right now.
      return sectionEls.filter(function (s) {
        var r = rectFor(s);
        return r.bottom > -200 && r.top < vh + 200;
      });
    }

    /* ---- Environment reaction (DOM-based, cheap, self-removing) --- */
    function spawnRipple(x, y) {
      var el = document.createElement("div");
      el.className = "env-ripple";
      el.style.left = x + "px";
      el.style.top = y + "px";
      document.body.appendChild(el);
      window.setTimeout(function () {
        el.remove();
      }, 2300);
    }
    function spawnDust(x, y) {
      var n = 3 + Math.floor(Math.random() * 2);
      for (var i = 0; i < n; i++) {
        var el = document.createElement("div");
        el.className = "env-dust";
        var dx = (Math.random() - 0.5) * 24;
        var dy = -4 - Math.random() * 10;
        el.style.left = x + "px";
        el.style.top = y + "px";
        el.style.setProperty("--dust-x", dx + "px");
        el.style.setProperty("--dust-y", dy + "px");
        document.body.appendChild(el);
        window.setTimeout(function (node) {
          return function () {
            node.remove();
          };
        }(el), 950);
      }
    }

    // Reaction checks are throttled and capped so a burst of particles
    // landing at once can't spawn dozens of DOM nodes in one frame.
    var reactionBudgetThisFrame = 0;

    function checkReaction(section, particle, prevFraction) {
      if (reactionBudgetThisFrame > 2) return false;
      var rect = rectFor(section);
      var cfg = section.config;
      if (!rect.height) return false;
      // Compare the particle's position as a FRACTION of the section's
      // own height, not raw viewport pixels — while the page is
      // scrolling, the section's rect.top moves every frame too, so a
      // pixel-space "did we cross this line" check compares two
      // different coordinate frames and can miss the crossing (or fire
      // on the wrong frame) entirely. Fraction-of-section is stable
      // under scroll because both prevFraction and the current fraction
      // are measured the same way.
      var curFraction = (particle.y - rect.top) / rect.height;
      if (cfg.water) {
        var w0 = cfg.water[0];
        var w1 = cfg.water[1];
        if (prevFraction < w0 && curFraction >= w0 && curFraction <= w1 + 0.06) {
          spawnRipple(particle.x, rect.top + rect.height * w0);
          reactionBudgetThisFrame++;
          return true;
        }
      }
      if (cfg.ground) {
        var g0 = cfg.ground[0];
        var g1 = cfg.ground[1];
        if (prevFraction < g0 && curFraction >= g0 && curFraction <= g1 + 0.06) {
          spawnDust(particle.x, rect.top + rect.height * g0);
          reactionBudgetThisFrame++;
          return true;
        }
      }
      return false;
    }

    /* ---- Particle pool -------------------------------------------
       One array, tagged by `kind`. Leaves get full physics (gravity +
       wind + rotation + settle); dust/gold/mist/fireflies are simpler
       drifting motes. All read the same wind field. */
    var particles = [];
    var MAX_PARTICLES = isMobile ? 26 : isCoarsePointer ? 40 : 70;
    var LEAF_FALL_RATE = 0.16; // vs. 0.06 for dust/gold/mist — see usage below.

    function spawnLeaf(section) {
      var rect = section.el.getBoundingClientRect();
      return {
        kind: "leaf",
        section: section,
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

    function spawnMote(section, kind) {
      var rect = section.el.getBoundingClientRect();
      var base = {
        kind: kind,
        section: section,
        x: rect.left + Math.random() * rect.width,
        y: rect.top + Math.random() * rect.height,
        alpha: 0,
        life: 0,
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

    function seedForSection(section) {
      var cfg = section.config;
      var rect = section.el.getBoundingClientRect();
      var area = Math.max(rect.height, 1) / vh;
      var budget = Math.round(area * cfg.density * (isMobile ? 5 : 9));
      var made = [];
      if (cfg.leaves) {
        for (var i = 0; i < Math.min(budget, isMobile ? 3 : 6); i++) made.push(spawnLeaf(section));
      }
      if (cfg.gold) {
        for (var g = 0; g < Math.min(budget, 8); g++) made.push(spawnMote(section, "gold"));
      }
      if (cfg.dust) {
        for (var d = 0; d < Math.min(budget, 10); d++) made.push(spawnMote(section, "dust"));
      }
      if (cfg.mist) {
        for (var m = 0; m < Math.min(budget, 4); m++) made.push(spawnMote(section, "mist"));
      }
      if (cfg.fireflies) {
        for (var f = 0; f < Math.min(budget, 5); f++) made.push(spawnMote(section, "firefly"));
      }
      return made;
    }

    var seededSections = {};

    function ensureSeeded() {
      var active = activeSections();
      var activeIds = {};
      active.forEach(function (s) {
        activeIds[s.id] = true;
      });

      var needsRoom = active.some(function (s) {
        return !seededSections[s.id];
      });

      // Make room for newly-active sections by first evicting particles
      // that belong to sections which have scrolled well out of view —
      // a global particle cap shouldn't mean "whichever section loaded
      // first wins forever," it should track what the visitor can
      // actually see right now.
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

    function respawn(p) {
      var section = p.section;
      // If its section has scrolled well out of view, retire the
      // particle instead of respawning off-screen forever.
      var rect = rectFor(section);
      if (rect.bottom < -400 || rect.top > vh + 400) return null;
      if (p.kind === "leaf") return spawnLeaf(section);
      return spawnMote(section, p.kind);
    }

    /* ---- Main loop -------------------------------------------------- */
    var lastT = performance.now();

    function tick(now) {
      var dt = Math.min(now - lastT, 48);
      lastT = now;
      reactionBudgetThisFrame = 0;
      rectCache = {};

      updateWind(dt);
      ensureSeeded();

      ctx.clearRect(0, 0, vw, vh);

      var windX = Math.cos(wind.angle) * wind.strength;

      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.life += dt;
        p.alpha = lerp(p.alpha, p.targetAlpha, 0.02);

        if (p.kind === "leaf") {
          if (!p.settled) {
            // Fraction-of-section position, captured BEFORE this
            // frame's fall/scroll update, for the water/ground crossing
            // check below (see checkReaction's comment for why this
            // has to be a fraction rather than a raw viewport pixel).
            var rectBefore = rectFor(p.section);
            var prevFraction = rectBefore.height ? (p.y - rectBefore.top) / rectBefore.height : -1;

            p.wobble += p.wobbleSpeed * dt * 0.06;
            // Occasional direction change: leaves don't drift in one
            // straight line.
            if (p.life > p.directionChangeAt) {
              p.vx += (Math.random() - 0.5) * 0.12;
              p.directionChangeAt = p.life + 3000 + Math.random() * 5000;
            }
            // Gravity + wind + gentle sideways wobble. LEAF_FALL_RATE
            // (vs. the 0.06 used for dust/gold/mist below) is tuned so
            // a leaf crosses a typical section in ~8-10s: slow and
            // legible as "falling," not a 20+ second crawl.
            p.vy = lerp(p.vy, 0.3 + wind.strength * 0.08, 0.01);
            p.vx = lerp(p.vx, windX * 0.5 + Math.sin(p.wobble) * 0.08, 0.02);
            p.x += p.vx * dt * LEAF_FALL_RATE;
            p.y += p.vy * dt * LEAF_FALL_RATE;
            p.angle += p.spin * dt * 0.06;

            var sectionRect = rectFor(p.section);
            var floor = sectionRect.top + sectionRect.height * 0.97;
            checkReaction(p.section, p, prevFraction);
            if (p.y >= floor && floor < vh + 40) {
              p.settled = true;
              p.settleT = 0;
              p.y = floor;
              p.vx = 0;
              p.vy = 0;
            }
          } else {
            // Rest briefly on the ground, then fade rather than vanish.
            p.settleT += dt;
            if (p.settleT > 3200) {
              p.targetAlpha = 0;
              if (p.alpha < 0.02) {
                particles[i] = respawn(p);
                if (!particles[i]) particles.splice(i, 1);
                continue;
              }
            }
          }
          if (p.y > vh + 60 || p.x < -60 || p.x > vw + 60) {
            particles[i] = respawn(p);
            if (!particles[i]) {
              particles.splice(i, 1);
              continue;
            }
            p = particles[i];
          }
        } else if (p.kind === "dust" || p.kind === "gold") {
          p.x += (p.vx + windX * 0.15) * dt * 0.06;
          p.y += p.vy * dt * 0.06;
          if (p.kind === "gold") {
            p.twinkle += 0.002 * dt;
          }
          if (p.y < -20 || p.x < -40 || p.x > vw + 40) {
            particles[i] = respawn(p);
            if (!particles[i]) {
              particles.splice(i, 1);
              continue;
            }
          }
        } else if (p.kind === "mist") {
          p.x += (p.vx + windX * 0.1) * dt * 0.06;
          p.y += p.vy * dt * 0.06;
          if (p.y < -80) {
            particles[i] = respawn(p);
            if (!particles[i]) {
              particles.splice(i, 1);
              continue;
            }
          }
        } else if (p.kind === "firefly") {
          p.blinkT += p.blinkSpeed * dt * 0.06;
          p.targetAlpha = Math.max(0, Math.sin(p.blinkT)) * 0.6;
          p.wanderAngle += (Math.random() - 0.5) * 0.05;
          p.x += (Math.cos(p.wanderAngle) * 0.1 + windX * 0.05) * dt * 0.06;
          p.y += Math.sin(p.wanderAngle) * 0.08 * dt * 0.06;
          var fRect = rectFor(p.section);
          if (p.y < fRect.top - 40 || p.y > fRect.bottom + 40) {
            p.wanderAngle = -p.wanderAngle;
          }
        }

        // Draw
        ctx.save();
        ctx.globalAlpha = clamp(p.alpha, 0, 1);
        if (p.kind === "leaf") {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.fillStyle = p.hue + (p.settled ? 0.35 : 0.55) + ")";
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.42, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          continue;
        }
        if (p.kind === "mist") {
          var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, "rgba(" + hexToRgbTriplet(p.color) + ", " + p.alpha + ")");
          grad.addColorStop(1, "rgba(" + hexToRgbTriplet(p.color) + ", 0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          continue;
        }
        var alphaOut = p.kind === "gold" ? p.alpha * (0.6 + 0.4 * Math.sin(p.twinkle)) : p.alpha;
        ctx.globalAlpha = clamp(alphaOut, 0, 1);
        ctx.fillStyle = "rgba(" + (p.color || "224, 189, 126") + ", 1)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      requestAnimationFrame(tick);
    }

    function hexToRgbTriplet(v) {
      // Colors are already stored as "r, g, b" strings here.
      return v;
    }

    requestAnimationFrame(tick);

    // Small public hook so other interactions (a discovered skill, a
    // hovered project, an opened certification) can ask the world to
    // react at a specific point, without spinning up a second particle
    // system. Cheap: a handful of DOM dust nodes, self-removing.
    window.InkWorld = {
      sparkleAt: function (x, y) {
        spawnDust(x, y);
      },
      debugState: function () {
        var bySection = {};
        particles.forEach(function (p) {
          var id = p.section.id;
          bySection[id] = bySection[id] || { total: 0, leaves: 0 };
          bySection[id].total++;
          if (p.kind === "leaf") bySection[id].leaves++;
        });
        return {
          total: particles.length,
          max: MAX_PARTICLES,
          bySection: bySection,
          seeded: Object.keys(seededSections),
        };
      },
    };
  })();

  /* ------------------------------------------------------------
     10. Craft section — skill category switching
     ------------------------------------------------------------ */
  // Each skill carries a small ink symbol and a one-line field note —
  // the "apothecary" framing: a skill is a specimen, discovered rather
  // than just listed.
  var SKILL_CATEGORIES = [
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

  (function initCraft() {
    var buttons = document.querySelectorAll(".craft-cat-btn");
    var panel = document.getElementById("craft-skill-panel");
    if (!buttons.length || !panel) return;

    function render(key) {
      var category = SKILL_CATEGORIES.filter(function (c) {
        return c.key === key;
      })[0];
      if (!category) return;

      panel.innerHTML = "";
      var wrap = document.createElement("div");
      wrap.className = "craft-skill-tags";

      category.skills.forEach(function (skill, i) {
        var tag = document.createElement("span");
        tag.className = "craft-skill-tag cursor-hover";
        tag.style.animationDelay = i * 0.05 + "s";
        tag.tabIndex = 0;
        tag.setAttribute("role", "button");
        tag.setAttribute("aria-expanded", "false");

        var symbolEl = document.createElement("span");
        symbolEl.className = "skill-symbol";
        symbolEl.setAttribute("aria-hidden", "true");
        symbolEl.textContent = skill.symbol;

        var nameEl = document.createTextNode(skill.name);

        var noteEl = document.createElement("span");
        noteEl.className = "skill-note";
        noteEl.textContent = skill.note;

        tag.appendChild(symbolEl);
        tag.appendChild(nameEl);
        tag.appendChild(noteEl);

        function discover() {
          if (tag.classList.contains("is-discovered")) return;
          tag.classList.add("is-discovered");
          tag.setAttribute("aria-expanded", "true");
          if (window.InkWorld && !isCoarsePointer) {
            var r = tag.getBoundingClientRect();
            window.InkWorld.sparkleAt(r.left + 10, r.top + r.height / 2);
          }
        }
        tag.addEventListener("mouseenter", discover);
        tag.addEventListener("focus", discover);
        tag.addEventListener("click", discover);

        wrap.appendChild(tag);
      });

      panel.appendChild(wrap);
      // Restart the panel's own fade-up animation on each switch.
      panel.style.animation = "none";
      // eslint-disable-next-line no-unused-expressions
      panel.offsetHeight; /* force reflow */
      panel.style.animation = "";
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        render(btn.dataset.category);
      });
    });

    render(SKILL_CATEGORIES[0].key);
  })();

  /* ------------------------------------------------------------
     11. Work section — project list + project viewer modal
     ------------------------------------------------------------ */
  var PROJECTS = [
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

  (function initWork() {
    var listEl = document.getElementById("work-list");
    if (!listEl) return;

    PROJECTS.forEach(function (project, i) {
      var li = document.createElement("li");
      li.className = "reveal";

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "work-item-btn cursor-hover";
      btn.dataset.index = String(i);

      var featuredHtml = project.featured
        ? '<span class="work-item-featured">Featured</span>'
        : "";

      btn.innerHTML =
        '<div class="work-item-left">' +
        '<span class="work-item-index">' + String(i + 1).padStart(2, "0") + "</span>" +
        "<div>" +
        '<h3 class="work-item-name">' + project.name + featuredHtml + "</h3>" +
        '<p class="work-item-category">' + project.category + "</p>" +
        "</div>" +
        "</div>" +
        '<span class="work-item-open">Open →</span>';

      btn.addEventListener("click", function () {
        openProjectViewer(i);
      });

      // A quiet reaction, not a light show: one small dust puff near
      // the row's gold index number when the reader's attention lands
      // on it, throttled per-row so it never fires more than once
      // until they move away and back.
      if (!isCoarsePointer) {
        var reacted = false;
        btn.addEventListener("mouseenter", function () {
          if (reacted || !window.InkWorld) return;
          reacted = true;
          var r = btn.getBoundingClientRect();
          window.InkWorld.sparkleAt(r.left + 14, r.top + r.height / 2);
        });
        btn.addEventListener("mouseleave", function () {
          reacted = false;
        });
      }

      li.appendChild(btn);
      listEl.appendChild(li);
    });

    // Reveal-observe the freshly created items (the global initReveal ran
    // before these existed).
    var newReveals = listEl.querySelectorAll(".reveal");
    if (prefersReduced || !("IntersectionObserver" in window)) {
      newReveals.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var observer = new IntersectionObserver(
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
      newReveals.forEach(function (el) {
        observer.observe(el);
      });
    }
  })();

  var activeProjectIndex = null;
  var lastFocusedEl = null;

  function openProjectViewer(index) {
    activeProjectIndex = index;
    renderProjectViewer();

    var viewerEl = document.getElementById("project-viewer");
    lastFocusedEl = document.activeElement;
    viewerEl.hidden = false;
    document.body.style.overflow = "hidden";

    // Force reflow so the opacity/transform transition actually runs.
    // eslint-disable-next-line no-unused-expressions
    viewerEl.offsetHeight;
    viewerEl.classList.add("is-visible");

    var closeBtn = document.getElementById("project-viewer-close");
    if (closeBtn) closeBtn.focus();

    document.addEventListener("keydown", onProjectViewerKeydown);
  }

  function closeProjectViewer() {
    var viewerEl = document.getElementById("project-viewer");
    viewerEl.classList.remove("is-visible");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onProjectViewerKeydown);

    window.setTimeout(
      function () {
        viewerEl.hidden = true;
      },
      prefersReduced ? 0 : 400
    );

    activeProjectIndex = null;
    if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
      lastFocusedEl.focus();
    }
  }

  function nextProject() {
    if (activeProjectIndex === null) return;
    activeProjectIndex = (activeProjectIndex + 1) % PROJECTS.length;
    renderProjectViewer();
  }

  function prevProject() {
    if (activeProjectIndex === null) return;
    activeProjectIndex = (activeProjectIndex - 1 + PROJECTS.length) % PROJECTS.length;
    renderProjectViewer();
  }

  function onProjectViewerKeydown(e) {
    if (e.key === "Escape") closeProjectViewer();
    if (e.key === "ArrowRight") nextProject();
    if (e.key === "ArrowLeft") prevProject();
  }

  function renderProjectViewer() {
    if (activeProjectIndex === null) return;
    var project = PROJECTS[activeProjectIndex];

    document.getElementById("project-viewer-category").textContent = project.category;
    document.getElementById("project-viewer-title").textContent = project.name;
    document.getElementById("project-viewer-role").textContent = project.role;
    document.getElementById("project-viewer-description").textContent = project.description;
    document.getElementById("project-viewer-outcome").textContent = project.outcome;

    var toolsEl = document.getElementById("project-viewer-tools");
    toolsEl.innerHTML = "";
    project.tools.forEach(function (tool) {
      var span = document.createElement("span");
      span.textContent = tool;
      toolsEl.appendChild(span);
    });
  }

  (function initProjectViewerControls() {
    var viewerEl = document.getElementById("project-viewer");
    if (!viewerEl) return;

    document.getElementById("project-viewer-close").addEventListener("click", closeProjectViewer);
    document.getElementById("project-viewer-next").addEventListener("click", nextProject);
    document.getElementById("project-viewer-prev").addEventListener("click", prevProject);

    viewerEl.addEventListener("click", function (e) {
      if (e.target === viewerEl) closeProjectViewer();
    });
  })();

  /* ------------------------------------------------------------
     12. AI Lab — ink splash scroll-scrub reveal
     ------------------------------------------------------------
     Replaces the GSAP ScrollTrigger scrub tween (opacity/scale/rotate
     driven by scroll position between "top 70%" and "top 10%"). */
  (function initAiLabInk() {
    var sectionEl = document.getElementById("ai-lab");
    var inkEl = document.getElementById("ai-lab-ink");
    if (!sectionEl || !inkEl || prefersReduced) {
      if (inkEl) {
        inkEl.style.opacity = "0.9";
        inkEl.style.setProperty("--ink-scale", "1");
        inkEl.style.setProperty("--ink-rotate", "0deg");
      }
      return;
    }

    function update() {
      var rect = sectionEl.getBoundingClientRect();
      var viewportH = window.innerHeight;

      // Map scroll progress: 0 when section top is at 70% of viewport,
      // 1 when section top is at 10% of viewport (matches the original
      // ScrollTrigger start/end).
      var startY = viewportH * 0.7;
      var endY = viewportH * 0.1;
      var progress = clamp((startY - rect.top) / (startY - endY), 0, 1);

      var opacity = lerp(0, 0.9, progress);
      var scale = lerp(0.7, 1, progress);
      var rotate = lerp(-6, 0, progress);

      inkEl.style.opacity = String(opacity);
      inkEl.style.setProperty("--ink-scale", String(scale));
      inkEl.style.setProperty("--ink-rotate", rotate + "deg");
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        update();
        ticking = false;
      });
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  })();

  /* ------------------------------------------------------------
     12b. AI Lab — floating nodes + connections
     ------------------------------------------------------------
     "Ancient knowledge x modern AI": a sparse set of gold nodes drift
     slowly and draw a faint line to their nearest neighbours when
     close enough — read as constellations/knowledge-graphs, not a
     dashboard. No labels, no HUD chrome, no cyberpunk grid. */
  (function initAiLabNodes() {
    var section = document.getElementById("ai-lab");
    var canvas = document.getElementById("ai-lab-nodes");
    if (!section || !canvas || !canvas.getContext || prefersReduced) return;

    var isMobile = window.matchMedia("(max-width: 639px)").matches;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0;
    var h = 0;
    var nodes = [];
    var count = isMobile ? 8 : 16;
    var visible = false;

    function resize() {
      w = section.clientWidth;
      h = section.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeNode() {
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
    for (var i = 0; i < count; i++) nodes.push(makeNode());
    window.addEventListener("resize", resize);

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(section);

    var maxLinkDist = isMobile ? 90 : 150;

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

        // Connections between near neighbours only — keeps it sparse.
        for (var a = 0; a < nodes.length; a++) {
          for (var b = a + 1; b < nodes.length; b++) {
            var dx = nodes[a].x - nodes[b].x;
            var dy = nodes[a].y - nodes[b].y;
            var dist = Math.sqrt(dx * dx + dy * dy);
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
          var glow = 0.4 + 0.3 * Math.sin(n.pulse);
          ctx.save();
          ctx.globalAlpha = glow;
          ctx.fillStyle = "rgba(240, 207, 143, 1)";
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  })();

  /* ------------------------------------------------------------
     12c. Certifications — archive documents, ink reaction on hover
     ------------------------------------------------------------ */
  (function initCertifications() {
    if (isCoarsePointer) return;
    var cards = document.querySelectorAll(".certification-card");
    cards.forEach(function (card) {
      card.addEventListener("mouseenter", function () {
        if (!window.InkWorld) return;
        var r = card.getBoundingClientRect();
        window.InkWorld.sparkleAt(r.right - 24, r.bottom - 24);
      });
    });
  })();

  /* ------------------------------------------------------------
     13. Footer year
     ------------------------------------------------------------ */
  (function initFooterYear() {
    var el = document.getElementById("footer-copyright");
    if (!el) return;
    el.textContent = "© " + new Date().getFullYear() + " Aditya Singh";
  })();
})();
