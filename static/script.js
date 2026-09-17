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

    // CTA buttons
    var enterArchiveBtn = document.querySelector('.hero-cta [data-scroll-target="#archive"]');
    var exploreWorkBtn = document.querySelector('.hero-cta [data-scroll-target="#work"]');
    if (enterArchiveBtn) {
      enterArchiveBtn.addEventListener("click", function () {
        scrollToTarget("#archive");
      });
    }
    if (exploreWorkBtn) {
      exploreWorkBtn.addEventListener("click", function () {
        scrollToTarget("#work");
      });
    }
  })();

  /* ------------------------------------------------------------
     5b. Hero layered parallax + ambient particles
     ------------------------------------------------------------
     "The painting is alive": background/palace drifts a hair on mouse
     move, the feather drifts more (foreground = more parallax), and a
     handful of soft motes/petals drift upward across the courtyard.
     Everything is capped to a tiny range — never an aggressive pan. */
  (function initHeroLiving() {
    if (prefersReduced) return;

    var heroEl = document.querySelector(".hero");
    var bgImg = document.querySelector(".hero-bg-img");
    var featherEl = document.getElementById("hero-feather-parallax");
    if (!heroEl) return;

    var mouseEnabled = !isCoarsePointer;
    if (mouseEnabled && (bgImg || featherEl)) {
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
    }

    // Ambient particle canvas: fine gold motes drifting upward, with a
    // few slow "falling leaf" petals. Kept sparse and slow on purpose.
    var canvas = document.getElementById("hero-particles");
    if (!canvas || !canvas.getContext) return;

    var isMobile = window.matchMedia("(max-width: 639px)").matches;
    var ctx = canvas.getContext("2d");
    var particles = [];
    var count = isMobile ? 0 : isCoarsePointer ? 10 : 22;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0;
    var h = 0;

    function resize() {
      w = heroEl.clientWidth;
      h = heroEl.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeParticle(seedTop) {
      var isLeaf = Math.random() < 0.18;
      return {
        x: Math.random() * w,
        y: seedTop ? Math.random() * h : h + 20,
        r: isLeaf ? 2.5 + Math.random() * 2 : 0.6 + Math.random() * 1.2,
        speed: isLeaf ? 0.12 + Math.random() * 0.1 : 0.06 + Math.random() * 0.1,
        drift: (Math.random() - 0.5) * 0.3,
        alpha: isLeaf ? 0.35 + Math.random() * 0.25 : 0.25 + Math.random() * 0.35,
        isLeaf: isLeaf,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.01,
      };
    }

    if (count > 0) {
      resize();
      for (var i = 0; i < count; i++) particles.push(makeParticle(true));
      window.addEventListener("resize", resize);

      (function draw() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(function (p) {
          p.y -= p.speed;
          p.x += p.drift * 0.2;
          p.angle += p.spin;
          if (p.y < -20) {
            Object.assign(p, makeParticle(false));
          }
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.isLeaf ? "rgba(201, 163, 92, 0.9)" : "rgba(224, 189, 126, 0.9)";
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          if (p.isLeaf) {
            ctx.beginPath();
            ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.r, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });
        requestAnimationFrame(draw);
      })();
    }
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
    // in the archive.
    var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a[href^='#']"));
    var trackedSections = navLinks
      .map(function (link) {
        var id = link.getAttribute("href");
        var section = id && id !== "#top" ? document.querySelector(id) : null;
        return section ? { link: link, section: section } : null;
      })
      .filter(Boolean);

    if (trackedSections.length && "IntersectionObserver" in window) {
      var navObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var match = trackedSections.filter(function (t) {
              return t.section === entry.target;
            })[0];
            if (!match) return;
            if (entry.isIntersecting) {
              navLinks.forEach(function (l) {
                l.classList.remove("is-active");
              });
              match.link.classList.add("is-active");
            }
          });
        },
        { threshold: 0, rootMargin: "-45% 0px -45% 0px" }
      );
      trackedSections.forEach(function (t) {
        navObserver.observe(t.section);
      });
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
     10. Craft section — skill category switching
     ------------------------------------------------------------ */
  var SKILL_CATEGORIES = [
    {
      key: "marketing",
      skills: ["Meta Ads", "Google Ads", "Campaign Planning", "Consumer Research", "Competitive Intelligence"],
    },
    {
      key: "analytics",
      skills: ["Power BI", "Google Analytics / GA4", "Google Search Console", "Performance Tracking", "Data Visualization"],
    },
    {
      key: "branding",
      skills: ["Brand Identity", "Market Positioning", "Strategic Storytelling", "Content Strategy"],
    },
    {
      key: "ai",
      skills: ["ChatGPT", "Claude", "Gemini", "Prompt Engineering", "AI Image Generation", "AI Video Generation", "Automated Workflows"],
    },
    {
      key: "development",
      skills: ["Vibe Coding", "HTML/CSS", "Website Workflows", "AI-Assisted Development"],
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
        tag.textContent = skill;
        tag.style.animationDelay = i * 0.05 + "s";
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
     13. Footer year
     ------------------------------------------------------------ */
  (function initFooterYear() {
    var el = document.getElementById("footer-copyright");
    if (!el) return;
    el.textContent = "© " + new Date().getFullYear() + " Aditya Singh";
  })();
})();
