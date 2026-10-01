"use client";

import { useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Archive from "@/components/Archive";
import Craft from "@/components/Craft";
import Work from "@/components/Work";
import AILab from "@/components/AILab";
import Timeline from "@/components/Timeline";
import Certifications from "@/components/Certifications";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-parchment focus:outline focus:outline-1 focus:outline-gold"
      >
        Skip to content
      </a>
      <LoadingScreen onDone={() => setLoaded(true)} />
      <Navigation />
      <main id="main-content">
        <Hero ready={loaded} />
        <Archive />
        <Craft />
        <Work />
        <AILab />
        <Timeline />
        <Certifications />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
