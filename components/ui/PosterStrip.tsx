import Image from "next/image";

/**
 * POSTER STRIP, a rotated, auto-scrolling band of project posters. It's the
 * wallpaper between sections: loud, full-bleed, and pure repetition of the
 * project artwork already on the page. Decorative, so hidden from screen
 * readers (the projects themselves are described in the Work section).
 */

const POSTERS = [
  { src: "/projects/calder.webp", name: "Calder" },
  { src: "/projects/testflow.webp", name: "TestFlow" },
  { src: "/projects/orvn.webp", name: "ORREI" },
  { src: "/projects/telegram.webp", name: "GitBot" },
  { src: "/projects/intake.webp", name: "Intake" },
  { src: "/projects/opencircle.webp", name: "OpenCircle" },
  { src: "/projects/blueprint.webp", name: "Blueprint" },
  { src: "/projects/cypher.webp", name: "Cypher" },
];

export function PosterStrip({ reverse = false }: { reverse?: boolean }) {
  const row = [...POSTERS, ...POSTERS];

  return (
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
            className="relative h-[132px] w-[132px] shrink-0 overflow-hidden rounded-xl border-[2.5px] border-bone shadow-[4px_4px_0_var(--color-tang)] sm:h-[160px] sm:w-[160px]"
          >
            <Image src={p.src} alt="" fill sizes="160px" className="object-cover" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-ink/75 py-0.5 text-center font-mono text-[0.55rem] font-bold uppercase tracking-[0.14em] text-bone">
              {p.name}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
