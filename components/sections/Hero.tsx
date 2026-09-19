"use client";

import { motion } from "framer-motion";
import Pill from "@/components/ui/Pill";
import Doodle from "@/components/materials/Doodle";
import Scribble from "@/components/motion/Scribble";
import RotatingText from "@/components/motion/RotatingText";
import AmbientField from "@/components/motion/AmbientField";
import { Character } from "@/components/motion/Chibi";
import { Reveal } from "@/components/motion/Reveal";
import { hero } from "@/lib/content";

const EASE = [0.16, 1, 0.3, 1] as const;

export type HeroLive = {
  /** real numbers, read from GitHub at render time */
  publicRepos: number;
  pinned: number;
  login: string;
  lastPushLabel: string | null;
} | null;

/**
 * Hero. No portrait: type is the composition. Dual-identity intro (Daniel /
 * Emerald), a rotating "Building ___" line that keeps rewriting itself, one
 * live number from GitHub, and ambient doodles drifting behind.
 *
 * The stat row mixes the fixed facts with a figure the API just told us,
 * because a portfolio that can read its own stats should.
 */
export default function Hero({ live }: { live?: HeroLive }) {
  return (
    <section
      id="top"
      className="section-pad relative flex min-h-[92svh] items-center overflow-hidden !pt-32"
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

        {/* rotating build line, the continuously-rewriting statement */}
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

        <Reveal dir="up" delay={0.7}>
          <p className="mt-3 max-w-lg text-[15px] font-medium leading-relaxed text-ink-muted">
            {hero.tagline}
          </p>
        </Reveal>

        <Reveal dir="up" delay={0.82}>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Pill href="#work" variant="ink">
              {hero.ctaWork}
            </Pill>
            <Pill href="#contact" variant="paper">
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

        {/* stats: the fixed facts, plus one the API just told us */}
        <Reveal dir="up" delay={0.92}>
          <dl className="mt-10 flex flex-wrap items-end gap-x-9 gap-y-4 border-t border-rule/70 pt-5">
            {hero.stats.map((s) => (
              <div key={s.label} className="flex items-baseline gap-2">
                <dt className="font-marker text-2xl text-ink">{s.value}</dt>
                <dd className="max-w-[9rem] font-mono text-[10px] uppercase leading-tight tracking-[0.12em] text-ink-faint">
                  {s.label}
                </dd>
              </div>
            ))}

            {live && (
              <div className="flex items-baseline gap-2">
                <dt className="flex items-center gap-2 font-marker text-2xl text-ink">
                  {live.publicRepos}
                  <span className="live-dot" aria-hidden />
                </dt>
                <dd className="max-w-[10rem] font-mono text-[10px] uppercase leading-tight tracking-[0.12em] text-ink-faint">
                  public repos on GitHub
                  {live.lastPushLabel ? ` · last push ${live.lastPushLabel}` : ""}
                </dd>
              </div>
            )}
          </dl>
        </Reveal>
      </div>

      {/* one ink figure, low and out of the way */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 1.5 }}
        className="pointer-events-none absolute bottom-10 right-[7%] hidden text-ink/60 lg:block"
      >
        <Character id="dash" size={68} />
      </motion.div>
    </section>
  );
}
