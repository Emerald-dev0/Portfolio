import { about } from "../../lib/content";
import { Reveal } from "../motion/Reveal";
import { Card } from "../ui/Card";
import { Section, SectionHeader } from "../ui/Section";

/**
 * ABOUT, human first, facts second. Left: the story in plain language
 * plus a "currently" card. Right: quick facts as staggered, rotated
 * sticker cards (masonry rhythm, not a uniform grid). Tangerine panel.
 */

const FACT_ROTATE = [-2, 1.5, -1, 2, -1.5, 1];
const FACT_OFFSET = ["", "lg:mt-10", "", "lg:mt-10", "", "lg:mt-10"];

export function About() {
  return (
    <Section id="about" className="pattern-dots bg-tang text-night">
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-20 sm:px-8 sm:pb-36 sm:pt-28">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeader pill={about.label} title={about.heading} />
            <div className="mt-8 flex flex-col gap-5 text-lg leading-relaxed">
              {about.body.map((p, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <p>{p}</p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.2}>
              <div className="sticker mt-10 rotate-[-1deg] p-6">
                <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.16em] opacity-60">
                  currently
                </p>
                <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {Object.entries(about.currently).map(([k, v]) => (
                    <div key={k}>
                      <dt className="font-mono text-[0.65rem] font-bold uppercase tracking-widest opacity-50">
                        {k}
                      </dt>
                      <dd className="mt-0.5 font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <div className="grid gap-5 sm:grid-cols-2">
              {about.facts.map((f, i) => (
                <Reveal key={f.label} delay={i * 0.07} className={FACT_OFFSET[i]}>
                  <Card rotate={FACT_ROTATE[i]} className="p-5">
                    <p className="font-display text-lg font-extrabold leading-snug">{f.label}</p>
                    <p className="mt-1 font-mono text-[0.68rem] font-bold uppercase tracking-[0.12em] opacity-60">
                      {f.sub}
                    </p>
                  </Card>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.3}>
              <p className="mt-8 rotate-[-1deg] font-hand text-3xl font-bold">
              , a human, not a résumé
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  );
}
