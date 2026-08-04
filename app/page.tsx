import PaperBackground from "@/components/materials/PaperBackground";
import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import FeaturedProjects from "@/components/sections/FeaturedProjects";
import MoreProjects from "@/components/sections/MoreProjects";
import LogoMarquee from "@/components/sections/LogoMarquee";
import WhatIDo from "@/components/sections/WhatIDo";
import Journey from "@/components/sections/Journey";
// import Testimonials from "@/components/sections/Testimonials"; // ← uncomment when real quotes exist
import Connect from "@/components/sections/Connect";
import Footer from "@/components/sections/Footer";

/**
 * The desk. A single continuous paper surface, separated by generous
 * whitespace rather than hard rules. The scrolling LogoMarquee is the "stack"
 * moment (replacing a separate grouped tech list to keep the page breathing).
 * Extra bottom padding on mobile clears the fixed bottom nav dock.
 */
export default function Home() {
  return (
    <>
      <Nav />
      <PaperBackground ruled marginRule className="relative z-10">
        <main className="pb-24 sm:pb-0">
          <Hero />
          <About />
          <FeaturedProjects />
          <MoreProjects />
          <LogoMarquee />
          <WhatIDo />
          <Journey />
          <Connect />
        </main>
      </PaperBackground>
      <Footer />
    </>
  );
}
