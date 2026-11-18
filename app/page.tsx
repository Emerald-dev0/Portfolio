import { Nav } from "../components/sections/Nav";
import { MobileDock } from "../components/sections/MobileDock";
import { ScrollRail } from "../components/motion/Motion";
import { Hero } from "../components/sections/Hero";
import { Marquee } from "../components/sections/Marquee";
import { WhatIDo } from "../components/sections/WhatIDo";
import { Work } from "../components/sections/Work";
import { GithubSection } from "../components/sections/GithubSection";
import { About } from "../components/sections/About";
import { Process } from "../components/sections/Process";
import { Content } from "../components/sections/Content";
import { BlogTeaser } from "../components/sections/BlogTeaser";
import { Contact } from "../components/sections/Contact";
import { Footer } from "../components/sections/Footer";
import { PosterStrip } from "../components/ui/PosterStrip";
import { NowPlayingBand } from "../components/sections/NowPlayingBand";
import { getGithubSnapshot } from "../lib/github";
import type { Metadata } from "next";
import { site } from "../lib/config";

/**
 * The home page inherits the root metadata, but states its own canonical so a
 * crawler that lands on a query string variant (?utm_source=...) still folds
 * every copy into one URL rather than indexing them separately.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: `${site.name}, Backend Developer and Computer Science Student`,
  openGraph: {
    title: `${site.name}, Backend Developer`,
    description:
      "Developer tools, web apps and honest build logs from a backend developer in Ile-Ife, Nigeria.",
    url: "/",
    type: "website",
  },
};

/**
 * HOME, the full wall, top to bottom:
 *
 *   hero (poster stack + draggable stickers)
 *   ink marquee
 *   what I do
 *   poster strip  ← the loud break
 *   work (four oversized panels + archive)
 *   github wall
 *   about (with the live Spotify sticker)
 *   process
 *   content
 *   blog teaser
 *   contact
 *   footer (the terminal)
 *
 * Motion: a reading rail across the top, masked line reveals on every
 * headline, panels that lean as they pass, a marquee that follows the scroll
 * direction, counting stats, and (below lg) a swipeable project deck plus a
 * thumb-zone dock.
 *
 * GitHub data is read server-side with a committed snapshot as the floor, so
 * the page never renders a ", " where a number should be.
 */
export const revalidate = 10800;

export default async function HomePage() {
  const snapshot = await getGithubSnapshot();
  const commits = snapshot.stats?.commitsPinned ?? snapshot.contributions?.total;

  return (
    <>
      <ScrollRail />
      <Nav />
      <main id="main">
        <Hero commits={commits} repos={snapshot.user?.publicRepos} />
        <Marquee />
        <WhatIDo />
        <PosterStrip />
        <Work snapshot={snapshot} />
        <GithubSection snapshot={snapshot} />
        <About />
        <NowPlayingBand />
        <Process />
        <Content />
        <BlogTeaser />
        <Contact />
      </main>
      <Footer />
      <MobileDock />
    </>
  );
}
