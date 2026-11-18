import type { ReactNode } from "react";
import { Reveal } from "../motion/Reveal";
import { Hairline, LineReveal } from "../motion/Motion";

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
      <div className="mt-5">
        {typeof title === "string" ? (
          <LineReveal
            as="h2"
            className="display-section"
            lines={title.split(". ").map((line, i, all) => (
              <span key={i}>{i < all.length - 1 ? `${line}.` : line}</span>
            ))}
          />
        ) : (
          <Reveal delay={0.08}>
            <h2 className="display-section">{title}</h2>
          </Reveal>
        )}
      </div>
      {copy ? (
        <Reveal delay={0.16}>
          <p className="mt-4 max-w-xl text-[1.05rem] leading-relaxed opacity-80">{copy}</p>
        </Reveal>
      ) : null}
      <Hairline className="mt-7 w-full opacity-15" />
    </div>
  );
}
