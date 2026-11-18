"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import type { ArchiveProject } from "../../lib/content";
import { site } from "../../lib/config";
import { InkPlate } from "../ui/InkPoster";
import { Icon } from "../ui/Icon";

/**
 * CLOTHESLINE, the archive.
 * ------------------------------------------------------------------------
 * The archive used to be an eight card grid, and a grid of eight is the
 * longest, most generic thing on the page. It is also the least true to what
 * these projects are: side experiments, finished pieces, half-finished ideas,
 * pinned up.
 *
 * So they hang. One line strung across the section, with the pieces pegged to
 * it at slightly different heights and angles, like a developer's washing
 * line. Two rows of it, so eight pieces do not need a huge scroll, and the
 * line sways very slightly as you scroll past, as a real one would.
 *
 * On a phone the line becomes a horizontal rail you drag: you cannot fit eight
 * pegs on a narrow line without them becoming unreadable, so it scrolls
 * sideways with momentum instead. Under `prefers-reduced-motion` the sway and
 * the drag are both off and it is a plain, tidy row.
 */

const ROW_ONE = [0, 1, 2, 3];
const ROW_TWO = [4, 5, 6, 7];

/** Resting angle per peg, so no two hang the same way. */
const ANGLES = [-2.4, 1.8, -1.2, 2.6, 1.4, -2.2, 2.0, -1.6];
/** Resting drop per peg, in px. A real line sags, so heights vary. */
const DROPS = [0, 14, 4, 20, 10, 0, 18, 6];

const CRAYON: Record<ArchiveProject["color"], string> = {
  leaf: "bg-leaf text-bone",
  tang: "bg-tang text-night",
  grape: "bg-grape text-bone",
  lagoon: "bg-lagoon text-night",
};

export function Clothesline({ projects }: { projects: ArchiveProject[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 30, mass: 0.6 });

  // The line sways a couple of degrees as it passes, and the pegs ride with it.
  const sway = useTransform(smooth, [0, 1], [-0.6, 0.6]);

  return (
    <div ref={ref} className="relative">
      {/* Desktop and tablet: two strung rows. */}
      <motion.div style={reduce ? undefined : { rotate: sway }} className="hidden sm:block">
        <Line projects={projects} indices={ROW_ONE} />
        <div className="mt-14">
          <Line projects={projects} indices={ROW_TWO} />
        </div>
      </motion.div>

      {/* Phone: one rail you can throw sideways. */}
      <div className="sm:hidden">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {projects.map((p, i) => (
            <div key={p.name} className="w-[76%] shrink-0 snap-center">
              <Peg project={p} index={i} static />
            </div>
          ))}
        </div>
        <p className="mt-3 font-hand text-xl muted">drag the line to see the rest</p>
      </div>
    </div>
  );
}

/** One strung row: the cord, then the pegs hanging off it. */
function Line({ projects, indices }: { projects: ArchiveProject[]; indices: number[] }) {
  const items = indices.map((i) => ({ project: projects[i], index: i })).filter((x) => x.project);
  if (!items.length) return null;

  return (
    <div className="relative">
      {/* the cord */}
      <div className="relative h-4">
        <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-ink/35" />
        {/* the slack: a shallow sag drawn as a curve, so it is a clothesline and
            not a rule */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 16"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0 8 Q 25 15 50 8 T 100 8"
            fill="none"
            stroke="var(--color-ink)"
            strokeOpacity="0.55"
            strokeWidth="1.4"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <div className="grid grid-cols-4 gap-5 pt-1">
        {items.map(({ project, index }) => (
          <Peg key={project.name} project={project} index={index} />
        ))}
      </div>
    </div>
  );
}

/**
 * One thing on the line. The peg is the pincer at the top, drawn rather than
 * imported, so it matches the rest of the ink vocabulary.
 */
function Peg({
  project: p,
  index,
  static: isStatic = false,
}: {
  project: ArchiveProject;
  index: number;
  static?: boolean;
}) {
  // Same rule as the rest of the site: a repo link is only rendered when there
  // is a repo, and the GitHub origin comes from config, never a literal.
  const url = p.repo ? `${site.github}/${p.repo}` : null;
  const angle = ANGLES[index % ANGLES.length];
  const drop = DROPS[index % DROPS.length];

  return (
    <motion.div
      style={isStatic ? undefined : { y: drop }}
      whileHover={isStatic ? undefined : { y: drop - 6, rotate: `${angle * 0.6}deg` }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group relative origin-top"
    >
      {/* the peg, straddling the cord */}
      <span
        aria-hidden
        className="absolute -top-[13px] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center"
      >
        <span className="block h-[9px] w-[15px] rounded-t-[3px] border-2 border-ink bg-paper" />
        <span className="block h-[6px] w-[10px] border-x-2 border-b-2 border-ink bg-paper" />
      </span>

      {/* the piece, hanging slightly off square */}
      <div style={{ rotate: `${angle}deg` }} className="pt-3">
        <article className="sticker flex h-full flex-col overflow-hidden p-0">
          <div className="relative aspect-[16/11] shrink-0 overflow-hidden border-b-[2.5px] border-ink">
            <InkPlate name={p.name} role={p.stack[0] ?? "project"} crayon={p.color} />
            <span
              className={`absolute left-3 top-3 rounded-full border-2 border-ink px-2.5 py-0.5 font-mono text-[0.55rem] font-bold uppercase tracking-[0.1em] ${CRAYON[p.color]}`}
            >
              {p.status}
            </span>
          </div>

          <div className="flex flex-1 flex-col p-4">
            <h4 className="font-display text-lg font-extrabold leading-tight">{p.name}</h4>
            <p className="mt-1.5 line-clamp-3 text-[0.82rem] leading-relaxed muted">{p.blurb}</p>

            {url || p.liveUrl ? (
              <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-3">
                {p.liveUrl ? (
                  <a
                    href={p.liveUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 font-mono text-[0.58rem] font-bold uppercase tracking-[0.1em] underline decoration-ink/30 underline-offset-4 hover:text-leaf"
                  >
                    Live
                  </a>
                ) : null}
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 font-mono text-[0.58rem] font-bold uppercase tracking-[0.1em] underline decoration-ink/30 underline-offset-4 hover:text-leaf"
                  >
                    Code
                    <Icon icon={ArrowUpRight01Icon} size={11} />
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </article>
      </div>
    </motion.div>
  );
}
