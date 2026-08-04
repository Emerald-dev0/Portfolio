"use client";

import Doodle, { type DoodleName } from "@/components/materials/Doodle";
import { Parallax } from "@/components/motion/Parallax";

/**
 * AmbientField — scatters a few slowly-drifting doodles into a section's dead
 * space. Purely decorative, pointer-events-none, hidden on small screens so it
 * never crowds mobile. Each mark drifts on its own delay + a parallax offset so
 * the page always feels quietly alive without lockstep motion.
 */

type Mark = {
  name: DoodleName;
  className: string; // positioning (top/left/right)
  size: number;
  anim: "drift" | "sway" | "float";
  delay?: 0 | 1 | 2 | 3;
  parallax?: number;
  color?: string;
};

export default function AmbientField({ marks }: { marks: Mark[] }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden md:block"
    >
      {marks.map((m, i) => (
        <Parallax
          key={i}
          speed={m.parallax ?? 0.2}
          className={`absolute ${m.className}`}
        >
          <Doodle
            name={m.name}
            size={m.size}
            className={`animate-${m.anim} ${
              m.delay ? `delay-${m.delay}` : ""
            } ${m.color ?? "text-ink-faint/50"}`}
          />
        </Parallax>
      ))}
    </div>
  );
}
