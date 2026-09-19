"use client";

/**
 * ProjectPanel — a project as a comic panel.
 *
 * Every card is a framed panel: heavy ink border, a coloured spine along the
 * top, halftone shading in one corner, a panel number in the margin, and an ink
 * figure standing on the top edge. Pinned projects also carry their live
 * GitHub numbers (language, stars, commits, last push), because those are
 * facts that change and the panel should say so.
 *
 * The whole panel is clickable via a stretched link on the title (so body text
 * stays selectable), with the "view code" link sitting above it in the stack.
 */

import { Sticker } from "@/components/materials/Sticker";
import { Character } from "@/components/motion/Chibi";
import InkBleed from "@/components/motion/InkBleed";
import { compact } from "@/lib/format";
import { showcase, type Project } from "@/lib/content";

export default function ProjectPanel({
  project,
  index,
  priority = false,
}: {
  project: Project;
  /** 1-based position, printed in the margin like a comic page. */
  index: number;
  /** flagship panels get more room and a bigger figure */
  priority?: boolean;
}) {
  const external = project.href.startsWith("http");
  const live = project.live;
  const blank = Boolean(live?.isEmpty);

  return (
    <article
      className={`panel crayon-${project.crayon} group relative flex h-full flex-col p-5 pt-6 ${
        blank ? "panel--blank" : ""
      } ${priority ? "sm:p-6 sm:pt-7" : ""}`}
    >
      <span className="panel__shade" aria-hidden />
      <span className="panel__spine" aria-hidden />

      {/* an ink figure stands on the top edge of the panel */}
      {project.character && (
        <span
          aria-hidden
          className="pointer-events-none absolute -top-[26px] right-4 z-10 origin-bottom -rotate-3 transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-0"
        >
          <Character
            id={project.character}
            size={priority ? 54 : 44}
            busy={!priority}
            title=""
          />
        </span>
      )}

      {/* margin: where it lives on GitHub, then the status sticker */}
      <div className="flex items-start justify-between gap-3">
        <span className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          {project.live ? project.slug : "selected work"}
        </span>
        <Sticker crayon={project.crayon} rotate={index % 2 ? 1.6 : -1.6}>
          {project.tag}
        </Sticker>
      </div>

      {/* the handwritten note, written across the top-left of the panel */}
      {project.note && (
        <span className="margin-note mt-3 inline-block -rotate-1 text-crayon">
          {project.note}
        </span>
      )}

      <h3
        className={`font-marker leading-[1.05] text-ink ${
          priority ? "mt-1 text-[clamp(1.6rem,3.4vw,2.2rem)]" : "mt-1 text-2xl"
        }`}
      >
        <a
          href={project.href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="hover-crayon relative after:absolute after:inset-0 after:content-['']"
        >
          {project.name}
        </a>
      </h3>

      <p className="mt-2 text-[13.5px] font-semibold leading-snug text-crayon">
        <InkBleed>{project.oneLiner}</InkBleed>
      </p>

      <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-ink-muted">
        <InkBleed delay={0.06}>{project.blurb}</InkBleed>
      </p>

      {blank && (
        <p className="mt-3 font-pen text-lg text-ink-faint">
          {showcase.emptyNote}
        </p>
      )}

      {/* tech as ledger chips */}
      {project.tech.length > 0 && (
        <ul className="mt-3.5 flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <li
              key={t}
              className="rounded-[4px_2px_5px_3px] border border-ink/15 bg-paper/60 px-1.5 py-0.5 font-mono text-[10px] text-ink-muted"
            >
              {t}
            </li>
          ))}
        </ul>
      )}

      {/* live GitHub numbers — only for repos that have them */}
      {live && !blank && (
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10.5px] text-ink-faint">
          {live.language && !project.tech.includes(live.language) && (
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 rounded-full border border-ink/30"
                style={{ background: live.languageColor ?? "var(--color-ink-faint)" }}
              />
              {live.language}
            </span>
          )}
          {live.stars > 0 && <span>★ {compact(live.stars)}</span>}
          {live.commits !== null && live.commits > 0 && (
            <span>{compact(live.commits)} commits</span>
          )}
          {live.pushedLabel && <span>updated {live.pushedLabel}</span>}
        </p>
      )}

      {/* footer: who did what, and where to go */}
      <div className="mt-4 flex items-end justify-between gap-3 border-t border-rule pt-3">
        <span className="min-w-0 font-mono text-[10px] uppercase leading-tight tracking-[0.1em] text-ink-faint">
          {project.role ? (
            <>
              {project.role}{" "}
              {project.credit && (
                <a
                  href={project.credit.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-20 text-crayon underline decoration-dotted underline-offset-2"
                >
                  {project.credit.linkText}
                </a>
              )}
            </>
          ) : (
            project.owner ?? ""
          )}
        </span>

        <span className="flex shrink-0 items-center gap-3 font-mono text-[11px]">
          {project.codeHref && (
            <a
              href={project.codeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-20 text-ink-muted underline decoration-dotted underline-offset-2 hover:text-ink"
              aria-label={`${project.name} source code on GitHub`}
            >
              code
            </a>
          )}
          <span className="nav-underline lowercase tracking-wide text-ink group-hover-crayon">
            {project.cta} →
          </span>
        </span>
      </div>
    </article>
  );
}
