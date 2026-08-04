"use client";

import SectionHeader from "@/components/ui/SectionHeader";
import ProjectFile from "@/components/ui/ProjectFile";
import Pill from "@/components/ui/Pill";
import Doodle from "@/components/materials/Doodle";
import AmbientField from "@/components/motion/AmbientField";
import { Reveal } from "@/components/motion/Reveal";
import { featured } from "@/lib/content";

/**
 * Featured Projects — a clean, uniform grid (adapted from Feranmi's work grid):
 * 2 columns on mobile, 3 on desktop, even card heights, generous gutters. Cards
 * alternate their entrance direction (left / right) so scrolling — especially
 * the single mobile column — feels like a woven zigzag rather than a centered
 * stack. Ambient doodles drift behind.
 */
export default function FeaturedProjects() {
  return (
    <section id="work" className="section-pad relative">
      <AmbientField
        marks={[
          { name: "spark", className: "left-[3%] top-[16%]", size: 24, anim: "drift", delay: 2, color: "text-accent/35" },
          { name: "star", className: "right-[3%] top-[46%]", size: 20, anim: "float", delay: 1, color: "text-accent-2/40" },
          { name: "crown", className: "left-[6%] bottom-[10%]", size: 24, anim: "sway", delay: 3, color: "text-ink-faint/35" },
        ]}
      />
      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <div className="flex items-end justify-between gap-4">
          <SectionHeader
            tag={featured.tag}
            sticky={featured.sticky}
            heading={featured.heading}
            scribble="underline"
          />
          <div className="relative mb-1 hidden shrink-0 sm:block">
            <Doodle
              name="arrow-curve"
              size={38}
              className="animate-sway -scale-x-100 text-ink-faint"
            />
            <span className="absolute -top-4 right-9 rotate-[-4deg] whitespace-nowrap font-pen text-base text-accent-2">
              six worth showing
            </span>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.projects.map((project, i) => (
            <Reveal
              key={project.name}
              dir={i % 2 === 0 ? "right" : "left"}
              delay={(i % 3) * 0.08}
              className="h-full"
            >
              <ProjectFile project={project} />
            </Reveal>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Pill href="https://github.com/Emerald-dev0" variant="ink">
            {featured.closing}
          </Pill>
        </div>
      </div>
    </section>
  );
}
