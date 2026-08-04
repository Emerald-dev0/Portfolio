"use client";

import { StickyTab } from "@/components/materials/StickyNote";
import { Tape } from "@/components/materials/Tape";
import Doodle from "@/components/materials/Doodle";
import Scribble from "@/components/motion/Scribble";
import AmbientField from "@/components/motion/AmbientField";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { about } from "@/lib/content";

/**
 * About ("Notes"). No photo. A taped-down index card, denser, with the body
 * cascading in line-by-line and the brand pull-quote getting a self-drawing
 * underline. A "short version" spec-sheet sits alongside for rhythm. Ambient
 * doodles drift behind so the section stays alive.
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
        </Reveal>
      </div>
    </section>
  );
}
