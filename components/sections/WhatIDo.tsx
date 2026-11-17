import {
  AiSparklesIcon,
  ArrowRight01Icon,
  CodeIcon,
  Database01Icon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons";
import { services, servicesHeading, type Service } from "../../lib/content";
import { Reveal } from "../motion/Reveal";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Icon } from "../ui/Icon";
import { Section, SectionHeader } from "../ui/Section";

/**
 * WHAT I DO, four offerings on an emerald panel. Asymmetric bento: two
 * wide cards and two narrow ones, each with its own resting rotation, so
 * the grid never reads as "three equal cards". One CTA at the end.
 */

const ICONS: Record<Service["icon"], Parameters<typeof Icon>[0]["icon"]> = {
  code: CodeIcon,
  database: Database01Icon,
  wrench: Wrench01Icon,
  sparkles: AiSparklesIcon,
};

const COLOR_BG: Record<Service["color"], string> = {
  leaf: "bg-leaf",
  tang: "bg-tang",
  grape: "bg-grape",
  lagoon: "bg-lagoon",
};

const COLOR_TEXT: Record<Service["color"], string> = {
  leaf: "text-bone",
  tang: "text-night",
  grape: "text-bone",
  lagoon: "text-night",
};

/* Asymmetric spans + offsets, the bento rhythm. */
const SPANS = [
  "lg:col-span-7",
  "lg:col-span-5 lg:mt-14",
  "lg:col-span-5 lg:-mt-4",
  "lg:col-span-7 lg:mt-10",
];

export function WhatIDo() {
  return (
    <Section id="services" className="pattern-dots-light bg-leaf text-bone">
      <div className="mx-auto max-w-7xl px-5 pb-36 pt-28 sm:px-8">
        <SectionHeader
          pill={servicesHeading.label}
          title={servicesHeading.heading}
          copy={servicesHeading.intro}
        />

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-12">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08} className={SPANS[i]}>
              <Card rotate={s.rotate} className="h-full p-7 text-ink sm:p-8">
                <div
                  className={`grid size-12 place-items-center rounded-2xl border-2 border-ink ${COLOR_BG[s.color]} ${COLOR_TEXT[s.color]}`}
                >
                  <Icon icon={ICONS[s.icon]} size={24} />
                </div>
                <h3 className="display-card mt-5">{s.title}</h3>
                <p className="mt-3 leading-relaxed opacity-80">{s.copy}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {s.chips.map((c) => (
                    <span key={c} className="chip">
                      {c}
                    </span>
                  ))}
                </div>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-16">
          <Button href="/#contact" variant="tang">
            {servicesHeading.cta}
            <Icon icon={ArrowRight01Icon} size={17} />
          </Button>
        </Reveal>
      </div>
    </Section>
  );
}
