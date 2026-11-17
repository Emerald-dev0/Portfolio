"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * READING PROGRESS, a thin leaf bar pinned to the top of the viewport
 * that fills as you scroll a post. Spring-smoothed so it glides instead
 * of jittering. Decorative (aria-hidden); the post itself is the content.
 */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-1.5 origin-left bg-leaf"
      aria-hidden="true"
    />
  );
}
