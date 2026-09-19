import type { Metadata } from "next";
import Link from "next/link";
import PaperBackground from "@/components/materials/PaperBackground";
import TornEdge from "@/components/materials/TornEdge";
import { Sticker } from "@/components/materials/Sticker";
import Doodle from "@/components/materials/Doodle";
import BookCover from "@/components/materials/BookCover";
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
          <BookCover
            kicker="Lost page"
            blurb={notFound.body}
            href="/"
            showLink={false}
          >
            <div className="flex flex-wrap items-center gap-3">
              <Sticker crayon="oxblood" shape="tag" rotate={-2}>
                {notFound.sticky}
              </Sticker>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-paper/50">
                error 404
              </span>
            </div>
          </BookCover>

          <h1 className="mt-6 font-marker text-[clamp(1.5rem,4vw,2.2rem)] leading-[1.05] text-ink">
            {notFound.heading}
          </h1>

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
