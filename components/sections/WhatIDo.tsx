"use client";

import SectionHeader from "@/components/ui/SectionHeader";
import AmbientField from "@/components/motion/AmbientField";
import { Reveal } from "@/components/motion/Reveal";
import { journal, whatIDo } from "@/lib/content";

/**
 * What I Do. Compact icon + label + one dry line, in the hand-bordered card
 * style. Cards alternate their entrance direction so the row weaves in. Ambient
 * doodles drift behind.
 */
export default function WhatIDo() {
  return (
    <section id="services" className="section-pad relative !pt-12">
      <AmbientField
        marks={[
          { name: "brain", className: "right-[4%] top-[24%]", size: 24, anim: "drift", delay: 2, color: "text-ink-faint/35" },
          { name: "spark", className: "left-[3%] bottom-[18%]", size: 20, anim: "float", color: "text-accent/35" },
        ]}
      />
      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <SectionHeader
          tag={whatIDo.tag}
          heading={whatIDo.heading}
          tagColor="purple"
          date={journal.entries.services.date}
          page={journal.entries.services.page}
        />

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {whatIDo.items.map((item, i) => (
            <Reveal
              key={item.title}
              dir={i % 2 === 0 ? "right" : "left"}
              delay={(i % 4) * 0.07}
              className="h-full"
            >
              <div className="ink-edge--soft card-tilt flex h-full items-start gap-3 bg-paper-raised p-4">
                <ServiceIcon index={i} />
                <div>
                  <h3 className="font-marker text-lg leading-none text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                    {item.line}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceIcon({ index }: { index: number }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "mt-0.5 shrink-0 text-accent",
    "aria-hidden": true,
  };
  switch (index) {
    case 0:
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="14" rx="1.5" />
          <path d="M3 8 H21 M6 6.2 h0.01 M8 6.2 h0.01 M9 21 H15 M12 18 V21" />
        </svg>
      );
    case 1:
      return (
        <svg {...common}>
          <rect x="7" y="2.5" width="10" height="19" rx="2" />
          <path d="M11 18.5 H13" />
        </svg>
      );
    case 2:
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="5" rx="1" />
          <rect x="3" y="11" width="18" height="5" rx="1" />
          <path d="M6.5 6.5 h0.01 M6.5 13.5 h0.01 M10 19 h8" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 3 V6 M12 18 V21 M3 12 H6 M18 12 H21 M5.5 5.5 L7.6 7.6 M16.4 16.4 L18.5 18.5 M18.5 5.5 L16.4 7.6 M7.6 16.4 L5.5 18.5" />
        </svg>
      );
  }
}
