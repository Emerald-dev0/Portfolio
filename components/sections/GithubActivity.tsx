"use client";

/**
 * GitHub activity — the proof section.
 *
 * Three things, all read from the API rather than claimed: a year of
 * contributions drawn as ink squares, the totals behind it, and the language
 * split across every public repository. This section exists so the page can
 * make its argument with numbers instead of adjectives.
 *
 * It also owns `#stack`, which the nav points at.
 */

import SectionHeader from "@/components/ui/SectionHeader";
import { Tape } from "@/components/materials/Tape";
import Doodle from "@/components/materials/Doodle";
import ContributionGraph from "@/components/ui/ContributionGraph";
import { Reveal } from "@/components/motion/Reveal";
import { githubSection, stack } from "@/lib/content";
import type { Showcase } from "@/lib/projects";

export default function GithubActivity({ showcase }: { showcase: Showcase }) {
  const { totals } = showcase;
  const contributions = showcase.contributions;

  const cards = [
    { value: totals.publicRepos, label: "public repositories" },
    { value: totals.stars, label: "stars" },
    { value: totals.commits, label: "commits in pinned work" },
    { value: totals.followers, label: "followers" },
  ];

  const languages = totals.languages ?? [];
  const languageTotal = languages.reduce((sum, l) => sum + l.repos, 0) || 1;

  return (
    <section id="stack" className="section-pad relative !pt-16">
      <AmbientFieldLite />

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <SectionHeader
          tag={githubSection.tag}
          heading={githubSection.heading}
          sticky={githubSection.note}
          scribble="zigzag"
        />

        {/* ---------------- the graph ---------------- */}
        {contributions ? (
          <Reveal dir="up" delay={0.08}>
            <div className="crayon-green ink-edge paper-stack relative mt-9 bg-paper-raised p-5 sm:p-6 md:rotate-[-0.3deg]">
              <Tape
                className="absolute -top-3 left-10 z-10"
                rotate={-5}
                tone="yellow"
                width={84}
              />
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="font-marker text-lg leading-none text-ink">
                  {githubSection.contributionsLabel}
                </p>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                  {contributions.from} to {contributions.to}
                </span>
              </div>
              <ContributionGraph
                contributions={contributions}
                login={totals.login}
                generatedLabel={totals.generatedLabel}
              />
            </div>
          </Reveal>
        ) : (
          <Reveal dir="up" delay={0.08}>
            <p className="mt-9 rounded-[10px_7px_11px_8px] border border-dashed border-ink/25 bg-paper-raised/60 p-4 font-mono text-[11px] text-ink-muted">
              The contribution graph needs a GitHub token to sync. Set
              GITHUB_TOKEN and run `npm run sync:github`.
            </p>
          </Reveal>
        )}

        {/* ---------------- the totals ---------------- */}
        <Reveal dir="up" delay={0.12}>
          <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {cards.map((c) => (
              <div
                key={c.label}
                className="ink-edge--soft flex flex-col bg-paper-raised p-4"
              >
                <dt className="sr-only">{c.label}</dt>
                <dd>
                  <span className="block font-marker text-[clamp(1.6rem,3.4vw,2.2rem)] leading-none text-ink">
                    {c.value.toLocaleString()}
                  </span>
                  <span className="mt-1.5 block font-mono text-[10px] uppercase leading-tight tracking-[0.1em] text-ink-faint">
                    {c.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* ---------------- languages + stack ---------------- */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_0.85fr]">
          <Reveal dir="up" delay={0.14}>
            <div className="ink-edge--soft paper-stack h-full bg-paper-raised p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-marker text-lg leading-none text-ink">
                  {githubSection.languagesLabel}
                </p>
                <span className="page-num">{languages.length} LANGUAGES</span>
              </div>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                {githubSection.languagesNote}
              </p>

              <div
                className="mt-4 flex h-9 w-full overflow-hidden rounded-[6px_4px_7px_5px] border-2 border-ink"
                role="img"
                aria-label={languages
                  .map((l) => `${l.name}: ${l.repos} repositories`)
                  .join(", ")}
              >
                {languages.map((l) => (
                  <span
                    key={l.name}
                    className="h-full"
                    style={{
                      flexGrow: l.repos,
                      background: l.color ?? "var(--color-ink-faint)",
                    }}
                    title={`${l.name}: ${l.repos} repositories`}
                  />
                ))}
              </div>

              <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
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
            </div>
          </Reveal>

          <Reveal dir="up" delay={0.16}>
            <div className="crayon-teal ink-edge--soft paper-stack h-full bg-paper-raised p-5">
              <p className="font-marker text-lg leading-none text-ink">
                What I build with
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                {stack.note}
              </p>

              <div className="mt-4 space-y-3">
                {stack.groups.map((g) => (
                  <div key={g.label}>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-crayon">
                      {g.label}
                    </p>
                    <ul className="mt-1.5 flex flex-wrap gap-1.5">
                      {g.items.map((item) => (
                        <li
                          key={item}
                          className="rounded-[4px_2px_5px_3px] border border-ink/15 bg-paper/60 px-2 py-0.5 font-mono text-[10.5px] text-ink-muted"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {totals.lastPushLabel && (
                <p className="mt-4 flex items-center gap-2 border-t border-rule pt-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-faint">
                  <span className="live-dot" aria-hidden />
                  {githubSection.lastPushPrefix} {totals.lastPushLabel}
                </p>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Two drifting doodles, without pulling in the whole ambient field. */
function AmbientFieldLite() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden md:block"
    >
      <Doodle
        name="coffee"
        size={26}
        className="animate-drift delay-1 absolute left-[3%] top-[22%] text-ink-faint/40"
      />
      <Doodle
        name="wifi"
        size={24}
        className="animate-float delay-2 absolute right-[4%] bottom-[20%] text-accent-2/45"
      />
    </div>
  );
}
