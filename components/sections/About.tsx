"use client";

import { StickyTab } from "@/components/materials/StickyNote";
import { Tape } from "@/components/materials/Tape";
import Doodle from "@/components/materials/Doodle";
import Scribble from "@/components/motion/Scribble";
import AmbientField from "@/components/motion/AmbientField";
import { Character } from "@/components/motion/Chibi";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { about, cast } from "@/lib/content";

/**
 * About ("Notes") — a taped-down index card, denser, with the body cascading in
 * line-by-line and the brand pull-quote getting a self-drawing underline. A
 * "short version" spec-sheet sits alongside for rhythm.
 *
 * Under it: THE CAST. The characters are not decoration with backstories bolted
 * on — each one does a job on this page, so they get introduced the way a comic
 * introduces its crew, drawing first, line underneath.
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
        {/* the note */}
        <div className="relative">
          <div className="mb-4 flex items-center gap-3">
            <StickyTab>{about.tag}</StickyTab>
            <span className="font-mono text-[11px] text-ink-faint">
              {about.noteId}
            </span>
          </div>

          <Reveal dir="up">
            <div className="ink-edge--soft paper-stack relative bg-paper-raised p-5 sm:p-6 md:rotate-[-0.6deg]">
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

        {/* short-version spec sheet (replaces the photo) */}
        <Reveal dir="left" delay={0.15}>
          <div className="crayon-teal relative">
            <div className="ink-edge--soft bg-paper-raised p-5 md:rotate-[0.8deg]">
              <p className="mb-3 font-pen text-2xl text-accent-2">the short version</p>
              <dl className="divide-y divide-rule">
                {facts.map(([k, v]) => (
                  <div key={k} className="flex gap-3 py-2">
                    <dt className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                      {k}
                    </dt>
                    <dd className="text-[13px] text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* one of the crew hanging around the spec sheet */}
            <span aria-hidden className="absolute -bottom-7 -right-4 hidden sm:block">
              <Character id="moss" size={58} busy />
            </span>
          </div>
        </Reveal>
      </div>

      {/* ---------------------- THE CAST ---------------------- */}
      <Reveal dir="up" delay={0.1}>
        <div className="relative z-10 mx-auto mt-16 w-full max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-center gap-3">
              <StickyTab color="purple">{about.castHeading.toUpperCase()}</StickyTab>
              <span className="font-pen text-lg text-accent-2">
                {about.castNote}
              </span>
            </div>
            <span className="page-num">5 REGULARS</span>
          </div>

          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {cast.map((member, i) => (
              <li
                key={member.id}
                className={`crayon-${member.crayon} relative flex flex-col rounded-[8px_5px_9px_6px] border border-ink/15 bg-paper-raised/80 p-3 ${
                  i % 2 ? "rotate-[0.9deg]" : "-rotate-[0.8deg]"
                } transition-transform duration-300 hover:-translate-y-1 hover:rotate-0`}
              >
                {/* the drawing */}
                <div className="flex h-[74px] items-end justify-center text-ink/80">
                  <Character id={member.id} size={member.id === "biscuit" ? 76 : 66} />
                </div>

                <p className="mt-1 font-marker text-lg leading-none text-ink">
                  {member.name}
                </p>
                <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-crayon">
                  {member.role}
                </p>

                <span className="bubble bubble--crayon bubble--up mt-4 w-full text-[15px] leading-snug">
                  {member.line}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
