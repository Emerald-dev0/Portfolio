"use client";

/**
 * Projects — one comic strip made of panels.
 *
 * This section reads its content from GitHub: the pinned repos on
 * github.com/Emerald-dev0 are the source of truth for what appears, in what
 * order, with what numbers (see lib/github.ts). `lib/content.ts` supplies the
 * voice for repos it recognises, and curated non-pinned work fills the rest.
 *
 * Filter chips are derived from the technologies that actually repeat across
 * the projects, so they stay honest as the pile grows.
 */

import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";
import ProjectPanel from "@/components/ui/ProjectPanel";
import Doodle from "@/components/materials/Doodle";
import InkBleed from "@/components/motion/InkBleed";
import Chibi from "@/components/motion/Chibi";
import ChibiWalker from "@/components/motion/ChibiWalker";
import { Reveal } from "@/components/motion/Reveal";
import { showcase as copy, type Project } from "@/lib/content";
import { matchesFilter, type Showcase } from "@/lib/projects";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Projects({
  showcase,
  githubUrl,
  login,
}: {
  showcase: Showcase;
  githubUrl: string;
  login: string;
}) {
  const [filter, setFilter] = useState("all");

  const visible = useMemo(
    () => showcase.projects.filter((p: Project) => matchesFilter(p, filter)),
    [showcase.projects, filter],
  );

  const pinnedCount = showcase.pinned.length;

  return (
    <section id="work" className="section-pad relative overflow-hidden">
      {/* someone peeking over the top edge of the section */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-[8%] top-0 hidden text-ink/35 lg:block"
      >
        <Chibi variant="peek" size={54} />
      </span>

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        {/* ---------------- header ---------------- */}
        <div className="flex items-end justify-between gap-4">
          <SectionHeader
            tag={copy.tag}
            sticky={copy.sticky}
            heading={copy.heading}
            scribble="underline"
          />
          <div className="relative mb-1 hidden shrink-0 sm:block">
            <Doodle
              name="arrow-curve"
              size={38}
              className="animate-sway -scale-x-100 text-ink-faint"
            />
            <span className="absolute -top-4 right-9 whitespace-nowrap font-pen text-base text-accent-2">
              {pinnedCount} pinned repos
            </span>
          </div>
        </div>

        {/* ---------------- where this comes from ---------------- */}
        <Reveal dir="up" delay={0.1}>
          <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[10px_7px_11px_8px] border border-ink/15 bg-paper-raised/70 px-3 py-2.5">
            <span className="live-dot" aria-hidden />
            <p className="font-mono text-[11px] leading-relaxed text-ink-muted">
              {copy.livePrefix}{" "}
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline decoration-dotted underline-offset-2"
              >
                github.com/{login}
              </a>
              {copy.liveSuffix}
            </p>
            <span className="ml-auto whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              {showcase.totals.sourceLabel}
              {showcase.totals.generatedLabel ? ` · ${showcase.totals.generatedLabel}` : ""}
            </span>
          </div>
        </Reveal>

        {/* ---------------- filter the pile ---------------- */}
        <div className="mt-7 flex flex-wrap items-center gap-2">
          <span className="mr-1 font-pen text-lg text-ink-faint">
            {copy.filterHint}
          </span>
          {showcase.filters.map((f) => {
            const active = f.id === filter;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] lowercase tracking-wide transition-all duration-200 ${
                  active
                    ? "-translate-y-0.5 border-ink bg-ink text-paper shadow-[0_4px_10px_-6px_rgba(34,32,26,0.7)]"
                    : "border-ink/25 text-ink-muted hover:-translate-y-0.5 hover:border-ink hover:text-ink"
                }`}
              >
                {f.label}
                <span className={active ? "text-marker" : "text-ink-faint"}>
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ---------------- the panels ---------------- */}
        <LayoutGroup>
          <motion.div
            layout
            className="mt-10 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((project, i) => (
                <motion.div
                  key={project.slug}
                  layout
                  initial={{ opacity: 0, y: 22, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.94, filter: "blur(4px)" }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className={project.flagship ? "sm:col-span-2" : ""}
                >
                  <ProjectPanel
                    project={project}
                    index={i + 1}
                    priority={project.flagship}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>

        {visible.length === 0 && (
          <p className="mt-10 text-center font-pen text-xl text-ink-faint">
            Nothing in this pile yet. Give it a week.
          </p>
        )}

        {/* ---------------- the rest of the pile ---------------- */}
        <Reveal dir="up" delay={0.05}>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ink-edge--soft paper-stack group crayon-teal relative mt-14 flex flex-col gap-3 overflow-hidden bg-paper-raised p-6 transition-transform hover:-translate-y-1 md:flex-row md:items-center md:justify-between md:rotate-[-0.4deg] md:hover:rotate-0"
          >
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="sticky-tab">ARCHIVE</span>
                <h3 className="font-marker text-2xl text-ink sm:text-3xl">
                  {copy.archiveHeading(
                    Math.max(showcase.totals.publicRepos - visible.length, 0),
                  )}
                </h3>
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
                <InkBleed>{copy.archiveNote}</InkBleed>
              </p>
            </div>
            <span className="group-hover-crayon relative shrink-0 font-mono text-[12px] uppercase tracking-[0.12em] text-ink transition-transform group-hover:translate-x-1">
              {copy.closing}
              <span
                aria-hidden
                className="absolute -bottom-2 left-0 block h-[3px] w-full -rotate-[0.6deg] bg-accent transition-colors group-hover:bg-[var(--crayon)]"
              />
            </span>
          </a>
        </Reveal>
      </div>

      {/* a wanderer crosses the bottom of the strip */}
      <div className="relative mt-2 h-8">
        <ChibiWalker
          size={44}
          duration={34}
          className="bottom-0"
          colorClass="text-ink/40"
        />
      </div>
    </section>
  );
}
