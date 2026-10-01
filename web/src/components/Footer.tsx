"use client";

import { useSyncExternalStore } from "react";

/* Footer — the copyright year (script.js §13) is read from the client
   via useSyncExternalStore so the server renders a stable fallback and
   the real year appears after hydration without an SSR/CSR mismatch or
   a setState-in-effect. */
const emptySubscribe = () => () => {};

export default function Footer() {
  const year = useSyncExternalStore(
    emptySubscribe,
    () => new Date().getFullYear(),
    () => 2026
  );

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <p className="footer-brand">
            INK<span className="text-gold">OF</span>JATAYU
          </p>
          <p className="footer-name">Aditya Singh</p>
          <p className="footer-tagline">Digital Marketing · Analytics · AI</p>
        </div>
        <div className="footer-meta">
          <p className="footer-copyright" id="footer-copyright">
            © {year} Aditya Singh
          </p>
        </div>
      </div>
    </footer>
  );
}
