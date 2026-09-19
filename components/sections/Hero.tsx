"use client";

import { motion } from "framer-motion";
import Pill from "@/components/ui/Pill";
import { Sticker } from "@/components/materials/Sticker";
import { Tape } from "@/components/materials/Tape";
import Doodle from "@/components/materials/Doodle";
import Scribble from "@/components/motion/Scribble";
import RotatingText from "@/components/motion/RotatingText";
import AmbientField from "@/components/motion/AmbientField";
import { Character, Dog } from "@/components/motion/Chibi";
import { PageHeader } from "@/components/materials/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { hero, insideCover, journal } from "@/lib/content";

const EASE = [0.16, 1, 0.3, 1] as const;

export type HeroLive = {
  /** real numbers, read from GitHub at render time */
  publicRepos: number;
  pinned: number;
  login: string;
  lastPushLabel: string | null;
} | null;

/**
 * Hero — the first page of the notebook.
 *
 * No portrait: type is the composition. A dated journal header up top, the
 * dual-identity intro (Daniel / Emerald), a rotating "Building ___" line that
 * keeps rewriting itself, and a taped index card in the margin holding the
 * page number, the mood, and a figure who is definitely not done yet.
 *
 * The stat row mixes the fixed facts with one live GitHub number, because a
 * portfolio that can read its own stats should.
 */
export default function Hero({ live }: { live?: HeroLive }) {
  return (
    <section
      id="top"
      className="section-pad relative flex min-h-[94svh] items-center overflow-hidden !pt-28"
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

      {/* someone's dog got loose at the bottom of the page */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-6 left-[4%] hidden opacity-70 xl:block"
      >
        <span className="crayon-mustard inline-block animate-sway-body">
          <Dog size={70} />
        </span>
      </span>

      <div className="relative z-10 mx-auto w-full max-w-4xl xl:pr-56">
        {/* the running head of the book, then the date of this entry */}
        <Reveal dir="up" blur={false}>
          <PageHeader
            date={journal.entries.hero.date}
            page={journal.entries.hero.page}
            className="mb-6"
          />
          <p className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-pen text-lg leading-none text-ink-muted">
              {hero.journalLine}
            </span>
            <span className="font-pen text-base leading-none text-accent-2">
              {hero.journalNote}
            </span>
          </p>
        </Reveal>

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

        {/* stats — the fixed facts, plus one the API just told us */}
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

      {/* ---------------- the inside front cover ---------------- */}
      <div className="pointer-events-none absolute inset-0 mx-auto hidden max-w-6xl xl:block">
        <motion.div
          initial={{ opacity: 0, x: 24, rotate: 5 }}
          animate={{ opacity: 1, x: 0, rotate: 2.2 }}
          transition={{ duration: 0.8, ease: EASE, delay: 1.1 }}
          className="pointer-events-auto absolute right-4 top-[20%] w-[15.5rem]"
        >
          <div className="crayon-oxblood relative">
            <div className="ink-edge paper-stack relative bg-paper-raised p-4">
              <Tape
                className="absolute -top-3 left-6 z-10"
                rotate={-7}
                tone="yellow"
                width={76}
              />

              {/* the nameplate */}
              <p className="text-center font-mono text-[9.5px] uppercase tracking-[0.34em] text-ink-faint">
                {insideCover.label}
              </p>
              <p className="mt-1.5 text-center font-marker text-[1.35rem] leading-tight text-ink">
                {insideCover.name}
              </p>
              <p className="text-center font-pen text-lg leading-none text-crayon">
                {insideCover.sub}
              </p>

              <div className="ink-rule my-3 opacity-70" />

              <p className="font-pen text-[1.05rem] leading-snug text-ink-muted">
                {insideCover.warning}
              </p>

              <p className="mt-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.1em] text-ink-faint">
                {insideCover.note}
              </p>

              <div className="mt-3 flex items-end justify-between gap-2">
                <Sticker crayon="oxblood" rotate={-6}>
                  {insideCover.stamp}
                </Sticker>
                <Character id="dash" size={58} />
              </div>
            </div>

            <span aria-hidden className="absolute -bottom-6 -left-5 hidden 2xl:block">
              <Character id="pip" size={52} busy />
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
