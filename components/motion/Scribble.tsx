"use client";

import { motion } from "framer-motion";

/**
 * Scribble — an SVG path that draws itself in when scrolled into view, like a
 * pen stroke. Used for section accents, underlines, arrows, dividers.
 */

type Preset = "underline" | "circle" | "arrow" | "zigzag" | "bracket";

const presets: Record<
  Preset,
  { d: string; viewBox: string; w: number; h: number }
> = {
  underline: {
    d: "M2 8 C60 2 140 12 210 6 C260 2 300 9 318 7",
    viewBox: "0 0 320 14",
    w: 320,
    h: 14,
  },
  circle: {
    d: "M120 8 C60 4 12 22 14 44 C16 70 80 78 130 74 C186 70 214 48 206 26 C200 8 150 2 96 6",
    viewBox: "0 0 220 84",
    w: 220,
    h: 84,
  },
  arrow: {
    d: "M4 8 C40 4 78 10 108 22 M108 22 L92 12 M108 22 L94 30",
    viewBox: "0 0 116 36",
    w: 116,
    h: 36,
  },
  zigzag: {
    d: "M2 10 L20 3 L38 16 L56 3 L74 16 L92 3 L110 16 L128 3 L146 10",
    viewBox: "0 0 148 20",
    w: 148,
    h: 20,
  },
  bracket: {
    d: "M18 2 C6 4 6 40 6 60 C6 80 6 116 18 118",
    viewBox: "0 0 24 120",
    w: 24,
    h: 120,
  },
};

export default function Scribble({
  preset,
  color = "accent",
  className = "",
  strokeWidth = 2.4,
  delay = 0,
  duration = 0.8,
}: {
  preset: Preset;
  color?: "accent" | "accent-2" | "ink" | "marker";
  className?: string;
  strokeWidth?: number;
  delay?: number;
  duration?: number;
}) {
  const p = presets[preset];
  const stroke =
    color === "accent"
      ? "var(--color-accent)"
      : color === "accent-2"
        ? "var(--color-accent-2)"
        : color === "marker"
          ? "var(--color-marker)"
          : "var(--color-ink)";

  return (
    <svg
      viewBox={p.viewBox}
      fill="none"
      className={className}
      preserveAspectRatio="none"
      aria-hidden
    >
      <motion.path
        d={p.d}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: false, margin: "-10% 0px" }}
        transition={{
          pathLength: { duration, ease: [0.4, 0, 0.2, 1], delay },
          opacity: { duration: 0.15, delay },
        }}
      />
    </svg>
  );
}
