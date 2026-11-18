import { marquee } from "../../lib/content";
import { DirectionalMarquee } from "../motion/Motion";

/**
 * MARQUEE, the ink strip that separates hero from work. Two rows, opposite
 * directions and slightly skewed: the stack on the ink row, the project names
 * on the emerald row. Both pause on hover.
 */
export function Marquee() {
  const row = marquee.items;

  return (
    <div className="relative z-30 -my-4 select-none" aria-hidden="true">
      <div className="w-[106vw] -translate-x-[3vw] rotate-[-1.6deg] overflow-hidden border-y-[2.5px] border-ink bg-night py-3">
        <DirectionalMarquee className="items-center gap-6" baseDuration={30}>
          {row.map((item, i) => (
            <span key={`${item}-${i}`} className="flex items-center gap-6">
              <span className="font-display text-lg font-extrabold uppercase tracking-tight text-bone sm:text-2xl">
                {item}
              </span>
              <span className="text-leaf">✦</span>
            </span>
          ))}
        </DirectionalMarquee>
      </div>

      <div className="w-[106vw] -translate-x-[2vw] rotate-[1.2deg] overflow-hidden border-b-[2.5px] border-ink bg-leaf py-2">
        <div className="marquee-track animate-marquee-rev items-center gap-5">
          {[...marquee.projects, ...marquee.projects].map((name, i) => (
            <span key={`${name}-${i}`} className="flex items-center gap-5">
              <span className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.18em] text-bone/90">
                {name}
              </span>
              <span className="text-bone/50">·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
