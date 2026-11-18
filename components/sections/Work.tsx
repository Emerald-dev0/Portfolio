import { InkPoster } from "../ui/InkPoster";
import Link from "next/link";
import { Activity01Icon, ArrowUpRight01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { site } from "../../lib/config";
import {
  featuredProjects,
  moreProjects,
  workHeading,
  archiveHeading,
  type Project,
} from "../../lib/content";
import type { GithubSnapshot } from "../../lib/github";
import { Reveal } from "../motion/Reveal";
import { ProjectDeck } from "./ProjectDeck";
import { Clothesline } from "./Clothesline";
import { TiltCard } from "../motion/Loud";
import { Button } from "../ui/Button";
import { Doodle } from "../ui/Doodle";
import { Icon } from "../ui/Icon";
import { Section, SectionHeader } from "../ui/Section";

/**
 * WORK, the biggest section on the page.
 *
 * Featured four: an oversized poster panel with the real artwork, a taped
 * caption, the role I actually played, live GitHub stats, and an honest
 * footnote for anything not yet shipped. Archive: photo cards for every other
 * project that has a public home, each with both links.
 *
 * No invented URLs. A project without a repo simply has no GitHub link.
 */

const COLOR_BG: Record<Project["color"], string> = {
  leaf: "bg-leaf",
  tang: "bg-tang",
  grape: "bg-grape",
  lagoon: "bg-lagoon",
};

const COLOR_TEXT: Record<Project["color"], string> = {
  leaf: "text-bone",
  tang: "text-night",
  grape: "text-bone",
  lagoon: "text-night",
};

function findRepo(snapshot: GithubSnapshot, name: string | null) {
  if (!name) return null;
  const all = [...(snapshot.pins ?? []), ...(snapshot.recent ?? [])];
  return all.find((r) => r.name.toLowerCase() === name.toLowerCase()) ?? null;
}

function repoUrl(snapshot: GithubSnapshot, name: string | null): string | null {
  if (!name) return null;
  const repo = findRepo(snapshot, name);
  if (repo?.url) return repo.url;
  return `${site.github}/${name}`;
}

function LinkPill({
  href,
  children,
  filled = false,
}: {
  href: string;
  children: string;
  filled?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={`inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3.5 py-1.5 font-mono text-[0.68rem] font-bold uppercase tracking-[0.1em] transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--color-ink)] ${
        filled ? "bg-ink text-paper" : "bg-paper"
      }`}
    >
      {children}
      <Icon icon={ArrowUpRight01Icon} size={13} />
    </a>
  );
}

export function Work({ snapshot }: { snapshot: GithubSnapshot }) {
  return (
    <Section id="work" className="bg-paper">
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-20 sm:px-8 sm:pb-32 sm:pt-28">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeader
            pill={workHeading.label}
            title={workHeading.heading}
            copy={`${workHeading.intro} ${workHeading.closing}`}
          />
          <Reveal delay={0.2}>
            <div className="hidden rotate-[-3deg] flex-col items-end gap-2 sm:flex">
              <span className="label-pill">{workHeading.count}</span>
              <span className="label-pill">{workHeading.archiveCount}</span>
            </div>
          </Reveal>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Featured                                                          */}
        {/* ---------------------------------------------------------------- */}
        {/* Phones and tablets get the deal. Desktop gets the full spread below,
            because four cards fanned into a pile is a small-screen gesture. */}
        <div className="mt-12 lg:hidden">
          <ProjectDeck />
        </div>

        <div className="mt-16 hidden flex-col gap-16 lg:flex lg:gap-24">
          {featuredProjects.map((p, i) => {
            const repo = findRepo(snapshot, p.repo);
            const url = repoUrl(snapshot, p.repo);
            const flip = i % 2 === 1;

            return (
              <Reveal key={p.name}>
                <article className="relative">

                  <div className="relative z-10 grid items-stretch gap-6 lg:grid-cols-12 lg:gap-0">
                    {/* Poster */}
                    <div className={`lg:col-span-6 ${flip ? "lg:order-2" : ""}`}>
                      <TiltCard max={5} className="h-full">
                        <div className="sticker relative h-full overflow-hidden border-bone bg-night p-0">
                          <div className="relative aspect-square w-full">
                            <InkPoster
                              index={`0${i + 1}`}
                              name={p.name}
                              role={p.note}
                              crayon={p.color}
                            />
                          </div>

                          <span
                            className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1 font-mono text-[0.62rem] font-bold uppercase tracking-[0.12em] ${COLOR_BG[p.color]} ${COLOR_TEXT[p.color]}`}
                          >
                            <span className="size-1.5 rounded-full bg-current" />
                            {p.status}
                          </span>

                          <span className="absolute bottom-3 right-4 rotate-[-2deg] font-hand text-2xl font-bold text-bone drop-shadow-[2px_2px_0_rgba(0,0,0,0.6)]">
                            {p.note}
                          </span>

                          <span className="absolute -right-3 -top-4 grid size-12 place-items-center rounded-2xl border-[2.5px] border-ink bg-tang font-display text-base font-extrabold text-night shadow-[4px_4px_0_var(--color-ink)] sm:size-14 sm:text-lg">
                            0{i + 1}
                          </span>
                        </div>
                      </TiltCard>
                    </div>

                    {/* Story */}
                    <div
                      className={`flex flex-col justify-center lg:col-span-6 lg:px-10 ${
                        flip ? "lg:order-1" : ""
                      }`}
                    >
                      <h3 className="display-section text-[clamp(2.2rem,5vw,3.8rem)]">{p.name}</h3>
                      <p className="mt-1.5 font-hand text-2xl leading-tight muted">
                        {p.tagline}
                      </p>

                      <p className="mt-4 text-[1.0625rem] leading-relaxed muted">
                        {p.description}
                      </p>

                      <p className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1 font-mono text-[0.62rem] font-bold uppercase tracking-[0.1em]">
                        <span className="size-1.5 rounded-full bg-leaf" />
                        {p.role}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {p.stack.map((s) => (
                          <span key={s} className="chip text-[0.65rem]">
                            {s}
                          </span>
                        ))}
                      </div>

                      {p.footnote ? (
                        <p className="mt-4 max-w-xl border-l-2 border-ink/25 pl-3 text-xs leading-relaxed muted-soft">
                          {p.footnote}
                        </p>
                      ) : null}

                      <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2">
                        {p.liveUrl ? (
                          <LinkPill href={p.liveUrl} filled>
                            Live site
                          </LinkPill>
                        ) : null}
                        {url ? <LinkPill href={url}>Source</LinkPill> : null}
                        {repo ? (
                          <span className="ml-auto flex items-center gap-3.5 font-mono text-[0.65rem] font-bold uppercase tracking-[0.1em] muted-soft">
                            <span className="inline-flex items-center gap-1">
                              <Icon icon={StarIcon} size={12} />
                              {repo.stars}
                            </span>
                            {repo.commits != null ? (
                              <span className="inline-flex items-center gap-1">
                                <Icon icon={Activity01Icon} size={12} />
                                {repo.commits}
                              </span>
                            ) : null}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Archive                                                           */}
        {/* ---------------------------------------------------------------- */}
        <Reveal className="mt-28">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h3 className="display-section text-[clamp(2rem,4.5vw,3.2rem)]">
                {archiveHeading.label}
              </h3>
              <p className="mt-1.5 max-w-lg text-[0.95rem] muted">
                {archiveHeading.description}
              </p>
            </div>
            <Doodle name="squiggle" className="mb-2 hidden w-24 text-tang sm:block" strokeWidth={5} />
          </div>
        </Reveal>

        <div className="mt-12">
          <Clothesline projects={moreProjects} />
        </div>

        <Reveal className="mt-14 flex flex-wrap items-center justify-center gap-4">
          <Button href={site.github} variant="ink" external>
            Every repo on GitHub
            <Icon icon={ArrowUpRight01Icon} size={16} />
          </Button>
          <Link
            href="/#contact"
            className="font-mono text-xs font-bold uppercase tracking-[0.14em] underline decoration-2 underline-offset-4 transition hover:text-leaf"
          >
            or tell me what to build next
          </Link>
        </Reveal>
      </div>
    </Section>
  );
}
