import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { hero } from "../../lib/content";
import { Reveal } from "../motion/Reveal";
import { LineReveal } from "../motion/Motion";
import { Magnetic, Parallax, TiltCard } from "../motion/Loud";
import { Button } from "../ui/Button";
import { Doodle } from "../ui/Doodle";
import { Icon } from "../ui/Icon";
import { NowPlaying } from "../ui/NowPlaying";
import { Section } from "../ui/Section";
import { InkPoster } from "../ui/InkPoster";
import { StickerWall } from "./StickerWall";

/**
 * HERO, deliberately off-grid. The name runs at display size across the left
 * seven columns; on the right, three project posters overlap at angles with
 * tape holding them down, and the draggable sticker wall sits on top of them.
 *
 * The posters are real project artwork from /public/projects, so the first
 * thing you see is the work, not an abstract shape.
 */
export function Hero({ commits, repos }: { commits?: number; repos?: number }) {
  return (
    <Section
      id="top"
      overlap={false}
      className="relative overflow-hidden bg-paper"
    >
      {/* Backdrop: halftone wash + oversized marks */}
      <div className="halftone pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-[0.07]" />
      <Doodle
        name="asterisk"
        className="pointer-events-none absolute -right-14 top-28 w-52 muted-soft animate-spin-slow"
        strokeWidth={4}
      />
      <Doodle
        name="spiral"
        className="pointer-events-none absolute -left-10 top-[38%] w-40 text-grape/20"
        strokeWidth={4}
      />

      <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8 lg:pt-36">
        <div className="grid items-start gap-14 lg:grid-cols-12">
          {/* ------------------------------------------------------------ */}
          {/* Left                                                          */}
          {/* ------------------------------------------------------------ */}
          <div className="lg:col-span-7">
            <Reveal>
              <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.18em] muted-soft">
                {hero.location}
              </p>
            </Reveal>

            <Reveal delay={0.06}>
              <LineReveal
                className="mt-4 font-display font-extrabold leading-[0.92] tracking-[-0.03em] text-ink"
                lines={[
                  <span key="a" className="block text-[clamp(2rem,6vw,3.4rem)]">
                    {hero.greeting}
                  </span>,
                  <span
                    key="b"
                    className="relative block text-[clamp(2.6rem,10vw,5.6rem)]"
                  >
                    {hero.headline}
                    <span className="text-tang">.</span>
                  </span>,
                ]}
              />
            </Reveal>

            <Reveal delay={0.14}>
              <div className="mt-7 flex max-w-xl flex-col gap-4 text-[1.02rem] leading-relaxed muted">
                {hero.intro.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.28}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Magnetic>
                  <Button href="/#work" variant="ink">
                    {hero.ctaWork}
                    <Icon icon={ArrowRight01Icon} size={17} />
                  </Button>
                </Magnetic>
                <Magnetic>
                  <Button href="/#contact" variant="leaf">
                    {hero.ctaContact}
                  </Button>
                </Magnetic>
              </div>
            </Reveal>

            <Reveal delay={0.34}>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
                <span className="inline-flex items-center gap-2 text-[0.82rem] muted">
                  <span className="size-2 shrink-0 rounded-full bg-leaf" />
                  {hero.badge}
                </span>
                {repos ? (
                  <span className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] muted-soft">
                    <Icon icon={StarIcon} size={12} />
                    {repos} public repos
                  </span>
                ) : null}
                {commits ? (
                  <span className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] muted-soft">
                    {commits.toLocaleString()} commits
                  </span>
                ) : null}
              </div>
            </Reveal>

            <Reveal delay={0.4}>
              <div className="mt-7 max-w-xs">
                <NowPlaying />
              </div>
            </Reveal>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Right: the poster wall                                        */}
          {/* ------------------------------------------------------------ */}
          <div className="relative mt-2 lg:col-span-5 lg:mt-0">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[320px] sm:max-w-[430px]">
              {/* Poster 1, back */}
              <Parallax distance={26} className="absolute left-0 top-0 w-[62%]">
                <TiltCard max={10}>
                  <figure className="relative">
                    <span
                      className="tape-strip -top-3 left-1/2 w-24 -translate-x-1/2 rotate-[-4deg]"
                      aria-hidden
                    />
                    <div className="aspect-square">
                      <InkPoster
                        index={hero.posters[0].index}
                        name={hero.posters[0].name}
                        role={hero.posters[0].note}
                        crayon={hero.posters[0].crayon}
                      />
                    </div>
                  </figure>
                </TiltCard>
              </Parallax>

              {/* Poster 2, front right */}
              <Parallax
                distance={-34}
                className="absolute right-0 top-[26%] w-[58%]"
              >
                <TiltCard max={12}>
                  <figure className="relative rotate-[4deg]">
                    <div className="aspect-square">
                      <InkPoster
                        index={hero.posters[1].index}
                        name={hero.posters[1].name}
                        role={hero.posters[1].note}
                        crayon={hero.posters[1].crayon}
                      />
                    </div>
                  </figure>
                </TiltCard>
              </Parallax>

              {/* Sticker wall sits on top of the posters */}
              <div className="absolute -bottom-10 left-0 right-0 z-20 origin-top scale-[0.62] sm:-bottom-6 sm:scale-[0.85]">
                <StickerWall compact />
              </div>
            </div>
          </div>
        </div>

        <Reveal delay={0.5}>
          <div className="mt-14 flex flex-wrap items-center gap-4 sm:mt-10">
            <p className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.18em] muted-soft">
              <Icon icon={ArrowDown01Icon} size={15} className="animate-bob" />
              {hero.scrollNote}
            </p>
            <Doodle
              name="arrow"
              className="w-12 rotate-90 text-tang"
              strokeWidth={5}
            />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
