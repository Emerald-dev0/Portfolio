"use client";

/**
 * Receipts — the stack section, but instead of a list of logos it shows the
 * numbers the GitHub API actually reports: repositories, stars, pinned work,
 * and the languages spread across the whole account. Every figure here is
 * read, never written. There is no "10x engineer" badge, because that would be
 * a lie, and the one thing this page refuses to do is lie.
 *
 * This section also owns `#stack`, which the nav has been pointing at since
 * the beginning.
 */

import SectionHeader from "@/components/ui/SectionHeader";
import { Tape } from "@/components/materials/Tape";
import Doodle from "@/components/materials/Doodle";
import { Character } from "@/components/motion/Chibi";
import AmbientField from "@/components/motion/AmbientField";
import { Reveal } from "@/components/motion/Reveal";
import { stack } from "@/lib/content";
import type { Showcase } from "@/lib/projects";

export default function Receipts({ showcase }: { showcase: Showcase }) {
  const { totals } = showcase;

  const cards = [
    { value: totals.publicRepos, label: "public repositories" },
    { value: totals.stars, label: "stars earned" },
    { value: totals.pinned, label: "pinned right now" },
    { value: totals.commits, label: "commits in pinned work" },
  ];

  const languages = totals.languages ?? [];
  const languageTotal = languages.reduce((sum, l) => sum + l.repos, 0) || 1;

  return (
    <section id="stack" className="section-pad relative !pt-16">
      <AmbientField
        marks={[
          { name: "coffee", className: "left-[3%] top-[22%]", size: 26, anim: "drift", delay: 1, color: "text-ink-faint/40" },
          { name: "wifi", className: "right-[4%] bottom-[20%]", size: 24, anim: "float", delay: 2, color: "text-accent-2/45" },
          { name: "lightbulb", className: "right-[8%] top-[10%]", size: 26, anim: "sway", color: "text-accent/45" },
        ]}
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <SectionHeader
          tag={stack.tag}
          heading={stack.heading}
          sticky={stack.note}
          scribble="zigzag"
        />

        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          {/* ---------------- the receipts card ---------------- */}
          <Reveal dir="right">
            <div className="crayon-blue relative h-full">
              <div className="ink-edge paper-stack relative h-full bg-paper-raised p-5 md:rotate-[-0.5deg]">
                <Tape className="absolute -top-3 left-10 z-10" rotate={-5} tone="yellow" width={84} />

                <p className="font-pen text-2xl text-accent-2">
                  the receipts
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                  read from the GitHub API · {totals.sourceLabel}
                </p>

                <dl className="mt-5 grid grid-cols-2 gap-4">
                  {cards.map((c) => (
                    <div key={c.label}>
                      <dt className="sr-only">{c.label}</dt>
                      <dd>
                        <span className="block font-marker text-[clamp(1.8rem,4vw,2.6rem)] leading-none text-ink">
                          {c.value}
                        </span>
                        <span className="mt-1 block font-mono text-[10px] uppercase leading-tight tracking-[0.1em] text-ink-faint">
                          {c.label}
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="ink-rule my-5" />

                <p className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-muted sm:pr-20">
                  <Doodle name="bug" size={20} className="mt-0.5 shrink-0 text-accent" />
                  {totals.lastPushLabel
                    ? `Last push was ${totals.lastPushLabel}. The green squares stay green or the whole thing is a lie.`
                    : "Commit graph reads like a heartbeat. Mostly healthy, occasionally alarming."}
                </p>

                {/* the little guy keeping the books */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-3 right-4 hidden sm:block"
                >
                  <Character id="nova" size={64} busy />
                </span>
              </div>
            </div>
          </Reveal>

          {/* ---------------- what I actually write ---------------- */}
          <Reveal dir="left" delay={0.1}>
            <div className="ink-edge--soft paper-stack relative h-full bg-paper-raised p-5">
              <p className="font-pen text-2xl text-accent-2">
                what I actually write
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
                Every public repo, counted by its primary language. No framing,
                no “full-stack everything”.
              </p>

              {/* the stacked bar — one band per language, real proportions */}
              <div
                className="mt-5 flex h-9 w-full overflow-hidden rounded-[6px_4px_7px_5px] border-2 border-ink"
                role="img"
                aria-label={languages
                  .map((l) => `${l.name}: ${l.repos} repos`)
                  .join(", ")}
              >
                {languages.map((l) => (
                  <span
                    key={l.name}
                    className="h-full transition-[flex-grow] duration-500"
                    style={{
                      flexGrow: l.repos,
                      background: l.color ?? "var(--color-ink-faint)",
                    }}
                    title={`${l.name} — ${l.repos} repos`}
                  />
                ))}
              </div>

              <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {languages.slice(0, 8).map((l) => (
                  <li
                    key={l.name}
                    className="flex items-center gap-2 font-mono text-[11px] text-ink-muted"
                  >
                    <span
                      aria-hidden
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-ink/30"
                      style={{ background: l.color ?? "var(--color-ink-faint)" }}
                    />
                    <span className="truncate text-ink">{l.name}</span>
                    <span className="ml-auto text-ink-faint">
                      {Math.round((l.repos / languageTotal) * 100)}%
                    </span>
                  </li>
                ))}
              </ul>

              <div className="ink-rule my-4" />

              <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
                {stack.groups.flatMap((g) => g.items).map((item) => (
                  <li
                    key={item}
                    className="rounded-[4px_2px_5px_3px] border border-ink/15 bg-paper/60 px-2 py-0.5 font-mono text-[10.5px] text-ink-muted"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-pen text-base text-accent-2">
                most comfortable with MongoDB, and it shows
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
