"use client";

import Doodle from "@/components/materials/Doodle";
import Scribble from "@/components/motion/Scribble";
import { Reveal } from "@/components/motion/Reveal";
import { moreProjects } from "@/lib/content";

/**
 * More Projects — a single editorial "torn ticket" pointing to GitHub. No fake
 * placeholder slots; the count is real (20+ builds) and honest.
 */
export default function MoreProjects() {
  return (
    <section id="more" className="section-pad relative !py-16 lg:!py-24">
      <div className="mx-auto w-full max-w-4xl">
        <Reveal dir="up">
          <a
            href={moreProjects.href}
            className="ink-edge--soft paper-stack group relative flex flex-col gap-3 overflow-hidden bg-paper-raised p-6 transition-transform hover:-translate-y-1 md:flex-row md:items-center md:justify-between md:rotate-[-0.4deg] md:hover:rotate-0"
          >
            <div className="max-w-xl">
              <div className="flex items-center gap-3">
                <span className="sticky-tab sticky-tab--purple">
                  {moreProjects.tag}
                </span>
                <h2 className="font-marker text-2xl text-ink sm:text-3xl">
                  {moreProjects.heading}
                </h2>
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
                {moreProjects.note}
              </p>
            </div>
            <span className="relative shrink-0 font-mono text-[12px] uppercase tracking-[0.12em] text-ink transition-transform group-hover:translate-x-1">
              {moreProjects.cta}
              <Scribble
                preset="underline"
                color="accent"
                className="absolute -bottom-2 left-0 h-2 w-full"
              />
            </span>
            <Doodle
              name="arrow-curve"
              size={34}
              className="animate-float absolute right-6 top-4 hidden text-ink-faint md:block"
            />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
