"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * InkBleed — text (or any content) that starts drained of colour and slightly
 * blurred, then the ink "bleeds in" to full saturation as it scrolls into view.
 * Re-triggers every time, so scrolling back up replays it. Under reduced motion
 * Framer skips straight to the resting state.
 */
export default function InkBleed({
  children,
  delay = 0,
  duration = 0.9,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.span
      className={className}
      style={{ display: "inline-block" }}
      initial={{ opacity: 0.15, filter: "blur(3px) saturate(0)" }}
      whileInView={{ opacity: 1, filter: "blur(0px) saturate(1)" }}
      viewport={{ once: false, margin: "-8% 0px" }}
      transition={{ duration, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.span>
  );
}
