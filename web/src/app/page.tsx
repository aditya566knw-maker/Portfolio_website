"use client";

import { useInkWorld } from "@/hooks/useInkWorld";
import CraftSkills from "@/components/CraftSkills";
import Work from "@/components/Work";
import Footer from "@/components/Footer";

/* The whole site — a faithful React port of static/index.html.
   Structure is rendered declaratively; all imperative behavior
   (cursor, loading screen, hero, parallax, world engine, nav, etc.)
   is ported into the useInkWorld hook which runs against this DOM. */
export default function Home() {
  useInkWorld();

  return (
    <>
      {/* SKIP LINK */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      {/* LOADING SCREEN */}
      <div id="loading-screen" className="loader-screen" role="status" aria-live="polite">
        <p className="loader-label">Entering the Archive</p>
        <h1 className="loader-title">INKOFJATAYU</h1>
      </div>

      {/* CUSTOM CURSOR */}
      <div id="custom-cursor" className="custom-cursor" aria-hidden="true" hidden>
        <div className="cursor-trail"></div>
        <div className="cursor-ring"></div>
        <div className="cursor-dot"></div>
      </div>

      {/* WORLD ENGINE CANVAS */}
      <canvas id="world-canvas" className="world-canvas" aria-hidden="true"></canvas>

      {/* NAVIGATION */}
      <header id="site-header" className="site-header">
        <nav className="nav" aria-label="Primary">
          <a href="#top" className="nav-brand cursor-hover" data-scroll-link>
            INK<span className="text-gold">OF</span>JATAYU
          </a>

          <ul className="nav-links">
            <li>
              <a href="#archive" className="link-gold cursor-hover" data-scroll-link>
                Archive
              </a>
            </li>
            <li>
              <a href="#craft" className="link-gold cursor-hover" data-scroll-link>
                Craft
              </a>
            </li>
            <li>
              <a href="#work" className="link-gold cursor-hover" data-scroll-link>
                Work
              </a>
            </li>
            <li>
              <a href="#ai-lab" className="link-gold cursor-hover" data-scroll-link>
                AI Lab
              </a>
            </li>
            <li>
              <a href="#contact" className="link-gold cursor-hover" data-scroll-link>
                Contact
              </a>
            </li>
          </ul>

          <button
            type="button"
            id="nav-toggle"
            className="nav-toggle cursor-hover"
            aria-label="Open menu"
            aria-expanded="false"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>

        <div id="mobile-menu" className="mobile-menu">
          <ul>
            <li>
              <a href="#archive" data-scroll-link>
                Archive
              </a>
            </li>
            <li>
              <a href="#craft" data-scroll-link>
                Craft
              </a>
            </li>
            <li>
              <a href="#work" data-scroll-link>
                Work
              </a>
            </li>
            <li>
              <a href="#ai-lab" data-scroll-link>
                AI Lab
              </a>
            </li>
            <li>
              <a href="#contact" data-scroll-link>
                Contact
              </a>
            </li>
          </ul>
        </div>
      </header>

      <main id="main-content">
        {/* SECTION I — THE GATE (Hero) */}
        <section id="top" className="hero" aria-label="Introduction">
          <div className="hero-bg" id="hero-bg">
            <img
              src="/assets/hero-1920.webp"
              srcSet="/assets/hero-720.webp 720w, /assets/hero-1280.webp 1280w, /assets/hero-1920.webp 1920w"
              sizes="100vw"
              alt="A moonlit ancient palace courtyard, lanterns glowing among autumn maples and distant mountains"
              className="hero-bg-img"
              fetchPriority="high"
            />
            <div className="hero-bg-gradient-top"></div>
            <div className="hero-bg-gradient-bottom"></div>
            <div className="hero-lantern-spot hero-lantern-spot--left" aria-hidden="true"></div>
            <div className="hero-lantern-spot hero-lantern-spot--right" aria-hidden="true"></div>
          </div>

          <div className="hero-mist" id="hero-mist"></div>
          <div className="hero-rays" id="hero-rays" aria-hidden="true"></div>

          <div className="hero-feather" id="hero-feather" data-cursor="decorative">
            <div className="hero-feather-parallax" id="hero-feather-parallax">
              <div className="float-anim">
                <img src="/assets/feather-480.webp" alt="" width="480" height="720" />
              </div>
            </div>
          </div>

          <div className="hero-content">
            <div className="hero-title" id="hero-title">
              <p className="hero-brand">InkOfJatayu</p>
              <h1 className="hero-name">Aditya Singh</h1>
              <p className="hero-positioning">
                Digital Marketing  ·  Business Analytics  ·  AI Creative Technology
              </p>
              <p className="hero-statement">
                &ldquo;I build at the intersection of strategy, data, technology and visual
                storytelling.&rdquo;
              </p>
            </div>

            <div className="hero-cta" id="hero-cta">
              <button type="button" className="btn-fill cursor-hover" data-scroll-target="#archive">
                <span>Enter the Archive</span>
              </button>
              <button
                type="button"
                className="link-gold cursor-hover btn-text"
                data-scroll-target="#work"
              >
                Explore My Work
              </button>
            </div>
          </div>

          <div className="hero-scroll-cue" aria-hidden="true"></div>
        </section>

        {/* SECTION II — THE ARCHIVE */}
        <section id="archive" className="section archive-section" aria-label="About Aditya Singh">
          <div className="parallax-layer" data-speed="-0.6" data-mouse-strength="6">
            <img
              className="parallax-img"
              src="/assets/about-1920.webp"
              srcSet="/assets/about-720.webp 720w, /assets/about-1280.webp 1280w, /assets/about-1920.webp 1920w"
              sizes="100vw"
              alt="An ancient candlelit library archive, scrolls and books lining tall shelves"
              loading="lazy"
            />
          </div>
          <div className="archive-overlay"></div>
          <div className="section-ink" data-section-ink aria-hidden="true">
            <img src="/assets/ink-splash-900.webp" alt="" loading="lazy" />
          </div>

          <div className="section-inner archive-grid">
            <div className="archive-intro">
              <div className="reveal">
                <p className="eyebrow">Section I</p>
                <h2 className="section-heading">The Archive</h2>
              </div>
              <p className="reveal quote-text">
                &ldquo;I work across marketing, analytics, brand strategy and AI-powered creative
                workflows.&rdquo;
              </p>
              <p className="reveal body-text">
                Based in Indore, Madhya Pradesh, India, currently serving as IT Operations Associate,
                Growwstacks / MTEC Software and Business Automations Pvt. Ltd.. This archive holds the
                record of a path built at the crossing of business, data, and creative technology.
              </p>
            </div>

            <div className="archive-education">
              <p className="reveal eyebrow eyebrow-muted">Education</p>
              <ol className="education-list">
                <li className="reveal education-item">
                  <div className="education-marker"></div>
                  <p className="education-degree">MBA — Business Analytics &amp; Finance</p>
                  <p className="education-school">DAVV, Indore</p>
                  <p className="education-period">2023–2025</p>
                </li>
                <li className="reveal education-item">
                  <div className="education-marker"></div>
                  <p className="education-degree">BBA — Marketing</p>
                  <p className="education-school">DAVV, Indore</p>
                  <p className="education-period">2020–2023</p>
                </li>
              </ol>

              <div className="reveal archive-note">
                <div className="archive-note-scroll">
                  <img src="/assets/scroll-480.webp" alt="" width="480" height="320" loading="lazy" />
                </div>
                <p>
                  Marketing, business, data and AI — read not as separate disciplines, but as one
                  continuous craft.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION III — THE CRAFT */}
        <section id="craft" className="section craft-section" aria-label="Skills and craft">
          <div className="parallax-layer" data-speed="-0.5" data-mouse-strength="5">
            <img
              className="parallax-img"
              src="/assets/skills-1920.webp"
              srcSet="/assets/skills-720.webp 720w, /assets/skills-1280.webp 1280w, /assets/skills-1920.webp 1920w"
              sizes="100vw"
              alt="A moonlit study with botanical arrangements, ink brushes, and scrolls"
              loading="lazy"
            />
          </div>
          <div className="craft-overlay"></div>

          <div className="floating-el craft-botanical" data-speed="-0.3">
            <img src="/assets/botanical-900.webp" alt="" loading="lazy" />
          </div>

          <div className="section-inner">
            <div className="reveal">
              <p className="eyebrow">Section II</p>
              <h2 className="section-heading">The Craft</h2>
              <p className="section-lead">
                A cultivated set of tools, gathered like specimens in a study — each category a small
                garden of its own.
              </p>
            </div>

            <CraftSkills />
          </div>
        </section>

        {/* SECTION IV — THE WORK */}
        <section id="work" className="section work-section" aria-label="Selected work">
          <div className="parallax-layer" data-speed="-0.4" data-mouse-strength="4">
            <img
              className="parallax-img"
              src="/assets/project-1920.webp"
              srcSet="/assets/project-720.webp 720w, /assets/project-1280.webp 1280w, /assets/project-1920.webp 1920w"
              sizes="100vw"
              alt="Grand ancient archive hall with towering shelves of scrolls"
              loading="lazy"
            />
          </div>
          <div className="work-overlay"></div>
          <div className="section-ink" data-section-ink aria-hidden="true">
            <img src="/assets/ink-splash-900.webp" alt="" loading="lazy" />
          </div>

          <div className="section-inner">
            <div className="reveal">
              <p className="eyebrow">Section III</p>
              <h2 className="section-heading">The Work</h2>
              <p className="section-lead">
                Each record below opens like a scroll pulled from the shelf — a project, a role, a
                purpose.
              </p>
            </div>

            <Work />
          </div>
        </section>

        {/* SECTION V — THE AI LAB */}
        <section id="ai-lab" className="section ai-lab-section" aria-label="AI Lab">
          <div className="ai-lab-radial"></div>
          <div className="ai-lab-fade-top"></div>
          <div className="ai-lab-fade-bottom"></div>

          <div className="ai-lab-ink" id="ai-lab-ink" aria-hidden="true">
            <img src="/assets/ink-splash-900.webp" alt="" loading="lazy" />
          </div>
          <canvas className="ai-lab-nodes" id="ai-lab-nodes" aria-hidden="true"></canvas>

          <div className="section-inner">
            <div className="reveal">
              <p className="eyebrow">Section IV</p>
              <h2 className="section-heading">The AI Lab</h2>
              <p className="section-lead ai-lab-tagline">
                Where strategy meets generative technology.
              </p>
            </div>

            <div className="ai-lab-capabilities">
              <div className="reveal ai-cap">
                <span className="ai-cap-dot"></span>
                <span>AI Image Generation</span>
              </div>
              <div className="reveal ai-cap">
                <span className="ai-cap-dot"></span>
                <span>AI Video Generation</span>
              </div>
              <div className="reveal ai-cap">
                <span className="ai-cap-dot"></span>
                <span>Prompt Engineering</span>
              </div>
              <div className="reveal ai-cap">
                <span className="ai-cap-dot"></span>
                <span>Creative Automation</span>
              </div>
              <div className="reveal ai-cap">
                <span className="ai-cap-dot"></span>
                <span>Vibe Coding</span>
              </div>
              <div className="reveal ai-cap">
                <span className="ai-cap-dot"></span>
                <span>AI-Assisted Workflows</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION VI — THE PATH (Timeline) */}
        <section id="path" className="section path-section" aria-label="Career timeline">
          <canvas className="path-atmosphere" id="path-atmosphere" aria-hidden="true"></canvas>
          <div className="path-silhouette" aria-hidden="true"></div>
          <div className="section-inner section-inner-narrow">
            <div className="reveal">
              <p className="eyebrow">Section V</p>
              <h2 className="section-heading">The Path</h2>
            </div>

            <ol className="timeline-list">
              <div className="timeline-line" aria-hidden="true"></div>

              <li className="reveal timeline-item">
                <span className="timeline-dot" aria-hidden="true"></span>
                <p className="timeline-period">2023</p>
                <h3 className="timeline-title">Independent Brand Strategist &amp; Consultant</h3>
              </li>
              <li className="reveal timeline-item">
                <span className="timeline-dot" aria-hidden="true"></span>
                <p className="timeline-period">2024</p>
                <h3 className="timeline-title">Marketing Associate</h3>
                <p className="timeline-org">Maltar Services</p>
              </li>
              <li className="reveal timeline-item">
                <span className="timeline-dot" aria-hidden="true"></span>
                <p className="timeline-period">2024–Present</p>
                <h3 className="timeline-title">Strategic Brand Executive</h3>
                <p className="timeline-org">Ventilia</p>
              </li>
              <li className="reveal timeline-item">
                <span className="timeline-dot" aria-hidden="true"></span>
                <p className="timeline-period">2026–Present</p>
                <h3 className="timeline-title">IT Operations Associate</h3>
                <p className="timeline-org">Growwstacks / MTEC</p>
              </li>
            </ol>
          </div>
        </section>

        {/* SECTION VII — CERTIFICATIONS */}
        <section
          id="certifications"
          className="section certifications-section"
          aria-label="Certifications"
        >
          <div className="section-inner section-inner-narrow">
            <div className="reveal">
              <p className="eyebrow">Section VI</p>
              <h2 className="section-heading">Certifications</h2>
            </div>

            <div className="certifications-grid">
              <div className="reveal certification-card">
                <div className="certification-texture" aria-hidden="true"></div>
                <div className="certification-ink" aria-hidden="true"></div>
                <p className="eyebrow eyebrow-tight">Google</p>
                <h3 className="certification-title">
                  Foundations of Digital Marketing &amp; E-commerce
                </h3>
              </div>
              <div className="reveal certification-card">
                <div className="certification-texture" aria-hidden="true"></div>
                <div className="certification-ink" aria-hidden="true"></div>
                <p className="eyebrow eyebrow-tight">Infosys</p>
                <h3 className="certification-title">Young Industry Enthusiast — Retail Focus</h3>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION VIII — CONTACT */}
        <section id="contact" className="section contact-section" aria-label="Contact">
          <div className="parallax-layer" data-speed="-0.5" data-mouse-strength="5">
            <img
              className="parallax-img"
              src="/assets/contact-1920.webp"
              srcSet="/assets/contact-720.webp 720w, /assets/contact-1280.webp 1280w, /assets/contact-1920.webp 1920w"
              sizes="100vw"
              alt="A quiet moonlit pavilion beside a still lake, lantern light reflected in the water"
              loading="lazy"
            />
          </div>
          <div className="contact-overlay-top"></div>
          <div className="contact-overlay-bottom"></div>
          <div className="contact-water-shimmer" aria-hidden="true"></div>

          <div className="floating-el contact-lantern" data-cursor="decorative">
            <div className="sway-anim">
              <div className="lantern-glow" aria-hidden="true"></div>
              <img src="/assets/lantern-480.webp" alt="" loading="lazy" />
            </div>
          </div>

          <div className="section-inner contact-inner">
            <div className="reveal">
              <p className="eyebrow">Section VII</p>
              <h2 className="contact-heading">The story doesn&rsquo;t end here.</h2>
            </div>

            <p className="reveal contact-subheading">Have an idea worth building?</p>

            <div className="reveal contact-cta">
              <a href="mailto:aditya566knw@gmail.com" className="btn-fill cursor-hover">
                <span>Let&rsquo;s Talk</span>
              </a>
              <a
                href="mailto:aditya566knw@gmail.com"
                className="link-gold cursor-hover contact-email"
              >
                aditya566knw@gmail.com
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </>
  );
}
