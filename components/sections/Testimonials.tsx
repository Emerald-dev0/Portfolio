"use client";

import SectionHeader from "@/components/ui/SectionHeader";
import Doodle from "@/components/materials/Doodle";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { testimonials } from "@/lib/content";

/**
 * Section 9: Kind Words (testimonials).
 * ---------------------------------------------------------------------------
 * NOTE: This component is intentionally NOT rendered in page.tsx. It stays
 * commented out until REAL quotes exist. Do not fabricate testimonials.
 *
 * When real quotes are added to `testimonials` in lib/content.ts, uncomment
 * the <Testimonials /> import + usage in page.tsx. This section is the one
 * place a little extra comic license is okay (someone else's voice), hence the
 * thumbs-up figure beside each quote.
 * ---------------------------------------------------------------------------
 */
export default function Testimonials() {
  if (testimonials.length === 0) return null;

  return (
    <section id="kind-words" className="section-pad relative">
      <div className="mx-auto w-full max-w-5xl">
        <SectionHeader tag="KIND WORDS" heading="What people say, unprompted." />

        <Stagger className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <StaggerItem key={i}>
              <div className="ink-edge--soft relative flex gap-4 bg-paper-raised p-5">
                <Doodle
                  name="star"
                  size={30}
                  className="shrink-0 text-accent"
                />
                <div>
                  <p className="text-[14px] leading-relaxed text-ink">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                    — {t.author}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
