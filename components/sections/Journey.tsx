"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";
import Doodle from "@/components/materials/Doodle";
import { Tape } from "@/components/materials/Tape";
import { Reveal } from "@/components/motion/Reveal";
import { journey, type Chapter } from "@/lib/content";

/**
 * Journey — the engineer's notebook. Not a flat year list: each era is a page
 * ("chapter") taped onto a spine. A scroll-driven ink line draws down the spine
 * as you read; each chapter settles in with its era tab, narrative, handwritten
 * annotation, milestone checklist, and a doodle that echoes the era. This is
 * the storytelling centerpiece of the page.
 */
export default function Journey() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.6"],
  });
  // the inked spine draws in as the section scrolls through the viewport
  const spineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="journey" className="section-pad relative">
      <div className="mx-auto w-full max-w-4xl">
        <SectionHeader
          tag={journey.tag}
          sticky={journey.sticky}
          heading={journey.heading}
          scribble="underline"
        />

        <div ref={ref} className="relative mt-10 pl-8 sm:pl-12">
          {/* the notebook spine — a scroll-driven inked line */}
          <div
            className="absolute left-[9px] top-2 h-[calc(100%-2rem)] w-[3px] sm:left-[15px]"
            aria-hidden
          >
            <div className="absolute inset-0 rounded-full bg-rule/50" />
            <motion.div
              className="absolute inset-x-0 top-0 origin-top rounded-full bg-ink"
              style={{ scaleY: spineScale, height: "100%" }}
            />
          </div>

          <div className="space-y-6 sm:space-y-8">
            {journey.chapters.map((chapter, i) => (
              <ChapterPage key={chapter.era} chapter={chapter} index={i} />
            ))}
          </div>
        </div>

        {/* stat receipts — pulled from the story */}
        <Reveal dir="up" delay={0.1}>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              { value: "1,600+", label: "commits since Dec 2025" },
              { value: "3", label: "production systems shipped" },
              { value: "20+", label: "full-stack projects built" },
            ].map((s) => (
              <div
                key={s.label}
                className="ink-edge--soft bg-paper-raised p-3 text-center sm:p-4"
              >
                <div className="font-marker text-2xl leading-none text-ink sm:text-3xl">
                  {s.value}
                </div>
                <div className="mt-1.5 font-mono text-[9.5px] uppercase leading-tight tracking-[0.1em] text-ink-faint">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ChapterPage({ chapter, index }: { chapter: Chapter; index: number }) {
  const tilt = index % 2 === 0 ? -0.5 : 0.6;

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 26, rotate: tilt + 1.5 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: false, margin: "-12% 0px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* pin on the spine */}
      <span
        className="absolute -left-8 top-4 z-10 flex h-4 w-4 items-center justify-center rounded-full border-[1.5px] border-ink bg-paper sm:-left-12"
        aria-hidden
      >
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      </span>

      <div
        className={`ink-edge--soft paper-stack relative bg-paper-raised p-5 ${
          chapter.flagship ? "sm:p-6" : ""
        }`}
      >
        <Tape
          className="absolute -top-3 left-6 z-10"
          rotate={index % 2 ? 5 : -5}
          tone={index % 2 ? "yellow" : "neutral"}
          width={72}
        />

        {/* era tab + commit badge */}
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2">
            <span className="sticky-tab">{chapter.era}</span>
            {chapter.flagship && (
              <span className="font-pen text-lg text-accent">the pivot</span>
            )}
          </span>
          {chapter.commits && (
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-accent-2">
              {chapter.commits}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-marker text-xl leading-tight text-ink sm:text-2xl">
              {chapter.title}
            </h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
              {chapter.body}
            </p>
          </div>
          <Doodle
            name={chapter.doodle}
            size={chapter.flagship ? 40 : 32}
            className="mt-1 hidden shrink-0 text-ink-faint sm:block"
          />
        </div>

        {/* milestone / production checklist */}
        {chapter.items && chapter.items.length > 0 && (
          <div className="mt-4">
            {chapter.listLabel && (
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                {chapter.listLabel}
              </p>
            )}
            <ul className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {chapter.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[13px] text-ink"
                >
                  <CheckDoodle />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* handwritten annotation */}
        {chapter.annotation && (
          <p className="mt-4 rotate-[-1deg] font-pen text-lg leading-none text-accent-2">
            {chapter.annotation}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/** tiny hand-drawn check mark */
function CheckDoodle() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="mt-1 shrink-0 text-accent"
      aria-hidden
    >
      <path
        d="M2 7.5 C3.5 8 4.5 9.5 5.5 11 C7 8 9 4.5 12.5 2.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
