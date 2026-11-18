"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { featuredProjects } from "../../lib/content";
import { InkPoster } from "../ui/InkPoster";
import { Icon } from "../ui/Icon";

/**
 * PROJECT DECK, scroll driven.
 * ------------------------------------------------------------------------
 * The problem with a plain stacked list is that a thumb flicks and the whole
 * section is gone before a single project registered. So on phones the work
 * section is pinned and becomes a horizontal track: as you scroll down, the
 * projects slide sideways, one after another, and the section only releases
 * when the last one has been through. You physically cannot skip a project.
 *
 * Mechanics:
 *   - the outer wrapper is tall (one screen per project)
 *   - the inner viewport is `sticky top-0 h-svh`, so it holds while you scroll
 *   - the track's x is mapped from scroll progress, spring-smoothed
 *   - each card also counter-rotates slightly, so it reads as sliding in
 *   - the progress rail and the counter fill live below the cards
 *
 * Under `prefers-reduced-motion` this collapses to a normal vertical list with
 * every project fully visible: no pinning, nothing to miss.
 */

const TOTAL = featuredProjects.length;

export function ProjectDeck() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });

  // Slide the track: 0 -> -(TOTAL-1) * 100vw, one screen per card.
  const x = useTransform(smooth, [0, 1], ["0vw", `-${(TOTAL - 1) * 100}vw`]);
  const barWidth = useTransform(smooth, [0, 1], ["12%", "100%"]);

  if (reduce) {
    return (
      <div className="lg:hidden">
        <div className="flex flex-col gap-5">
          {featuredProjects.map((p, i) => (
            <Card key={p.name} project={p} index={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="relative lg:hidden"
      style={{ height: `${TOTAL * 88}svh` }}
      aria-label="Featured projects, scroll to slide through"
    >
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden pb-24">
        {/* progress rail */}
        <div className="px-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.16em] opacity-55">
              Selected work
            </span>
            <span className="h-px flex-1 bg-ink/15" />
            <span className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.16em] opacity-55">
              scroll
            </span>
          </div>
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-ink/12">
            <motion.div className="h-full bg-ink" style={{ width: barWidth }} />
          </div>
        </div>

        {/* the sliding track */}
        <motion.div className="mt-5 flex" style={{ x }}>
          {featuredProjects.map((p, i) => (
            <div key={p.name} className="w-screen shrink-0 px-5">
              <Card project={p} index={i} />
            </div>
          ))}
        </motion.div>

        {/* the count, so the reader knows where they are */}
        <Counter progress={smooth} />
      </div>
    </div>
  );
}

function Card({
  project,
  index,
}: {
  project: (typeof featuredProjects)[number];
  index: number;
}) {
  const p = project;
  return (
    <article className="sticker overflow-hidden p-0">
      <div className="relative aspect-[16/11]">
        <InkPoster index={`0${index + 1}`} name={p.name} role={p.note} crayon={p.color} />
        <span className="absolute right-3 top-3 rounded-full border-2 border-ink bg-paper px-2.5 py-1 font-mono text-[0.55rem] font-bold uppercase tracking-[0.1em]">
          0{index + 1} / 0{TOTAL}
        </span>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border-2 border-ink px-2.5 py-0.5 font-mono text-[0.55rem] font-bold uppercase tracking-[0.1em] text-night ${
              p.color === "leaf" ? "bg-leaf text-bone" : p.color === "grape" ? "bg-grape text-bone" : p.color === "tang" ? "bg-tang" : "bg-lagoon"
            }`}
          >
            {p.status}
          </span>
          <span className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.1em] opacity-55">
            {p.role}
          </span>
        </div>

        <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight">{p.name}</h3>
        <p className="mt-1 font-hand text-xl opacity-70">{p.tagline}</p>
        <p className="mt-2 line-clamp-4 text-[0.9rem] leading-relaxed opacity-80">
          {p.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.stack.slice(0, 4).map((s) => (
            <span key={s} className="chip px-2 py-0.5 text-[0.58rem]">
              {s}
            </span>
          ))}
        </div>

        {p.liveUrl ? (
          <a
            href={p.liveUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold underline decoration-ink/30 underline-offset-4"
          >
            Visit live site
            <Icon icon={ArrowUpRight01Icon} size={14} />
          </a>
        ) : (
          <span className="mt-4 block font-mono text-[0.55rem] font-bold uppercase tracking-[0.1em] opacity-45">
            private codebase
          </span>
        )}
      </div>
    </article>
  );
}

/** The big index counter under the track. */
function Counter({ progress }: { progress: ReturnType<typeof useSpring> }) {
  const label = useTransform(progress, (v) =>
    String(Math.min(TOTAL, Math.max(1, Math.round(v * (TOTAL - 1)) + 1))).padStart(2, "0"),
  );

  return (
    <div className="mt-5 flex items-center justify-between px-5">
      <div className="flex items-baseline gap-1.5">
        <motion.span className="font-display text-[1.6rem] font-extrabold leading-none">
          {label}
        </motion.span>
        <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] opacity-45">
          / 0{TOTAL}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {featuredProjects.map((p) => (
          <span
            key={p.name}
            className="size-1.5 rounded-full border border-ink/40"
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}
