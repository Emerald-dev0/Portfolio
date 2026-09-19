import type { Metadata } from "next";
import Link from "next/link";
import PaperBackground from "@/components/materials/PaperBackground";
import TornEdge from "@/components/materials/TornEdge";
import { Sticker } from "@/components/materials/Sticker";
import Doodle from "@/components/materials/Doodle";
import { Character } from "@/components/motion/Chibi";
import { notFound } from "@/lib/content";

export const metadata: Metadata = {
  title: "Lost page — Daniel Oluwadare",
  robots: { index: false, follow: true },
};

/**
 * 404 — a page that fell out of the notebook. Same paper, same cast, one very
 * apologetic dog.
 */
export default function NotFound() {
  return (
    <>
      <PaperBackground ruled marginRule className="relative z-10 min-h-[86svh]">
        <main className="relative mx-auto flex min-h-[86svh] w-full max-w-2xl flex-col justify-center px-6 py-24">
          <div className="flex items-center gap-3">
            <Sticker crayon="oxblood" shape="tag">
              {notFound.sticky}
            </Sticker>
            <span className="page-num">ERROR 404</span>
          </div>

          <h1 className="mt-4 font-marker text-[clamp(2rem,6vw,3.4rem)] leading-[1.02] text-ink">
            {notFound.heading}
          </h1>

          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-muted">
            {notFound.body}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              href="/"
              className="pill pill--ink"
            >
              {notFound.cta}
              <span className="pill-arrow">→</span>
            </Link>
            <span className="flex items-center gap-2 font-pen text-lg text-accent-2">
              <Doodle name="arrow-curve" size={26} className="animate-float -scale-x-100" />
              {notFound.margin}
            </span>
          </div>

          {/* the dog, who is not sorry, on the corner of the page */}
          <span aria-hidden className="mt-12 block">
            <span className="crayon-mustard inline-block -rotate-2">
              <Character id="biscuit" size={92} />
            </span>
          </span>
        </main>
      </PaperBackground>
      <TornEdge fill="var(--color-ink)" />
      <div className="bg-ink px-6 py-8 text-center">
        <p className="font-mono text-[12px] text-paper/50">
          © {new Date().getFullYear()} Daniel Oluwadare
        </p>
      </div>
    </>
  );
}
