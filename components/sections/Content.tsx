import {
  ArrowUpRight01Icon,
  Book01Icon,
  Rocket01Icon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons";
import { site, socials } from "../../lib/config";
import { contentPillars, contentHeading } from "../../lib/content";
import { Reveal } from "../motion/Reveal";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Chibi } from "../ui/Chibi";
import { Doodle } from "../ui/Doodle";
import { Icon } from "../ui/Icon";
import { Section, SectionHeader } from "../ui/Section";

/**
 * CONTENT, what I write and why.
 * ------------------------------------------------------------------------
 * This used to be dominated by a display-size handle and a brand pill, which
 * said less than the three cards underneath it and shouted louder than them.
 * The same space now holds a small drawing of me at a laptop, a plain sentence
 * about what I write, and the cards.
 *
 * The drawing is the only illustration on the page, so it earns its place:
 * sunglasses down, mid-keystroke, drawn in the same ink as everything else.
 */

const ICONS = [Rocket01Icon, Book01Icon, Wrench01Icon];
const COLORS = ["bg-tang text-night", "bg-leaf text-bone", "bg-grape text-bone"];
const ROTATE = [-1.5, 1, -1];

export function Content() {
  const x = socials.find((s) => s.id === "x");

  return (
    <Section id="content" className="pattern-grid bg-paper">
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-20 sm:px-8 sm:pb-36 sm:pt-28">
        <SectionHeader
          pill={contentHeading.label}
          title={contentHeading.heading}
          copy={`${contentHeading.intro} ${contentHeading.note}`}
        />

        {/* The drawing and the sentence beside it, instead of a giant handle. */}
        <Reveal className="mt-12">
          <div className="flex flex-col items-center gap-7 sm:flex-row sm:items-end sm:gap-10">
            <div className="relative shrink-0">
              <Chibi
                className="w-[168px] sm:w-[196px]"
                title="Daniel at a laptop, sunglasses on"
              />
              <Doodle
                name="asterisk"
                className="absolute -right-3 -top-1 w-7 text-tang animate-spin-slow"
                strokeWidth={6}
              />
            </div>

            <div className="max-w-md">
              <p className="font-display text-[clamp(1.35rem,3vw,1.9rem)] font-extrabold leading-[1.15] tracking-tight">
                I write to think, then publish so the thinking survives.
              </p>
              <p className="mt-3 leading-relaxed muted">
                Mostly the decisions behind the software: why a schema looks like this, why a
                queue was worth it, why the obvious approach was the wrong one.
              </p>
              <p className="mt-3 font-hand text-2xl muted">
                the blog is where it lands first
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {contentPillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <Card rotate={ROTATE[i]} className="h-full p-7">
                <div
                  className={`grid size-12 place-items-center rounded-2xl border-2 border-ink ${COLORS[i]}`}
                >
                  <Icon icon={ICONS[i]} size={24} />
                </div>
                <h3 className="display-card mt-5">{p.title}</h3>
                <p className="mt-3 leading-relaxed muted">{p.copy}</p>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 flex flex-wrap gap-4">
          <Button href="/blog" variant="ink">
            Read the blog
            <Icon icon={ArrowUpRight01Icon} size={16} />
          </Button>
          {x?.href ? (
            <Button href={x.href} variant="paper" external>
              Follow along
              <Icon icon={ArrowUpRight01Icon} size={16} />
            </Button>
          ) : null}
          <Button href={site.github} variant="paper" external>
            See the code
            <Icon icon={ArrowUpRight01Icon} size={16} />
          </Button>
        </Reveal>
      </div>
    </Section>
  );
}
