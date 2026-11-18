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
import { Icon } from "../ui/Icon";
import { Section, SectionHeader } from "../ui/Section";

/**
 * CONTENT, the @dev_boy09 / DevEmerald community section. The handle is
 * display-only (no URL is constructed from it); the follow CTA points at
 * the verified X account from config. Three rotated pillar cards.
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

        <Reveal className="mt-12">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <span className="font-display text-[clamp(2.6rem,8vw,5.5rem)] font-extrabold leading-none tracking-tight">
              {site.contentHandle}
            </span>
            <span className="rotate-[-4deg] rounded-full border-2 border-ink bg-lagoon px-4 py-1.5 font-hand text-2xl font-bold text-night shadow-[4px_4px_0_var(--color-ink)]">
              {site.contentName}
            </span>
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
          {x?.href ? (
            <Button href={x.href} variant="ink" external>
              Follow the journey
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
