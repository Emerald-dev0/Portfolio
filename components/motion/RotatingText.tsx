"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

/**
 * RotatingText — cycles through a list of phrases with a deliberate typewriter
 * feel: types a phrase, holds, deletes, moves to the next. A soft ink caret
 * trails it. Under reduced-motion it cross-fades instead of typing.
 */
export default function RotatingText({
  phrases,
  className = "",
  typeSpeed = 55,
  deleteSpeed = 28,
  hold = 1700,
  startDelay = 0,
}: {
  phrases: string[];
  className?: string;
  typeSpeed?: number;
  deleteSpeed?: number;
  hold?: number;
  startDelay?: number;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"type" | "hold" | "delete">("type");
  const [started, setStarted] = useState(false);

  // honor a start delay so the hero's typed intro can finish first
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);

  // reduced-motion: simple timed cross-fade through phrases
  useEffect(() => {
    if (!reduce || !started) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % phrases.length), 2600);
    return () => clearInterval(t);
  }, [reduce, started, phrases.length]);

  // typewriter state machine
  useEffect(() => {
    if (reduce || !started) return;
    const current = phrases[index];
    let t: ReturnType<typeof setTimeout>;

    if (phase === "type") {
      if (text.length < current.length) {
        t = setTimeout(() => setText(current.slice(0, text.length + 1)), typeSpeed);
      } else {
        t = setTimeout(() => setPhase("delete"), hold);
      }
    } else if (phase === "delete") {
      if (text.length > 0) {
        t = setTimeout(() => setText(current.slice(0, text.length - 1)), deleteSpeed);
      } else {
        setPhase("type");
        setIndex((i) => (i + 1) % phrases.length);
      }
    }
    return () => clearTimeout(t);
  }, [text, phase, index, phrases, reduce, started, typeSpeed, deleteSpeed, hold]);

  if (reduce) {
    return (
      <span className={className}>
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            className="inline-block"
          >
            {phrases[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    );
  }

  return (
    <span className={className} aria-live="polite">
      {text}
      <span
        aria-hidden
        className="ml-0.5 inline-block w-[2px] self-stretch align-middle"
        style={{
          height: "0.95em",
          background: "var(--color-accent)",
          animation: "tw-blink 1s step-end infinite",
          verticalAlign: "-0.1em",
        }}
      />
      <style>{`@keyframes tw-blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </span>
  );
}
