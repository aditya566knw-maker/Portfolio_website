// One-off script to convert source PNG art into optimized WebP assets.
// Run with: node scripts/optimize-images.mjs
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "..");
const SRC_SCENE = path.join(ROOT, "assets", "scene");
const SRC_ELEMENTS = path.join(ROOT, "assets", "elements");
const OUT_SCENE = path.join(process.cwd(), "public", "images", "scene");
const OUT_ELEMENTS = path.join(process.cwd(), "public", "images", "elements");

fs.mkdirSync(OUT_SCENE, { recursive: true });
fs.mkdirSync(OUT_ELEMENTS, { recursive: true });

// Full-bleed environment scenes — large, become the hero/section backgrounds.
const scenes = [
  { file: "hero.png.png", name: "gate" },
  { file: "about.png.png", name: "archive-lake" },
  { file: "SKILLS.png.png", name: "study" }, // interior study/workspace -> used in Archive section
  { file: "project.png.png", name: "library" }, // grand library -> Work section
  { file: "contact.png.png", name: "moonlit-garden" },
];

// Foreground/midground cutout elements — transparent PNGs, kept smaller.
const elements = [
  { file: "feather.png.png", name: "feather" },
  { file: "ink-splash.png.png", name: "ink-splash" },
  { file: "scroll.png.png", name: "scroll" },
  { file: "botanical.png.png", name: "botanical" },
  { file: "lantern.png.png", name: "lantern" },
];

const sceneWidths = [720, 1280, 1920];
const elementWidths = [480, 900];

async function run() {
  for (const s of scenes) {
    const input = path.join(SRC_SCENE, s.file);
    if (!fs.existsSync(input)) {
      console.warn("MISSING", input);
      continue;
    }
    for (const w of sceneWidths) {
      const out = path.join(OUT_SCENE, `${s.name}-${w}.webp`);
      await sharp(input)
        .resize({ width: w })
        .webp({ quality: 78 })
        .toFile(out);
      console.log("wrote", out);
    }
    // Also a small blurred placeholder for LQIP
    await sharp(input)
      .resize({ width: 32 })
      .webp({ quality: 40 })
      .toFile(path.join(OUT_SCENE, `${s.name}-placeholder.webp`));
  }

  for (const e of elements) {
    const input = path.join(SRC_ELEMENTS, e.file);
    if (!fs.existsSync(input)) {
      console.warn("MISSING", input);
      continue;
    }
    for (const w of elementWidths) {
      const out = path.join(OUT_ELEMENTS, `${e.name}-${w}.webp`);
      await sharp(input)
        .resize({ width: w })
        .webp({ quality: 85 })
        .toFile(out);
      console.log("wrote", out);
    }
  }

  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
