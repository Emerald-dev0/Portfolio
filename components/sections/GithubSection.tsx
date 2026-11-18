import { ArrowUpRight01Icon, Github01Icon } from "@hugeicons/core-free-icons";
import { site } from "../../lib/config";
import { githubSection } from "../../lib/content";
import { describeProvenance, type GithubSnapshot } from "../../lib/github";
import { Reveal } from "../motion/Reveal";
import { Button } from "../ui/Button";
import { ContributionGraph } from "../ui/ContributionGraph";
import { Doodle } from "../ui/Doodle";
import { Icon } from "../ui/Icon";
import { Section, SectionHeader } from "../ui/Section";
import { NumberTicker } from "../motion/Motion";

/**
 * GITHUB, proof of work. A dark panel with the contribution heatmap on a
 * paper card, the pinned repos as sticker cards, and one Follow CTA.
 * Data comes from the server snapshot (live API → committed snapshot →
 * fallback), so this section never breaks and never shows stale claims
 * without saying so (see the provenance note).
 */
export function GithubSection({ snapshot }: { snapshot: GithubSnapshot }) {
  const { stats, contributions, pins } = snapshot;

  return (
    <Section id="github" className="pattern-dots-light bg-night text-bone">
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-20 sm:px-8 sm:pb-36 sm:pt-28">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeader
            pill={githubSection.label}
            title={githubSection.heading}
            copy={githubSection.body.join(" ")}
          />
          <Reveal>
            <div className="flex flex-wrap gap-3">
              <span className="chip">
                <NumberTicker value={stats.publicRepos} /> public repositories
              </span>
              {contributions ? (
                <>
                  <span className="chip">
                    {contributions.total.toLocaleString()} contributions / year
                  </span>
                  <span className="chip">{contributions.activeDays} active days</span>
                </>
              ) : null}
            </div>
          </Reveal>
        </div>

        {contributions ? (
          <Reveal className="mt-14">
            <div className="sticker p-5 text-ink sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-xs font-bold uppercase tracking-[0.14em]">
                  <NumberTicker value={contributions.total} /> contributions in the last year
                </p>
                <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ink/50">
                  {describeProvenance(snapshot)}
                </p>
              </div>
              <div className="mt-5">
                <ContributionGraph contributions={contributions} />
              </div>
            </div>
          </Reveal>
        ) : null}

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pins.map((r) => (
            <Reveal key={r.slug}>
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer noopener"
                className="sticker group block h-full p-6 text-ink transition duration-200 hover:-translate-y-1.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-extrabold">{r.name}</h3>
                  <Icon
                    icon={ArrowUpRight01Icon}
                    size={17}
                    className="shrink-0 opacity-50 transition group-hover:opacity-100"
                  />
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed opacity-75">
                  {r.description ?? "No description yet, the code speaks."}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-4 font-mono text-xs font-bold uppercase tracking-wider opacity-70">
                  {r.language ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="size-2.5 rounded-full border border-ink/30"
                        style={{ background: r.languageColor ?? "var(--color-ink)" }}
                      />
                      {r.language}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1.5">
                    <Doodle name="star" className="w-3.5" strokeWidth={7} />
                    {r.stars}
                  </span>
                  <span>{r.forks} forks</span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 flex flex-col items-center gap-4 text-center">
          <Button href={site.github} variant="leaf" external>
            <Icon icon={Github01Icon} size={18} />
            {githubSection.cta}: {site.githubHandle}
          </Button>
          <p className="font-hand text-2xl opacity-80">new pins appear here automatically</p>
        </Reveal>
      </div>
    </Section>
  );
}
