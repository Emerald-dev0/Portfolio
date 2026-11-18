"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { featuredProjects } from "../../lib/content";
import { InkPoster } from "../ui/InkPoster";
import { Icon } from "../ui/Icon";

/**
 * PROJECT DECK, four cards dealt one at a time.
 * ------------------------------------------------------------------------
 * The old version slid every card sideways as you scrolled, so each project
 * was in frame for less than a screen and a thumb flick skipped two of them.
 *
 * This one deals. The section pins, then each card arrives on its own beat:
 * it rises and straightens from a slight tilt, lands on the pile, and the card
 * underneath it settles back and dims. Nothing leaves the screen. By the end
 * you are looking at four cards fanned into a pile you built yourself, which
 * is the shuffle he asked for, and only then does the page move on.
 *
 * Mechanics:
 *   - the wrapper is tall, one slice of scroll per card plus a settling slice
 *   - the inner viewport is `sticky top-0`, so it holds while you scroll
 *   - card i arrives over a slice of progress, then holds still
 *   - cards that have arrived recede instead of disappearing
 *
 * Rendered once, used at every width. Under `prefers-reduced-motion` it
 * collapses to a plain list with every project fully readable.
 */

const TOTAL = featuredProjects.length;

/**
 * One slice of scroll per card, so the section is exactly four screens: long
 * enough to give each project a beat, short enough that scrolling through the
 * work section does not feel like a chore. The final slice doubles as the
 * moment the finished pile settles.
 */
const SLICES = TOTAL;

export function ProjectDeck({ wide = false }: { wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.5 });
  const railWidth = useTransform(smooth, [0, 1], ["8%", "100%"]);

  if (reduce) {
    return (
      <div className="flex flex-col gap-5">
        {featuredProjects.map((p, i) => (
          <div key={p.name} className="mx-auto w-full max-w-2xl">
            <Card project={p} index={i} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="relative"
      style={{ height: `${SLICES * 100}svh` }}
      aria-label="Featured projects, scroll to deal through them"
    >
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        {/* the rail: where you are in the deal */}
        <div className="mx-auto w-full max-w-2xl px-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.16em] muted-soft">
              Selected work
            </span>
            <span className="h-px flex-1 bg-ink/15" />
            <Counter progress={smooth} />
          </div>
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-ink/12">
            <motion.div className="h-full bg-ink" style={{ width: railWidth }} />
          </div>
        </div>

        {/* the pile. Cards are absolutely placed on top of each other and
            arrive by transform, so the layout never shifts. */}
        <div className={`relative mx-auto mt-6 w-full px-5 ${wide ? "max-w-5xl" : "max-w-2xl"}`}>
          <div className={`relative ${wide ? "h-[clamp(460px,60svh,580px)]" : "h-[clamp(430px,58svh,560px)]"}`}>
            {featuredProjects.map((p, i) => (
              <DealtCard key={p.name} project={p} index={i} progress={smooth} wide={wide} />
            ))}
          </div>
        </div>

        <p className="mx-auto mt-5 w-full max-w-2xl px-5 font-hand text-xl muted">
          {`scroll, ${TOTAL} cards to go through`}
        </p>
      </div>
    </div>
  );
}

/**
 * One card in the pile.
 *
 * The deal for card `i` happens across the progress window that starts one
 * slice in, so card 1 is already there when you arrive and card 4 is last to
 * land. After landing, the card recedes: it drops back a touch, rotates into
 * the pile, and dims, but it never leaves, so the pile visibly grows.
 */
function DealtCard({
  project,
  index,
  progress,
  wide,
}: {
  project: (typeof featuredProjects)[number];
  index: number;
  progress: ReturnType<typeof useSpring>;
  wide: boolean;
}) {
  // Card 1 is already on the table when you arrive. Each later card is dealt
  // on its own beat, then holds while the next one comes over.
  const arrive = index === 0 ? 0 : index / TOTAL;
  const start = Math.max(0, arrive - 0.9 / TOTAL);
  const settle = Math.min(1, arrive + 1.4 / TOTAL);

  const y = useTransform(progress, [start, arrive, settle], index === 0 ? ["0%", "0%", "0%"] : ["115%", "0%", "-4%"]);
  const rotate = useTransform(
    progress,
    [start, arrive, settle],
    index === 0 ? [0, 0, -1.2] : [7, 0, index % 2 === 0 ? 1.4 : -1.4],
  );
  const scale = useTransform(progress, [arrive, settle], [1, 1 - (TOTAL - index) * 0.012]);
  const opacity = useTransform(progress, [arrive, settle], [1, 0.92]);

  // Stacking order: later cards sit on top of earlier ones, as in a real deal.
  const zIndex = 10 + index;

  return (
    <motion.div
      style={{ y, rotate, scale, opacity, zIndex }}
      className="absolute inset-0"
    >
      <Card project={project} index={index} wide={wide} />
    </motion.div>
  );
}

function Card({
  project,
  index,
  wide = false,
}: {
  project: (typeof featuredProjects)[number];
  index: number;
  wide?: boolean;
}) {
  const p = project;
  return (
    <article
      className={`sticker flex h-full overflow-hidden p-0 ${
        wide ? "flex-row" : "flex-col"
      }`}
    >
      <div
        className={`relative shrink-0 ${
          wide ? "w-[46%] border-r-[2.5px] border-ink" : "aspect-[16/9]"
        }`}
      >
        <InkPoster index={`0${index + 1}`} name={p.name} role={p.note} crayon={p.color} />
        <span className="absolute right-3 top-3 rounded-full border-2 border-ink bg-paper px-2.5 py-1 font-mono text-[0.55rem] font-bold uppercase tracking-[0.1em]">
          0{index + 1} / 0{TOTAL}
        </span>
      </div>

      <div className={`flex flex-1 flex-col ${wide ? "justify-center p-8" : "p-5"}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border-2 border-ink px-2.5 py-0.5 font-mono text-[0.55rem] font-bold uppercase tracking-[0.1em] text-night ${
              p.color === "leaf" ? "bg-leaf text-bone" : p.color === "grape" ? "bg-grape text-bone" : p.color === "tang" ? "bg-tang" : "bg-lagoon"
            }`}
          >
            {p.status}
          </span>
          <span className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.1em] muted-soft">
            {p.role}
          </span>
        </div>

        <h3
          className={`mt-2.5 font-display font-extrabold leading-tight ${
            wide ? "text-[2.4rem]" : "text-2xl"
          }`}
        >
          {p.name}
        </h3>
        <p className="mt-1 font-hand text-xl muted">{p.tagline}</p>
        <p
          className={`mt-2 leading-relaxed muted ${
            wide ? "line-clamp-5 text-[1rem]" : "line-clamp-3 text-[0.9rem]"
          }`}
        >
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
            className="mt-auto inline-flex w-fit items-center gap-1.5 pt-3 text-sm font-bold underline decoration-ink/30 underline-offset-4"
          >
            Visit live site
            <Icon icon={ArrowUpRight01Icon} size={14} />
          </a>
        ) : (
          <span className="mt-auto block pt-3 font-mono text-[0.55rem] font-bold uppercase tracking-[0.1em] muted-soft">
            private codebase
          </span>
        )}
      </div>
    </article>
  );
}

/** Which card you are looking at, as it lands. */
function Counter({ progress }: { progress: ReturnType<typeof useSpring> }) {
  // Shows the number of the card that has landed, not the one arriving.
  const label = useTransform(progress, (v) =>
    String(Math.min(TOTAL, Math.max(1, Math.floor(v * TOTAL) + 1))).padStart(2, "0"),
  );

  return (
    <span className="flex items-baseline gap-1 font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em]">
      <motion.span className="text-[0.9rem]">{label}</motion.span>
      <span className="muted-soft">/ 0{TOTAL}</span>
    </span>
  );
}
