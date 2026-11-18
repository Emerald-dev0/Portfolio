import type { Crayon } from "../../lib/content";

/**
 * INK POSTER
 * ------------------------------------------------------------------------
 * The artwork, drawn rather than generated. Every "image" on this site is made
 * of the same ingredients as the rest of the page: an ink rule, a corner of
 * halftone shading, a crayon spine, a big hand-set number, the name, and a
 * one-line role. No bitmaps, nothing to load.
 */

const CRAYON: Record<string, string> = {
  leaf: "crayon-green",
  tang: "crayon-mustard",
  grape: "crayon-purple",
  lagoon: "crayon-teal",
  blush: "crayon-pink",
  night: "crayon-oxblood",
  mustard: "crayon-mustard",
};

function ink(crayon: string) {
  return CRAYON[crayon] ?? "crayon-mustard";
}

export function InkPoster({
  index,
  name,
  role,
  crayon = "mustard",
  className = "",
}: {
  index: string;
  name: string;
  role: string;
  crayon?: Crayon | "leaf" | "tang" | "grape" | "lagoon" | "blush" | "night";
  className?: string;
}) {
  return (
    <div
      className={`panel relative flex h-full w-full flex-col justify-between overflow-hidden p-5 sm:p-6 ${ink(
        crayon,
      )} ${className}`}
    >
      <span className="panel-spine" aria-hidden />
      <span className="panel-shade" aria-hidden />

      <div className="relative flex items-start justify-between">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ink-faint">
          selected work
        </span>
        <span className="text-crayon font-hand text-[1.6rem] leading-none">{index}</span>
      </div>

      <div className="relative">
        <p className="display-card text-ink">{name}</p>
        <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-ink-faint">
          {role}
        </p>
      </div>

      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(var(--crayon, var(--color-ink)) 1.1px, transparent 1.2px)",
          backgroundSize: "7px 7px",
          maskImage: "linear-gradient(to top, #000, transparent)",
          WebkitMaskImage: "linear-gradient(to top, #000, transparent)",
        }}
      />
    </div>
  );
}

export function InkPlate({
  name,
  role,
  crayon = "mustard",
  className = "",
}: {
  name: string;
  role: string;
  crayon?: Crayon | "leaf" | "tang" | "grape" | "lagoon" | "blush" | "night";
  className?: string;
}) {
  return (
    <div
      className={`panel relative flex h-full w-full flex-col justify-end overflow-hidden p-4 ${ink(
        crayon,
      )} ${className}`}
    >
      <span className="panel-spine" aria-hidden />
      <span className="panel-shade" aria-hidden />
      <span className="relative block text-[1.05rem] font-semibold leading-tight tracking-tight text-ink">
        {name}
      </span>
      <span className="relative mt-1 block font-mono text-[0.56rem] uppercase tracking-[0.14em] text-ink-faint">
        {role}
      </span>
    </div>
  );
}
