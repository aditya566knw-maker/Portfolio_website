# InkOfJatayu — Aditya Singh Portfolio

A cinematic, journey-driven portfolio built for Aditya Singh (InkOfJatayu) —
positioned across digital marketing, business analytics, brand strategy and
AI-powered creative workflows. Visual language draws on ancient East Asian
ink-and-gold atmosphere (lanterns, scrolls, mist, moonlight) without copying
any copyrighted character, logo, or scene.

## Stack

- **Next.js 16** (App Router, Turbopack, TypeScript)
- **Tailwind CSS v4** (CSS-first `@theme` config in `src/app/globals.css`)
- **GSAP + ScrollTrigger** for scroll-driven reveals and camera-like motion
- **Lenis** for smooth scrolling
- Optimized **WebP** art assets (responsive widths, LQIP placeholders)

## Structure

```
src/
  app/
    layout.tsx        Root layout, fonts, SEO metadata
    page.tsx           Section assembly + loading screen orchestration
    globals.css         Design tokens (colors, fonts, keyframes)
    robots.ts / sitemap.ts
  components/
    Navigation.tsx      Floating/transparent nav, mobile menu
    LoadingScreen.tsx    "Entering the Archive" intro sequence
    Hero.tsx             Section I — The Gate (cinematic intro)
    Archive.tsx          Section II — About / education
    Craft.tsx            Section III — Skills, interactive categories
    Work.tsx              Section IV — Project archive list
    ProjectViewer.tsx     Scroll-style project detail modal
    AILab.tsx              Section V — AI Lab, ink-splash motif
    Timeline.tsx           Section VI — Career path
    Certifications.tsx     Section VII — Certifications
    Contact.tsx             Section VIII — Contact
    Footer.tsx
    ParallaxLayer.tsx    Depth-layer primitive (scroll + mouse parallax)
    FloatingElement.tsx  Foreground cutout primitive (feather/lantern/etc.)
    Reveal.tsx            Scroll-triggered fade/rise wrapper
    CustomCursor.tsx      Desktop-only dot + gold ring cursor
    SmoothScroll.tsx      Lenis + GSAP ticker wiring
  data/
    content.ts            Identity, education, skills, timeline, certs
    projects.ts            Project records (Work section)
```

## Content rules

All copy is sourced strictly from the project brief. No fabricated metrics,
clients, or results — see `src/data/content.ts` and `src/data/projects.ts`
for the single source of truth. `socials` in `content.ts` is intentionally
empty until real profile URLs are supplied.

## Assets

Source art lives in `../assets/scene` and `../assets/elements` (project
root, outside this app). `scripts/optimize-images.mjs` converts them into
responsive WebP variants under `public/images/`. Re-run it if source art
changes:

```bash
node scripts/optimize-images.mjs
```

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Accessibility & performance notes

- Respects `prefers-reduced-motion` throughout (parallax, reveals, hero
  intro, custom cursor all degrade to static/instant states).
- Custom cursor and heavy mouse parallax are disabled on coarse
  pointers/touch devices.
- Hero image is `priority`-loaded; all other scene art is lazy and served
  at responsive widths via `next/image`.
- Skip-to-content link, semantic sectioning, alt text on all meaningful
  imagery, focus-visible states on interactive elements.
