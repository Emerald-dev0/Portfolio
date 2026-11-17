"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { featuredProjects } from "../../lib/content";
import { InkPoster } from "../ui/InkPoster";

/**
 * PROJECT DECK, the mobile work section.
 * ------------------------------------------------------------------------
 * On a phone a four-panel alternating layout is just a long column, which is
 * the definition of generic. This is a deck of cards instead: one project per
 * card, big drawn poster, swipe or tap the next card to bring it forward. The
 * cards behind peek out so it is obvious they are stacked, and the whole thing
 * responds to a thumb.
 *
 * Swiping is pointer based, so it works with touch and with a trackpad. The
 * desktop layout is untouched: this only renders below `lg`.
 */
export function ProjectDeck() {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const startX = useRef<number | null>(null);
  const total = featuredProjects.length;

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + total) % total);

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
    startX.current = null;
  };

  return (
    <div className="lg:hidden">
      <div
        className="relative h-[560px] select-none"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {featuredProjects.map((p, i) => {
          const rel = (i - index + total) % total;
          const isTop = rel === 0;
          return (
            <motion.article
              key={p.name}
              aria-hidden={!isTop}
              className="absolute inset-x-0 top-0"
              animate={
                reduce
                  ? { opacity: isTop ? 1 : 0, zIndex: total - rel }
                  : {
                      y: rel * 12,
                      scale: 1 - rel * 0.035,
                      rotate: rel === 0 ? 0 : rel % 2 ? 1.2 : -1.2,
                      opacity: rel > 2 ? 0 : 1,
                      zIndex: total - rel,
                    }
              }
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              style={{ pointerEvents: isTop ? "auto" : "none" }}
            >
              <div className="sticker overflow-hidden p-0">
                <div className="relative aspect-[16/11]">
                  <InkPoster
                    index={`0${i + 1}`}
                    name={p.name}
                    role={p.note}
                    crayon={p.color}
                  />
                  <span className="absolute right-3 top-3 rounded-full border-2 border-ink bg-paper px-2.5 py-1 font-mono text-[0.55rem] font-bold uppercase tracking-[0.1em]">
                    0{i + 1} / 0{total}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full border-2 border-ink px-2.5 py-0.5 font-mono text-[0.55rem] font-bold uppercase tracking-[0.1em] text-night ${
                        p.color === "leaf"
                          ? "bg-leaf text-bone"
                          : p.color === "grape"
                            ? "bg-grape text-bone"
                            : p.color === "tang"
                              ? "bg-tang"
                              : "bg-lagoon"
                      }`}
                    >
                      {p.status}
                    </span>
                    <span className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.1em] opacity-55">
                      {p.role}
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight">
                    {p.name}
                  </h3>
                  <p className="mt-1 font-hand text-xl opacity-70">
                    {p.tagline}
                  </p>
                  <p className="mt-2 line-clamp-4 text-[0.9rem] leading-relaxed opacity-80">
                    {p.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.stack.slice(0, 4).map((s) => (
                      <span key={s} className="chip px-2 py-0.5 text-[0.58rem]">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-4">
                    {p.liveUrl ? (
                      <a
                        href={p.liveUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-sm font-bold underline underline-offset-4"
                      >
                        Visit live site
                      </a>
                    ) : null}
                    <span className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.12em] opacity-45">
                      swipe for the next
                    </span>
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* Deck controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {featuredProjects.map((p, i) => (
            <button
              key={p.name}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${p.name}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full border-2 border-ink transition-all ${
                i === index ? "w-7 bg-ink" : "w-1.5 bg-transparent"
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous project"
            className="grid size-10 place-items-center rounded-full border-[2.5px] border-ink bg-paper shadow-[3px_3px_0_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next project"
            className="grid size-10 place-items-center rounded-full border-[2.5px] border-ink bg-tang shadow-[3px_3px_0_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
