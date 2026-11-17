import type { ReactNode } from "react";
import { Reveal } from "../motion/Reveal";

/**
 * SECTION, a full-bleed flat panel with a rounded, overlapping top edge.
 * Each section is one vivid color; the overlap + ink border makes the page
 * read as a stack of stickers. Pass `overlap={false}` for the first section.
 * `scroll-mt` keeps anchored sections clear of the floating nav.
 */
export function Section({
  id,
  className = "",
  overlap = true,
  children,
}: {
  id?: string;
  className?: string;
  overlap?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`relative scroll-mt-28 ${
        overlap ? "-mt-10 rounded-t-[2.5rem] border-t-[2.5px] border-ink" : ""
      } ${className}`}
    >
      {children}
    </section>
  );
}

/**
 * SECTION HEADER, the shared rhythm every section follows:
 * label pill → giant headline → one short line of copy.
 * The section itself adds its content and exactly one CTA below this.
 */
export function SectionHeader({
  pill,
  title,
  copy,
  className = "",
}: {
  pill: string;
  title: ReactNode;
  copy?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Reveal>
        <span className="label-pill">{pill}</span>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="display-section mt-5">{title}</h2>
      </Reveal>
      {copy ? (
        <Reveal delay={0.16}>
          <p className="mt-4 max-w-xl text-lg leading-relaxed opacity-90">{copy}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
