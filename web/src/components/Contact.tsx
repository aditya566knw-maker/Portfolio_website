import Reveal from "./Reveal";
import ParallaxLayer from "./ParallaxLayer";
import FloatingElement from "./FloatingElement";
import { identity, socials } from "@/data/content";

export default function Contact() {
  return (
    <section
      id="contact"
      className="relative flex min-h-[90vh] w-full items-center overflow-hidden bg-ink py-28"
      aria-label="Contact"
    >
      <ParallaxLayer
        src="/images/scene/moonlit-garden-1920.webp"
        alt="A quiet moonlit pavilion beside a still lake, lantern light reflected in the water"
        speed={-0.5}
        mouseStrength={5}
        className="opacity-45"
        quality={70}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/60 to-ink" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/50" />

      <FloatingElement
        src="/images/elements/lantern-480.webp"
        alt=""
        widthClass="w-24 sm:w-32 md:w-40"
        className="right-[8%] top-0"
        motion="sway"
      />

      <div className="relative z-10 mx-auto w-full max-w-3xl px-6 text-center md:px-10">
        <Reveal>
          <p className="mb-6 font-sans text-xs uppercase tracking-[0.4em] text-gold-soft/80">
            Section VII
          </p>
          <h2 className="font-serif-display text-4xl leading-tight text-parchment text-balance sm:text-5xl md:text-6xl">
            The story doesn&rsquo;t end here.
          </h2>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mx-auto mt-6 max-w-md font-serif-display text-xl italic text-parchment/60">
            Have an idea worth building?
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-12 flex flex-col items-center gap-6">
            <a
              href={`mailto:${identity.email}`}
              className="cursor-hover group relative overflow-hidden border border-gold/50 px-10 py-4 font-sans text-xs uppercase tracking-[0.3em] text-parchment transition-colors duration-500 hover:border-gold"
            >
              <span className="relative z-10 transition-colors duration-500 group-hover:text-ink">
                Let&rsquo;s Talk
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gold transition-transform duration-500 ease-out group-hover:translate-x-0" />
            </a>

            <a
              href={`mailto:${identity.email}`}
              className="link-gold cursor-hover font-sans text-sm text-parchment/60 hover:text-gold-soft"
            >
              {identity.email}
            </a>

            {socials.length > 0 && (
              <div className="mt-2 flex items-center gap-6">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-gold cursor-hover font-sans text-xs uppercase tracking-[0.2em] text-parchment/50 hover:text-gold-soft"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
