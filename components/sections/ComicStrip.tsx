"use client";

/**
 * THE COMIC STRIP — one evening, in three panels.
 *
 * Every panel is hand-drawn SVG on the same little stage: a desk, a laptop, a
 * stool, a wall clock. Only three things change between panels — what's on the
 * screen, what the figure is doing with their arms, and what's floating over
 * their head. That's how the books do it too: same doodle, different face.
 *
 * Captions sit in a bar at the bottom of each panel, the way a comic strip
 * would put them, and the timestamp is the punchline's setup.
 */

import SectionHeader from "@/components/ui/SectionHeader";
import { Sticker } from "@/components/materials/Sticker";
import AmbientField from "@/components/motion/AmbientField";
import { Reveal } from "@/components/motion/Reveal";
import { comicStrip, journal } from "@/lib/content";

type Mood = (typeof comicStrip.panels)[number]["mood"];

/* --------------------------------------------------------------------------
 * The stage — everything that stays the same in all three panels.
 * ------------------------------------------------------------------------ */
function Stage({ mood, time }: { mood: Mood; time: string }) {
  const screen =
    mood === "typing" ? (
      <g strokeWidth={1.6}>
        <path d="M120 80 h26 M120 86 h20 M120 92 h24" />
      </g>
    ) : mood === "error" ? (
      <g strokeWidth={2}>
        {/* the screen has grown spikes */}
        <path d="M133 74 l4 -6 l4 6 l5 -5 l1 7 l7 -3 l-3 7 l7 2 l-6 5 l6 5 l-7 2 l3 7 l-7 -3 l-1 7 l-5 -5 l-4 6 l-4 -6 l-5 5 l-1 -7 l-7 3 l3 -7 l-7 -2 l6 -5 l-6 -5 l7 -2 l-3 -7 l7 3 l1 -7 l5 5 z" />
      </g>
    ) : (
      <g strokeWidth={2.2}>
        <path d="M124 88 l6 7 l13 -16" />
      </g>
    );

  const arms =
    mood === "typing" ? (
      <g strokeWidth={2.4}>
        <path d="M74 72 L104 90" />
        <path d="M76 78 L110 94" />
      </g>
    ) : mood === "error" ? (
      <g strokeWidth={2.4} style={{ transformOrigin: "74px 72px", animation: "sway 1.8s ease-in-out infinite" }}>
        <path d="M74 72 L58 56" />
        <path d="M78 74 L94 54" />
      </g>
    ) : (
      <g strokeWidth={2.4}>
        <path d="M74 72 L86 48" />
        <path d="M78 78 L100 88" />
      </g>
    );

  const face =
    mood === "typing" ? (
      <g strokeWidth={1.8}>
        <circle cx="68" cy="50" r="1.6" fill="currentColor" />
        <circle cx="80" cy="50" r="1.6" fill="currentColor" />
        <path d="M69 57 q5 2 9 -0.5" />
      </g>
    ) : mood === "error" ? (
      <g strokeWidth={1.9}>
        <path d="M64 46 l6 3 M84 46 l-6 3" />
        <circle cx="68" cy="51" r="1.6" fill="currentColor" />
        <circle cx="80" cy="51" r="1.6" fill="currentColor" />
        <path d="M68 60 q6 -3 12 1" />
      </g>
    ) : (
      <g strokeWidth={1.8}>
        <circle cx="68" cy="50" r="1.6" fill="currentColor" />
        <circle cx="80" cy="50" r="1.6" fill="currentColor" />
        <circle cx="74" cy="58" r="2.6" fill="currentColor" stroke="none" />
      </g>
    );

  return (
    <>
      {/* wall clock — the only thing in the room that's honest */}
      <g strokeWidth={1.8}>
        <circle cx="26" cy="24" r="10" />
        <path d="M26 24 L26 18 M26 24 L31 26" />
      </g>
      <text
        x="26"
        y="43"
        textAnchor="middle"
        fontSize="8"
        fontFamily="var(--font-mono)"
        fill="currentColor"
        stroke="none"
        opacity="0.7"
      >
        {time}
      </text>

      {/* desk + laptop */}
      <g strokeWidth={2.2}>
        <path d="M8 100 H192" />
        <path d="M26 100 L20 124 M174 100 L180 124" />
        {/* laptop */}
        <rect x="112" y="74" width="44" height="26" rx="2" />
        <path d="M106 100 h56" strokeWidth={2.6} />
      </g>
      {screen}

      {/* stool + the figure */}
      <g strokeWidth={2.4}>
        <path d="M62 100 v10 M86 100 v10 M62 105 h24" strokeWidth={2} />
        <circle cx="74" cy="52" r="13" />
        <path d="M74 65 L74 88" />
        <path d="M74 88 L62 96 M74 88 L84 96" />
      </g>
      {face}
      <path d="M78 55 l4 3" strokeWidth={1.6} />
      {arms}

      {/* the coffee, which is either fine or absolutely not */}
      {mood === "error" ? (
        <g strokeWidth={2}>
          <path d="M148 92 l10 -6 l3 6 z" fill="var(--crayon, var(--color-accent))" opacity="0.6" />
          <path d="M140 100 q10 -4 22 -1" strokeWidth={1.6} opacity="0.6" />
        </g>
      ) : (
        <g strokeWidth={2}>
          <path d="M150 92 h10 v6 a5 5 0 0 1 -10 0 z" />
          <path d="M160 94 h3 a2.5 2.5 0 0 1 0 5 h-3" />
        </g>
      )}

      {/* whatever is happening above the figure's head */}
      {mood === "error" && (
        <g
          strokeWidth={2}
          opacity="0.75"
          style={{ transformOrigin: "74px 26px", animation: "sway 2.4s ease-in-out infinite" }}
        >
          <path d="M56 22 q10 -8 20 0 q10 8 18 -2 M62 32 q9 -7 18 0 q9 7 16 -3" />
        </g>
      )}
      {mood === "aha" && (
        <g strokeWidth={2} style={{ animation: "float-soft 2.6s ease-in-out infinite" }}>
          <path d="M74 12 a6 6 0 0 1 3.4 11 c-.5.4-.8 1-.8 1.6v.6 h-5.2 v-.6 c0-.6-.3-1.2-.8-1.6 A6 6 0 0 1 74 12 Z" fill="var(--crayon, var(--color-marker))" />
          <path d="M71.6 27.6 h4.8 M72.6 30.4 h2.8" />
          <path d="M58 14 l-4 -4 M90 14 l4 -4 M74 6 v-5" strokeWidth={1.6} opacity="0.7" />
        </g>
      )}
    </>
  );
}

/* --------------------------------------------------------------------------
 * One panel: the drawing, a frame, and the caption bar underneath.
 * ------------------------------------------------------------------------ */
function Panel({
  index,
  mood,
  time,
  caption,
  bubble,
}: {
  index: number;
  mood: Mood;
  time: string;
  caption: string;
  bubble?: string;
}) {
  const crayons = ["crayon-blue", "crayon-oxblood", "crayon-green"] as const;

  return (
    <figure
      className={`panel ${crayons[index % crayons.length]} flex h-full flex-col`}
    >
      <span className="panel__shade" aria-hidden />
      <span className="panel__spine" aria-hidden />

      <div className="flex items-center justify-between px-4 pt-4">
        <span className="panel__num">PANEL {index + 1}</span>
        <span className="page-num">THE DESK, {time}</span>
      </div>

      <div className="relative mx-4 mt-1 flex-1">
        <svg
          viewBox="0 0 200 130"
          className="h-auto w-full text-ink/85"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <Stage mood={mood} time={time} />
        </svg>

        {bubble && (
          <span className="bubble bubble--right absolute -bottom-2 right-1 max-w-[85%] rotate-[-1deg] text-[15px]">
            {bubble}
          </span>
        )}
      </div>

      <figcaption className="mt-4 border-t-2 border-ink bg-paper/70 px-4 py-2.5 font-mono text-[11px] leading-snug tracking-[0.02em] text-ink">
        {caption}
      </figcaption>
    </figure>
  );
}

export default function ComicStrip() {
  const entry = journal.entries.comic;

  return (
    <section id="comic" className="section-pad relative overflow-hidden">
      <AmbientField
        marks={[
          { name: "coffee", className: "left-[4%] top-[16%]", size: 26, anim: "drift", delay: 1, color: "text-ink-faint/45" },
          { name: "bug", className: "right-[5%] bottom-[14%]", size: 24, anim: "float", delay: 2, color: "text-accent/45" },
        ]}
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <SectionHeader
          tag={comicStrip.tag}
          heading={comicStrip.heading}
          sticky={comicStrip.note}
          tagColor="orange"
          date={entry.date}
          page={entry.page}
        />

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-5">
          {comicStrip.panels.map((panel, i) => (
            <Reveal key={panel.caption} dir="up" delay={i * 0.12} className="h-full">
              <Panel
                index={i}
                mood={panel.mood}
                time={panel.time}
                caption={panel.caption}
                bubble={"bubble" in panel ? panel.bubble : undefined}
              />
            </Reveal>
          ))}
        </div>

        <Reveal dir="up" delay={0.2}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Sticker crayon="ink" rotate={-2}>
              {comicStrip.moral}
            </Sticker>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
