import { identity, socials } from "@/data/content";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full border-t border-gold/10 bg-ink px-6 py-12 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
        <div>
          <p className="font-serif-display text-lg tracking-[0.15em] text-parchment">
            INK<span className="text-gold">OF</span>JATAYU
          </p>
          <p className="mt-1 font-sans text-xs uppercase tracking-[0.15em] text-parchment/50">
            {identity.name}
          </p>
          <p className="mt-1 font-sans text-xs text-parchment/35">
            Digital Marketing · Analytics · AI
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:items-end">
          {socials.length > 0 && (
            <div className="flex items-center gap-5">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-gold cursor-hover font-sans text-xs uppercase tracking-[0.15em] text-parchment/50 hover:text-gold-soft"
                >
                  {social.label}
                </a>
              ))}
            </div>
          )}
          <p className="font-sans text-xs text-parchment/30">
            © {year} {identity.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
