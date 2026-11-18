"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Doodle } from "../ui/Doodle";

/**
 * STICKER WALL, the grab-and-throw moment. A cluster of stickers pinned to an
 * invisible board: the build card, "on the bench", ship-it, commits, the role
 * badge. Drag is constrained to the board and each sticker keeps its resting
 * angle after being moved.
 *
 * `compact` trims the layout to the four stickers that fit inside the hero,
 * where the wall overlaps the poster stack.
 */
export function StickerWall({ compact = false }: { compact?: boolean }) {
  const boardRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const draggable = !reduce;

  const dragProps = {
    drag: draggable,
    dragConstraints: boardRef,
    dragElastic: 0.1,
    dragMomentum: false,
    whileDrag: { scale: 1.06, zIndex: 50, rotate: 0 },
    whileHover: draggable ? { scale: 1.02 } : undefined,
  } as const;

  return (
    <div
      ref={boardRef}
      className={`relative ${compact ? "h-[330px]" : "h-[430px] sm:h-[470px] lg:h-[560px]"}`}
      aria-label="A wall of stickers about Emerald. Try dragging them."
    >
      {!compact ? (
        <>
          <Doodle
            name="asterisk"
            className="absolute right-6 top-2 w-12 text-tang animate-spin-slow"
            strokeWidth={5}
          />
          <Doodle
            name="spark"
            className="absolute bottom-40 left-2 w-8 text-grape animate-float"
            strokeWidth={5}
          />
        </>
      ) : null}

      <p className="absolute -top-3 right-0 rotate-[3deg] font-hand text-xl font-bold muted">
        Drag me
      </p>

      {/* Build card */}
      <motion.div
        {...dragProps}
        className="sticker absolute left-0 top-6 w-[188px] cursor-grab rotate-[-4deg] p-3.5 active:cursor-grabbing"
      >
        <p className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.16em] muted-soft">
          currently shipping
        </p>
        <pre className="mt-1.5 font-mono text-[0.66rem] leading-relaxed">
          {`const emerald = {\n  role: "backend",\n  mode: "ship it"\n}`}
        </pre>
      </motion.div>

      {/* On the bench */}
      <motion.div
        {...dragProps}
        className="sticker absolute right-0 top-0 w-[190px] cursor-grab rotate-[4deg] border-ink bg-leaf p-3.5 text-bone active:cursor-grabbing"
      >
        <p className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.16em] muted">
          on the bench
        </p>
        <p className="mt-1 font-display text-lg font-extrabold leading-tight">
          Calder: email API
        </p>
      </motion.div>

      {/* Ship it */}
      <motion.div
        {...dragProps}
        className="sticker absolute bottom-24 left-4 cursor-grab rotate-[-3deg] bg-tang px-4 py-2 active:cursor-grabbing"
      >
        <p className="font-hand text-2xl font-bold leading-none text-night">ship it.</p>
      </motion.div>

      {/* Commits */}
      <motion.div
        {...dragProps}
        className="sticker absolute bottom-2 right-1 w-[178px] cursor-grab rotate-[3deg] p-3.5 active:cursor-grabbing"
      >
        <p className="font-display text-xl font-extrabold leading-none">2,600+</p>
        <p className="mt-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] muted-soft">
          commits &amp; counting
        </p>
      </motion.div>

      {!compact ? (
        <motion.div
          {...dragProps}
          className="sticker absolute left-1/3 top-1/2 cursor-grab rotate-[-5deg] bg-grape px-3.5 py-2 text-bone active:cursor-grabbing"
        >
          <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em]">
            SWE @ TESTFLOW
          </p>
        </motion.div>
      ) : (
        <motion.div
          {...dragProps}
          className="sticker absolute left-1/2 top-[45%] cursor-grab rotate-[-6deg] bg-grape px-3 py-1.5 text-bone active:cursor-grabbing"
        >
          <p className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.14em]">SWE @ TESTFLOW</p>
        </motion.div>
      )}
    </div>
  );
}
