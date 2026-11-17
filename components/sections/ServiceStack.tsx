"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  AiSparklesIcon,
  CodeIcon,
  Database01Icon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons";
import { services, type Service } from "../../lib/content";
import { Icon } from "../ui/Icon";
import { Doodle } from "../ui/Doodle";

/**
 * SERVICE STACK, the phone and small-tablet "what I do" section.
 * ------------------------------------------------------------------------
 * Four numbered cards that pin to the top of the screen and stack as you
 * scroll: 01 parks, then 02 slides over it, then 03, then 04. Each card is
 * taller than the last screenful so reading it feels like turning a page, and
 * the cards behind shrink slightly and dim, so the deck has real depth.
 *
 * CSS `position: sticky` does the pinning (no scroll listeners, no jank), and
 * framer-motion only handles the depth transform, which is skipped entirely
 * under `prefers-reduced-motion`.
 */

const ICONS: Record<Service["icon"], Parameters<typeof Icon>[0]["icon"]> = {
  code: CodeIcon,
  database: Database01Icon,
  wrench: Wrench01Icon,
  sparkles: AiSparklesIcon,
};

const PLATE: Record<Service["color"], string> = {
  leaf: "bg-leaf text-bone",
  tang: "bg-tang text-night",
  grape: "bg-grape text-bone",
  lagoon: "bg-lagoon text-night",
};

const FACE: Record<Service["color"], string> = {
  leaf: "bg-sage",
  tang: "bg-butter",
  grape: "bg-lilac",
  lagoon: "bg-mist",
};

function StackCard({
  service,
  index,
  total,
}: {
  service: Service;
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // As the row scrolls past, fade and shrink it so the next card reads as
  // being physically on top.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 12%", "end 20%"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.55]);

  return (
    <div
      ref={ref}
      className="sticky mb-4 last:mb-0"
      style={{ top: `calc(var(--stack-top, 84px) + ${index * 12}px)`, zIndex: index + 1 }}
    >
      <motion.article
        style={reduce ? undefined : { scale, opacity }}
        className={`sticker relative overflow-hidden p-0 ${FACE[service.color]}`}
      >
        {/* the number rail: big, hand-set, top left */}
        <div className="flex items-start justify-between gap-3 border-b-[2.5px] border-ink px-5 py-4">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-[2.6rem] font-extrabold leading-none tracking-tight text-ink">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.16em] text-ink/50">
              of {String(total).padStart(2, "0")}
            </span>
          </div>
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-2xl border-2 border-ink ${PLATE[service.color]}`}
          >
            <Icon icon={ICONS[service.icon]} size={21} />
          </span>
        </div>

        <div className="px-5 pb-6 pt-5">
          <h3 className="font-display text-[1.6rem] font-extrabold leading-[1.08] tracking-tight text-ink">
            {service.title}
          </h3>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/75">{service.copy}</p>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {service.chips.map((c) => (
              <span
                key={c}
                className="rounded-full border-[1.5px] border-ink/30 bg-paper/70 px-2.5 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.08em] text-ink/80"
              >
                {c}
              </span>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 border-t border-ink/15 pt-4">
            <Doodle name="squiggle" className="w-7 text-ink/30" strokeWidth={6} />
            <span className="font-mono text-[0.56rem] font-bold uppercase tracking-[0.14em] text-ink/45">
              {index === total - 1 ? "that's the set" : "keep scrolling"}
            </span>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

export function ServiceStack() {
  return (
    <div className="md:hidden [--stack-top:78px]">
      {services.map((s, i) => (
        <StackCard key={s.title} service={s} index={i} total={services.length} />
      ))}
    </div>
  );
}
