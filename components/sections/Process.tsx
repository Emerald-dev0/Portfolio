import { processSteps, processHeading } from "../../lib/content";
import { Reveal } from "../motion/Reveal";
import { Section, SectionHeader } from "../ui/Section";

/**
 * PROCESS, four steps on a winding dashed path. Numbered sticker nodes
 * sit on the path; even steps drop lower so the line feels hand-drawn
 * rather than ruled. Each step ends with the tangible thing you get.
 * Violet panel.
 */
export function Process() {
  return (
    <Section id="process" className="pattern-dots-light bg-grape text-bone">
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-20 sm:px-8 sm:pb-36 sm:pt-28">
        <SectionHeader
          pill={processHeading.label}
          title={processHeading.heading}
          copy={processHeading.intro}
        />

        <div className="relative mt-20">
          {/* The winding path (desktop) */}
          <svg
            className="absolute left-0 right-0 top-8 hidden h-8 w-full lg:block"
            viewBox="0 0 1200 40"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M10 20 C 200 0, 400 40, 600 20 S 1000 0, 1190 20"
              fill="none"
              className="stroke-bone"
              strokeWidth="3"
              strokeDasharray="10 10"
              strokeLinecap="round"
              opacity="0.6"
            />
          </svg>

          <ol className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {processSteps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.1} className={i % 2 ? "lg:mt-12" : ""}>
                <li className="relative">
                  <span className="sticker-sm relative z-10 grid size-16 place-items-center rounded-full bg-tang font-display text-2xl font-extrabold text-night">
                    {i + 1}
                  </span>
                  <h3 className="display-card mt-6">{s.title}</h3>
                  <p className="mt-3 leading-relaxed muted">{s.copy}</p>
                  <span className="chip mt-5">you get: {s.deliverable}</span>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
