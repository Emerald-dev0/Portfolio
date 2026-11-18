import type { ReactNode } from "react";

/**
 * DOODLE, the hand-drawn SVG system. One signature, many marks: asterisk,
 * squiggle, arrow, spark, star, scribble circle, underline, spiral, bolt,
 * check, heart. Stroke-only with round caps, colored via `currentColor`, 
 * drop one anywhere with a text color and a size class. Decorative, so it is
 * always aria-hidden. Reuse these; don't invent new marks per section.
 */

export type DoodleName =
  | "asterisk"
  | "squiggle"
  | "arrow"
  | "spark"
  | "star"
  | "circle"
  | "underline"
  | "spiral"
  | "bolt"
  | "check"
  | "heart";

const PATHS: Record<DoodleName, ReactNode> = {
  asterisk: <path d="M50 8v84M14 29l72 42M86 29L14 71" />,
  squiggle: <path d="M4 52 Q16 30 28 52 T52 52 T76 52 T96 52" />,
  arrow: (
    <>
      <path d="M12 84 C40 84 66 66 80 30" />
      <path d="M64 24 L80 30 L75 47" />
    </>
  ),
  spark: <path d="M50 4 L60 40 L96 50 L60 60 L50 96 L40 60 L4 50 L40 40 Z" />,
  star: <path d="M50 6 L62 38 L96 38 L68 58 L79 92 L50 71 L21 92 L32 58 L4 38 L38 38 Z" />,
  circle: (
    <path d="M50 10 C76 10 92 28 90 50 C88 74 70 90 48 89 C26 88 10 70 12 47 C14 25 32 12 54 14" />
  ),
  underline: <path d="M4 58 Q16 46 28 58 T52 58 T76 58 T96 58" />,
  spiral: (
    <path d="M50 50 c1-6 8-8 12-4 5 5 2 13-5 15-8 2-15-4-14-12 1-9 11-14 20-11 10 3 14 15 9 24" />
  ),
  bolt: <path d="M56 4 L22 54 L46 54 L38 96 L80 40 L52 40 Z" />,
  check: <path d="M14 54 L40 80 L86 18" />,
  heart: (
    <path d="M50 84 C20 60 8 42 14 28 C20 14 40 14 50 30 C60 14 80 14 86 28 C92 42 80 60 50 84 Z" />
  ),
};

export function Doodle({
  name,
  className = "",
  strokeWidth = 6,
}: {
  name: DoodleName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
