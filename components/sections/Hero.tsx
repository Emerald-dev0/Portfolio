"use client";

import { motion } from "framer-motion";
import Pill from "@/components/ui/Pill";
import Doodle from "@/components/materials/Doodle";
import Scribble from "@/components/motion/Scribble";
import RotatingText from "@/components/motion/RotatingText";
import AmbientField from "@/components/motion/AmbientField";
import Chibi from "@/components/motion/Chibi";
import { Reveal } from "@/components/motion/Reveal";
import { hero } from "@/lib/content";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Hero. No portrait — type is the composition. Dual identity intro (Daniel /
 * Emerald), a rotating "Building ___" line that continuously rewrites itself,
 * a cycling personality aside, and ambient doodles drifting behind. The first
 * screen should feel alive and unmistakably handcrafted within five seconds.
 */
export default function Hero() {
  return (
    <section
      id="top"
      className="section-pad relative flex min-h-[94svh] items-center overflow-hidden !pt-32"
    >
      {/* ambient background life */}
      <div
        className="animate-breathe halftone pointer-events-none absolute -right-24 top-6 h-[440px] w-[440px] rounded-full"
        style={{
          maskImage: "radial-gradient(circle, black, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle, black, transparent 70%)",
        }}
      />
      <AmbientField
        marks={[
          { name: "star", className: "right-[8%] top-[20%]", size: 26, anim: "drift", delay: 1, color: "text-accent-2/60" },
          { name: "spark", className: "right-[24%] top-[68%]", size: 22, anim: "float", delay: 2, color: "text-accent/50" },
          { name: "rocket", className: "right-[13%] bottom-[10%]", size: 30, anim: "sway", color: "text-ink-faint/45" },
          { name: "brain", className: "left-[2%] top-[58%]", size: 26, anim: "drift", delay: 3, color: "text-ink-faint/35" },
        ]}
      />

      <div className="relative z-10 mx-auto w-full max-w-4xl">
        {/* animated eyebrow */}
        <Reveal dir="up" blur delay={0.05}>
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-ink-faint">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
              aria-hidden
            />
            <RotatingText
              phrases={hero.kickerRotation}
              typeSpeed={45}
              deleteSpeed={22}
              hold={2000}
            />
          </p>
        </Reveal>

        {/* dual-identity intro */}
        <h1 className="mt-5 font-marker text-[clamp(2.5rem,8vw,5.5rem)] leading-[0.98] text-ink">
          <motion.span
            className="inline-block text-[0.55em] font-normal text-ink-muted"
            initial={{ opacity: 0, y: 16, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: -1 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
          >
            {hero.greeting}
          </motion.span>
          <br />
          <span className="relative inline-block">
            <motion.span
              className="relative z-10 inline-block text-accent"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: EASE, delay: 0.3 }}
            >
              {hero.realName}
            </motion.span>
            <Scribble
              preset="underline"
              color="accent"
              delay={1}
              duration={0.7}
              strokeWidth={4}
              className="absolute -bottom-2 left-0 h-3 w-full"
            />
          </span>
        </h1>

        {/* persona line */}
        <Reveal dir="up" delay={0.5}>
          <p className="mt-4 font-pen text-2xl leading-none text-accent-2">
            {hero.personaLine}
          </p>
        </Reveal>

        {/* rotating build line — the continuously-rewriting statement */}
        <Reveal dir="up" delay={0.6}>
          <p className="mt-6 text-[clamp(1.1rem,2.2vw,1.6rem)] font-medium leading-snug text-ink">
            {hero.buildingPrefix}{" "}
            <RotatingText
              phrases={hero.buildingRotation}
              className="text-accent"
              startDelay={1600}
            />
          </p>
        </Reveal>

        {/* favorite line — kept verbatim */}
        <Reveal dir="up" delay={0.7}>
          <p className="mt-3 max-w-lg text-[15px] font-medium leading-relaxed text-ink-muted">
            {hero.tagline}
          </p>
        </Reveal>

        <Reveal dir="up" delay={0.82}>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Pill href="#contact" variant="ink">
              {hero.cta}
            </Pill>
            <span className="flex items-center gap-1.5 font-pen text-lg text-ink-muted">
              {hero.scrollNote}
              <Doodle
                name="arrow-curve"
                size={24}
                className="animate-float text-ink-muted"
              />
            </span>
          </div>
        </Reveal>

        {/* stats */}
        <Reveal dir="up" delay={0.92}>
          <dl className="mt-10 flex flex-wrap items-end gap-x-10 gap-y-3 border-t border-rule/70 pt-5">
            {hero.stats.map((s) => (
              <div key={s.label} className="flex items-baseline gap-2">
                <dt className="font-marker text-2xl text-ink">{s.value}</dt>
                <dd className="max-w-[9rem] font-mono text-[10px] uppercase leading-tight tracking-[0.12em] text-ink-faint">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      {/* handwritten cycling aside — breaks into the right margin (xl+) */}
      <motion.div
        initial={{ opacity: 0, x: 20, rotate: 4 }}
        animate={{ opacity: 1, x: 0, rotate: 3 }}
        transition={{ duration: 0.8, ease: EASE, delay: 1.2 }}
        className="absolute right-6 top-[44%] hidden max-w-[14rem] xl:block"
      >
        <p className="font-pen text-xl leading-tight text-accent-2">
          <RotatingText phrases={hero.personaRotation} startDelay={2400} hold={2200} />
        </p>
        <Doodle
          name="arrow-curve"
          size={34}
          className="animate-float mt-1 -scale-x-100 text-accent-2/70"
        />
      </motion.div>

      {/* a little inhabitant, waving from the bottom-right */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 1.6 }}
        className="pointer-events-none absolute bottom-6 right-[6%] hidden text-ink/70 lg:block"
      >
        <Chibi variant="wave" size={72} title="a little wave hello" />
      </motion.div>
    </section>
  );
}
