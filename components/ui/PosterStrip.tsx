import { InkPoster } from "./InkPoster";
import { ScrollSkew } from "../motion/Motion";

/**
 * POSTER STRIP
 * ------------------------------------------------------------------------
 * A rotated, auto-scrolling band of project posters: the loud break between
 * sections. Each poster is drawn from the same ink materials as the work
 * panels, so nothing here is a bitmap and nothing has to load.
 *
 * Decorative, so it is hidden from the accessibility tree; the projects
 * themselves are described properly in the Work section.
 */

type Poster = {
  index: string;
  name: string;
  role: string;
  crayon: "leaf" | "tang" | "grape" | "lagoon" | "blush" | "night";
};

const POSTERS: Poster[] = [
  { index: "01", name: "Calder", role: "email api", crayon: "grape" },
  { index: "02", name: "Intake", role: "ai forms", crayon: "tang" },
  { index: "03", name: "TestFlow", role: "exam backend", crayon: "leaf" },
  { index: "04", name: "ORREI", role: "property pages", crayon: "lagoon" },
  { index: "05", name: "Cypher", role: "lan control", crayon: "blush" },
  { index: "06", name: "Blueprint", role: "code intel", crayon: "night" },
  { index: "07", name: "GitBot", role: "telegram bot", crayon: "tang" },
  { index: "08", name: "PhoneDock", role: "device bridge", crayon: "leaf" },
];

export function PosterStrip({ reverse = false }: { reverse?: boolean }) {
  const row = [...POSTERS, ...POSTERS];

  return (
    <ScrollSkew>
      <div
        aria-hidden="true"
        className={`relative z-20 -my-6 w-[108vw] -translate-x-[4vw] overflow-hidden border-y-[2.5px] border-ink bg-night py-4 ${
          reverse ? "rotate-[1.2deg]" : "rotate-[-1.4deg]"
        }`}
      >
        <div
          className={`marquee-track items-center gap-4 ${
            reverse ? "animate-marquee-rev" : "animate-marquee"
          }`}
          style={{ animationDuration: reverse ? "52s" : "44s" }}
        >
          {row.map((p, i) => (
            <figure
              key={`${p.name}-${i}`}
              className="relative h-[132px] w-[132px] shrink-0 rotate-[-1.5deg] overflow-hidden rounded-[10px] border-[2.5px] border-bone shadow-[4px_4px_0_var(--color-tang)] sm:h-[160px] sm:w-[160px]"
            >
              <InkPoster
                index={p.index}
                name={p.name}
                role={p.role}
                crayon={p.crayon}
              />
            </figure>
          ))}
        </div>
      </div>
    </ScrollSkew>
  );
}
