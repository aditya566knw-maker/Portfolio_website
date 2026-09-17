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
     ------------------------------------------------------------ */
  (function initCustomCursor() {
    var cursorEnabled = isFinePointer && !isCoarsePointer && !prefersReduced;
    if (!cursorEnabled) return;

    var cursorEl = document.getElementById("custom-cursor");
    var dotEl = cursorEl.querySelector(".cursor-dot");
    var ringEl = cursorEl.querySelector(".cursor-ring");
    if (!cursorEl || !dotEl || !ringEl) return;

    cursorEl.hidden = false;
    document.body.classList.add("cursor-enabled");

    var targetX = 0;
    var targetY = 0;
    var ringX = 0;
    var ringY = 0;
    var raf = 0;

    window.addEventListener(
      "pointermove",
      function (e) {
        targetX = e.clientX;
        targetY = e.clientY;
        dotEl.style.transform = "translate3d(" + targetX + "px, " + targetY + "px, 0)";

        var interactive = !!e.target.closest(
          'a, button, [role="button"], input, textarea, .cursor-hover'
        );
        ringEl.classList.toggle("is-active", interactive);
      },
      { passive: true }
    );

    function tick() {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      ringEl.style.transform = "translate3d(" + ringX + "px, " + ringY + "px, 0)";
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
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
    var featherEl = document.getElementById("hero-feather");
    var titleEl = document.getElementById("hero-title");
    var ctaEl = document.getElementById("hero-cta");
    if (!bgEl) return;

    var played = false;

    function playIntro() {
      if (played) return;
      played = true;

      if (prefersReduced) {
        [bgEl, mistEl, featherEl, titleEl, ctaEl].forEach(function (el) {
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
      }, 1100);

      window.setTimeout(function () {
        titleEl.classList.add("is-visible");
      }, 1700);

      window.setTimeout(function () {
        ctaEl.classList.add("is-visible");
      }, 2200);

      // Gentle continuous camera drift once the intro settles.
      window.setTimeout(function () {
        bgEl.classList.add("is-drifting");
        var driftIn = true;
        window.setInterval(function () {
          driftIn = !driftIn;
          bgEl.style.transform = driftIn ? "scale(1.06)" : "scale(1)";
        }, 18000);
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
