"use client";

import { logos } from "@/lib/content";
import Doodle from "@/components/materials/Doodle";

/**
 * LogoMarquee — an infinite, continuously-scrolling band of the tools I build
 * with. Two rows drift in opposite directions and pause on hover. Chips render
 * a monogram now; drop real SVGs in /public/logos/<name>.svg later to upgrade
 * (see note in content.ts). Pure ambient motion — always alive.
 */
function monogram(name: string) {
  const map: Record<string, string> = {
    "Next.js": "Nx",
    "Node.js": "No",
    JavaScript: "JS",
    TypeScript: "TS",
    Postgres: "Pg",
    MongoDB: "Mo",
    Tailwind: "Tw",
  };
  return map[name] ?? name.replace(/[^A-Za-z]/g, "").slice(0, 2);
}

function Chip({ name }: { name: string }) {
  return (
    <span className="mx-2 inline-flex shrink-0 items-center gap-2 rounded-full border border-ink/20 bg-paper-raised px-4 py-2 transition-colors hover:border-ink">
      <span className="flex h-6 w-6 items-center justify-center rounded-[6px_4px_6px_4px] border border-ink/40 font-mono text-[10px] font-bold text-ink">
        {monogram(name)}
      </span>
      <span className="font-mono text-[13px] text-ink-muted">{name}</span>
    </span>
  );
}

function Row({ reverse = false }: { reverse?: boolean }) {
  // duplicate the list so the -50% translate loops seamlessly
  const items = [...logos.items, ...logos.items];
  return (
    <div className="flex w-max">
      <div
        className={`flex items-center ${reverse ? "marquee-rev" : "marquee"}`}
      >
        {items.map((name, i) => (
          <Chip key={`${name}-${i}`} name={name} />
        ))}
      </div>
    </div>
  );
}

export default function LogoMarquee() {
  return (
    <section
      id="tools"
      className="relative overflow-hidden border-y border-rule/60 bg-paper/40 py-12"
    >
      <div className="mx-auto mb-6 flex max-w-5xl items-center gap-3 px-6">
        <span className="sticky-tab">STACK</span>
        <span className="font-pen text-lg text-accent-2">{logos.note}</span>
        <Doodle
          name="arrow-curve"
          size={26}
          className="animate-float ml-1 text-ink-faint"
        />
      </div>

      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-paper to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-paper to-transparent" />

      <div className="marquee-wrap flex flex-col gap-3">
        <Row />
        <Row reverse />
      </div>
    </section>
  );
}
