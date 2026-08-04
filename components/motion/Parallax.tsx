"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import type { ReactNode } from "react";

/**
 * Parallax — translates its children on scroll for gentle depth. `speed` is the
 * fraction of scroll distance to offset (negative = moves up faster). Disabled
 * under reduced-motion. Use for paper layers, doodles, background accents.
 */
export function Parallax({
  children,
  speed = 0.15,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const range = 120 * speed;
  const y: MotionValue<number> = useTransform(
    scrollYProgress,
    [0, 1],
    [range, -range],
  );

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { y }}>{children}</motion.div>
    </div>
  );
}
