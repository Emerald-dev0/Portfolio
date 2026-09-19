"use client";

import { StickyTab } from "@/components/materials/StickyNote";
import { PageHeader } from "@/components/materials/PageHeader";
import type { Crayon } from "@/lib/content";
import Scribble from "@/components/motion/Scribble";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Shared section-header: a small uppercase sticky tag + optional pen sub-note,
 * above a compact declarative marker headline with an optional self-drawing
 * scribble accent beneath it.
 */
export default function SectionHeader({
  tag,
  heading,
  sticky,
  tagColor = "yellow",
  align = "left",
  scribble,
  date,
  page,
}: {
  tag: string;
  heading: string;
  sticky?: string;
  /** the originals (yellow / purple) or any crayon in the box */
  tagColor?: "yellow" | "purple" | Crayon;
  align?: "left" | "center";
  scribble?: "underline" | "zigzag";
  /** the diary entry this section belongs to: "TUESDAY" */
  date?: string;
  /** its page number in the book */
  page?: number;
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      {page !== undefined && (
        <PageHeader page={page} className={align === "center" ? "text-left" : ""} />
      )}
      <Reveal dir="up">
        <div
          className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${
            align === "center" ? "justify-center" : ""
          }`}
        >
          {date && (
            <span className="font-marker text-[clamp(1.05rem,2.2vw,1.5rem)] leading-none text-ink">
              {date}
            </span>
          )}
          {date && <span aria-hidden className="h-px w-6 bg-rule" />}
          <StickyTab color={tagColor}>{tag}</StickyTab>
          {sticky && (
            <span className="font-pen text-lg leading-none text-accent-2">
              {sticky}
            </span>
          )}
        </div>
      </Reveal>
      <Reveal dir="up" delay={0.08}>
        <h2 className="relative mt-3 inline-block font-marker text-[clamp(1.6rem,3.6vw,2.6rem)] leading-[1.05] text-ink">
          {heading}
          {scribble && (
            <Scribble
              preset={scribble}
              color="accent"
              delay={0.25}
              className={`absolute left-0 ${
                scribble === "zigzag" ? "-bottom-3 h-4" : "-bottom-2 h-3"
              } w-full`}
            />
          )}
        </h2>
      </Reveal>
    </div>
  );
}
