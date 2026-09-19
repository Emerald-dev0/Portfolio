import PaperBackground from "@/components/materials/PaperBackground";
import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import ComicStrip from "@/components/sections/ComicStrip";
import Projects from "@/components/sections/Projects";
import Receipts from "@/components/sections/Receipts";
import LogoMarquee from "@/components/sections/LogoMarquee";
import WhatIDo from "@/components/sections/WhatIDo";
import Journey from "@/components/sections/Journey";
// import Testimonials from "@/components/sections/Testimonials"; // ← uncomment when real quotes exist
import Connect from "@/components/sections/Connect";
import Footer from "@/components/sections/Footer";
import { getGithubSnapshot } from "@/lib/github";
import { buildShowcase } from "@/lib/projects";

/**
 * The desk. A single continuous paper surface, separated by generous
 * whitespace rather than hard rules.
 *
 * This is a server component, which is the whole trick: the GitHub read
 * happens here, before the page is rendered, and the result is passed down as
 * plain props. The page is prerendered, then quietly re-rendered every
 * REVALIDATE_SECONDS with whatever is pinned on GitHub at that moment. No
 * client-side loading spinner, no API key in the browser, no build required
 * to unpin something.
 *
 * Extra bottom padding on mobile clears the fixed bottom nav dock.
 */
// Literal on purpose: Next reads this value statically, so it can't be an
// imported identifier. Keep it in step with REVALIDATE_SECONDS in lib/github.ts.
export const revalidate = 10800; // 3 hours

export default async function Home() {
  const snapshot = await getGithubSnapshot();
  const showcase = buildShowcase(snapshot);
  const githubUrl = `https://github.com/${snapshot.user.login}`;

  return (
    <>
      <Nav />
      <PaperBackground ruled marginRule className="relative z-10">
        <main className="pb-24 sm:pb-0">
          <Hero
            live={{
              publicRepos: snapshot.user.publicRepos,
              pinned: showcase.totals.pinned,
              login: snapshot.user.login,
              lastPushLabel: showcase.totals.lastPushLabel,
            }}
          />
          <About />
          <Projects showcase={showcase} githubUrl={githubUrl} login={snapshot.user.login} />
          <Receipts showcase={showcase} />
          <ComicStrip />
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
