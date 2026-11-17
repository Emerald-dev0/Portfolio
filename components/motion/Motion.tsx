"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * ============================================================================
 * MOTION, the deliberate layer.
 * ============================================================================
 * Everything here is transform or opacity only, degrades to a static layout
 * under `prefers-reduced-motion`, and never traps the reader. The point is not
 * movement for its own sake: each piece exists so the page feels like it was
 * built by a person, not assembled by a template.
 *
 *  Bar           a 3px reading rail along the top of the page
 *  WordReveal    the headline unmasks one line at a time, from below
 *  ScrollSkew    a block that leans slightly as it passes the viewport
 *  StickyPanels  panels that pin and stack as you scroll, mobile friendly
 *  MarqueeScroll a band whose speed follows the scroll direction
 *  Peel          a sticker that lifts its corner when you hover it
 *  TapSquish     press feedback for touch, no hover required
 *  Hairline      a rule that draws itself in when it enters view
 *  NumberTicker  a number that counts up once, the first time you see it
 * ============================================================================
 */

const EASE = [0.16, 1, 0.3, 1] as const;

/* -------------------------------------------------------------------------
 * Reading rail
 * ---------------------------------------------------------------------- */
export function ScrollRail() {
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.3,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: width }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-leaf via-tang to-grape"
    />
  );
}

/* -------------------------------------------------------------------------
 * Word / line reveal. Each child line rises out of a mask, in sequence.
 * ---------------------------------------------------------------------- */
export function LineReveal({
  lines,
  className = "",
  lineClassName = "",
  delay = 0,
  as = "h1",
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];

  if (reduce) {
    return (
      <Tag className={className}>
        {lines.map((line, i) => (
          <span key={i} className={`block ${lineClassName}`}>
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className={`block ${lineClassName}`}
            initial={{ y: "108%", rotate: 2.5 }}
            whileInView={{ y: "0%", rotate: 0 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{ duration: 0.85, ease: EASE, delay: delay + i * 0.09 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/* -------------------------------------------------------------------------
 * Scroll skew: a block that leans a couple of degrees as it crosses.
 * ---------------------------------------------------------------------- */
export function ScrollSkew({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [-1.4, 0, 1.4]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { rotate }}>
        {children}
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Sticky stacking panels. Each card pins a little lower than the last, so the
 * work section builds a physical stack instead of scrolling past. This is the
 * mobile hero move: it makes a phone feel like a deck of cards.
 * ---------------------------------------------------------------------- */
export function StickyStack({
  children,
  className = "",
  offset = 88,
}: {
  children: ReactNode[];
  className?: string;
  /** px from the top of the viewport where each panel parks */
  offset?: number;
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <div
          key={i}
          className="sticky"
          style={{ top: offset + i * 14, zIndex: i + 1 }}
        >
          <div className="pb-6">{child}</div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------
 * A marquee whose direction follows the scroll. Idle it drifts left; scroll
 * down and it accelerates the same way; scroll up and it reverses.
 * ---------------------------------------------------------------------- */
export function DirectionalMarquee({
  children,
  className = "",
  baseDuration = 26,
}: {
  children: ReactNode;
  className?: string;
  baseDuration?: number;
}) {
  const reduce = useReducedMotion();
  const [dir, setDir] = useState(1);
  const last = useRef(0);

  useEffect(() => {
    if (reduce) return;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - last.current;
      if (Math.abs(delta) > 6) setDir(delta > 0 ? 1 : -1);
      last.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduce]);

  return (
    <div className={`marquee-track ${className}`}>
      <div
        className="flex w-max items-center"
        style={
          reduce
            ? undefined
            : {
                animation: `marquee ${baseDuration}s linear infinite`,
                animationDirection: dir === 1 ? "normal" : "reverse",
              }
        }
      >
        {children}
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Peel: a sticker that lifts a corner on hover, like it is coming off paper.
 * ---------------------------------------------------------------------- */
export function Peel({
  children,
  className = "",
  rotate = 0,
}: {
  children: ReactNode;
  className?: string;
  rotate?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={{ rotate }}
      whileHover={
        reduce
          ? undefined
          : {
              rotate: rotate - 1.6,
              y: -4,
              scale: 1.015,
              transition: { duration: 0.25 },
            }
      }
      whileTap={reduce ? undefined : { scale: 0.985, y: 1 }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------
 * Tap feedback for touch. Stickers on a phone should respond to a thumb.
 * ---------------------------------------------------------------------- */
export function TapSquish({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      whileTap={reduce ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------
 * A hairline that draws itself across when it enters the viewport.
 * ---------------------------------------------------------------------- */
export function Hairline({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className={`h-[2.5px] origin-left bg-ink ${className}`}
      initial={reduce ? undefined : { scaleX: 0 }}
      whileInView={reduce ? undefined : { scaleX: 1 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1.1, ease: EASE }}
    />
  );
}

/* -------------------------------------------------------------------------
 * A number that counts up the first time it is seen.
 * ---------------------------------------------------------------------- */
export function NumberTicker({
  value,
  className = "",
  duration = 1200,
}: {
  value: number;
  className?: string;
  duration?: number;
}) {
  const [shown, setShown] = useState(0);
  const [started, setStarted] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!started) return;
    if (reduce) {
      setShown(value);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, value, duration, reduce]);

  return (
    <motion.span
      className={className}
      onViewportEnter={() => setStarted(true)}
      viewport={{ once: true }}
    >
      {shown.toLocaleString()}
    </motion.span>
  );
}
