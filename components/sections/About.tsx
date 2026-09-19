"use client";

import { StickyTab } from "@/components/materials/StickyNote";
import { Tape } from "@/components/materials/Tape";
import { PageHeader } from "@/components/materials/PageHeader";
import { Checkbox, FillLine, FoldedCorner } from "@/components/materials/Handwritten";
import Doodle from "@/components/materials/Doodle";
import Scribble from "@/components/motion/Scribble";
import AmbientField from "@/components/motion/AmbientField";
import { Character } from "@/components/motion/Chibi";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { about, journal } from "@/lib/content";

/**
 * About — "Monday, later."
 *
 * Laid out the way a diary page actually is: a taped-in note, a checklist with
 * ticked boxes down the side, and a facts block written as fill-in-the-blank
 * lines on a labelled card — the kind of thing that would be printed inside a
 * notebook's cover. One illustration in the corner, doing nothing in
 * particular, which is the point.
 */
export default function About() {
  const facts: [string, string][] = [
    ["started", "2024, self-taught"],
    ["based", "Osun State, Nigeria"],
    ["studying", "Obafemi Awolowo Univ."],
    ["leans", "MERN + Flutter"],
    ["building", "Blueprint · Contextly"],
    ["backend", "claims to avoid it. doesn't."],
  ];

  /** The things that keep being true, in the order they became true. */
  const learned = [
    "JavaScript, then React, then everything underneath it",
    "Node, Express, MongoDB — the backend I said I'd avoid",
    "Flutter, when something needs to live on a phone",
    "Databases, auth, deployment, and why the build breaks at 2am",
    "AI tooling, MCP, and context layers for agents",
  ];

  return (
    <section id="about" className="section-pad relative">
      <AmbientField
        marks={[
          { name: "star", className: "right-[5%] top-[20%]", size: 22, anim: "drift", delay: 1, color: "text-accent-2/45" },
          { name: "spark", className: "left-[2%] bottom-[16%]", size: 20, anim: "float", delay: 3, color: "text-accent/35" },
          { name: "lightbulb", className: "right-[3%] bottom-[8%]", size: 24, anim: "sway", delay: 2, color: "text-accent/40" },
        ]}
      />
      <div className="relative z-10 mx-auto grid w-full max-w-5xl grid-cols-1 items-start gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
        {/* ---------------- the entry ---------------- */}
        <div className="relative">
          <PageHeader
            date={journal.entries.about.date}
            page={journal.entries.about.page}
          />

          <div className="mb-4 flex items-center gap-3">
            <StickyTab>{about.tag}</StickyTab>
            <span className="font-mono text-[11px] text-ink-faint">
              {about.noteId}
            </span>
          </div>

          <Reveal dir="up">
            <div className="ink-edge--soft paper-stack relative bg-paper-raised p-5 sm:p-6 md:rotate-[-0.6deg]">
              <FoldedCorner size={30} />
              <Tape
                className="absolute -top-3 left-8 z-10"
                rotate={-6}
                tone="yellow"
                width={92}
              />
              <h2 className="font-marker text-[clamp(1.4rem,3vw,2rem)] leading-tight text-ink">
                {about.heading}
              </h2>

              <Stagger className="mt-4 space-y-3 text-[14px] leading-relaxed text-ink-muted">
                {about.body.map((p, i) => (
                  <StaggerItem key={i}>
                    <p>{p}</p>
                  </StaggerItem>
                ))}
              </Stagger>

              <blockquote className="relative mt-5 text-[clamp(1.05rem,2vw,1.4rem)] font-medium leading-snug text-ink">
                &ldquo;{about.pullQuote}&rdquo;
                <Scribble
                  preset="underline"
                  color="accent"
                  delay={0.3}
                  className="absolute -bottom-2 left-0 h-3 w-[92%]"
                />
              </blockquote>

              <Doodle
                name="brain"
                size={30}
                className="animate-float absolute -bottom-2 right-5 text-ink-faint"
              />
            </div>
          </Reveal>
        </div>

        {/* ---------------- the checklist ---------------- */}
        <Reveal dir="left" delay={0.15}>
          <div className="crayon-teal relative">
            <div className="ink-edge--soft paper-stack bg-paper-raised p-5 md:rotate-[0.8deg]">
              <p className="font-marker text-lg leading-none text-ink">
                Things I&rsquo;ve learned so far
              </p>
              <p className="mt-1 font-pen text-lg leading-none text-accent-2">
                (ticked off properly, not just claimed)
              </p>

              <ul className="mt-4 space-y-2.5">
                {learned.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-[1px] shrink-0 text-crayon">
                      <Checkbox size={19} />
                    </span>
                    <span className="text-[13px] leading-snug text-ink">{item}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-4 font-pen text-base leading-snug text-ink-muted">
                Still learning all of it. That part doesn&rsquo;t stop.
              </p>
            </div>

            {/* one illustration loitering on the corner */}
            <span aria-hidden className="absolute -bottom-7 -right-3 hidden sm:block">
              <Character id="moss" size={58} busy />
            </span>
          </div>
        </Reveal>
      </div>

      {/* ---------------- the inside-cover facts plate ---------------- */}
      <Reveal dir="up" delay={0.1}>
        <div className="relative z-10 mx-auto mt-14 w-full max-w-5xl">
          <div className="ink-edge relative bg-paper-raised p-5 sm:p-6 md:rotate-[-0.35deg]">
            <Tape className="absolute -top-3 right-10 z-10" rotate={6} width={78} />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-marker text-lg leading-none text-ink">
                The short version
              </p>
              <span className="page-num">FILLED IN HONESTLY</span>
            </div>

            <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {facts.map(([k, v]) => (
                <div key={k} className="flex items-baseline gap-2">
                  <dt className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                    {k}
                  </dt>
                  <dd className="flex min-w-0 flex-1 items-baseline gap-2">
                    <span className="font-pen text-[1.25rem] leading-none text-ink">
                      {v}
                    </span>
                    <FillLine className="mt-1 h-2 min-w-6 flex-1 text-ink-faint" />
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-5 border-t border-rule pt-3 font-pen text-lg text-accent-2">
              {about.building}
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
