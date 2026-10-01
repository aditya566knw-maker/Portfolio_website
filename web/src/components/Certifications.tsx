import Reveal from "./Reveal";
import { certifications } from "@/data/content";

export default function Certifications() {
  return (
    <section
      id="certifications"
      className="relative w-full overflow-hidden bg-ink py-24 md:py-32"
      aria-label="Certifications"
    >
      <div className="relative z-10 mx-auto max-w-4xl px-6 md:px-10">
        <Reveal>
          <p className="mb-4 font-sans text-xs uppercase tracking-[0.4em] text-gold-soft/80">
            Section VI
          </p>
          <h2 className="font-serif-display text-4xl text-parchment sm:text-5xl">
            Certifications
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {certifications.map((cert, i) => (
            <Reveal key={cert.title} delay={i * 0.1}>
              <div className="group relative border border-gold/15 bg-parchment/[0.02] p-7 transition-colors duration-500 hover:border-gold/40">
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(232,215,181,0.6) 3px, rgba(232,215,181,0.6) 4px)",
                  }}
                  aria-hidden="true"
                />
                <p className="font-sans text-xs uppercase tracking-[0.25em] text-gold-soft/60">
                  {cert.issuer}
                </p>
                <h3 className="mt-3 font-serif-display text-xl text-parchment sm:text-2xl">
                  {cert.title}
                </h3>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
