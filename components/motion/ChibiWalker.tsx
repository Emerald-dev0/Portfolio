"use client";

import { motion, useReducedMotion } from "framer-motion";
import Chibi from "@/components/motion/Chibi";

/**
 * ChibiWalker — a little character that strolls across the full width of its
 * (relatively-positioned) parent on an endless loop, flipping to face its
 * direction. Sits absolutely at the bottom of whatever wraps it. Under reduced
 * motion it just stands still at the left.
 */
export default function ChibiWalker({
  size = 46,
  duration = 26,
  className = "",
  colorClass = "text-ink/60",
}: {
  size?: number;
  duration?: number;
  className?: string;
  colorClass?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={`pointer-events-none absolute ${className} ${colorClass}`}>
        <Chibi variant="walk" size={size} />
      </div>
    );
  }

  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute ${className} ${colorClass}`}
      initial={{ left: "-6%" }}
      animate={{ left: ["-6%", "104%", "-6%"] }}
      transition={{
        duration,
        ease: "linear",
        repeat: Infinity,
        times: [0, 0.5, 1],
      }}
    >
      {/* flip to face travel direction on each half of the loop */}
      <motion.div
        animate={{ scaleX: [1, 1, -1, -1, 1] }}
        transition={{ duration, repeat: Infinity, times: [0, 0.49, 0.5, 0.99, 1] }}
      >
        <Chibi variant="walk" size={size} />
      </motion.div>
    </motion.div>
  );
}
