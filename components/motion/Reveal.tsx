"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Reveal — the workhorse entrance primitive. Ink-bleed rise with optional
 * directional slide, used for nearly every block so the page unfolds instead
 * of dumping. Pair with <Stagger> to cascade children.
 */

const EASE = [0.16, 1, 0.3, 1] as const; // expressive ease-out

type Dir = "up" | "down" | "left" | "right" | "none";

const offset: Record<Dir, { x?: number; y?: number }> = {
  up: { y: 22 },
  down: { y: -22 },
  left: { x: 28 },
  right: { x: -28 },
  none: {},
};

export function Reveal({
  children,
  dir = "up",
  delay = 0,
  duration = 0.7,
  blur = true,
  once = false,
  className = "",
}: {
  children: ReactNode;
  dir?: Dir;
  delay?: number;
  duration?: number;
  blur?: boolean;
  once?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        ...offset[dir],
        filter: blur ? "blur(6px)" : "blur(0px)",
      }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "-12% 0px" }}
      transition={{ duration, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Stagger — parent that cascades <Stagger.Item> children into view. */
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(5px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE },
  },
};

export function Stagger({
  children,
  className = "",
  once = false,
  amount = 0.2,
}: {
  children: ReactNode;
  className?: string;
  once?: boolean;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
