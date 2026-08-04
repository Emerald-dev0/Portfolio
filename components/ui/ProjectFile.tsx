"use client";

import { StickyTab } from "@/components/materials/StickyNote";
import InkBleed from "@/components/motion/InkBleed";
import type { Project } from "@/lib/content";

/**
 * Uniform grid project card (Feranmi-adapted): marker name + a handwritten
 * annotation breaking out the top-left, a tight two-sentence blurb, plain mono
 * tech tags, and one link at the bottom. A folded paper corner (dog-ear) peels
 * on hover for tactility. Even height across the grid; flagships get a subtle
 * accent ring.
 */
export default function ProjectFile({ project }: { project: Project }) {
  const external = project.href.startsWith("http");

  return (
    <a
      href={project.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`dogear ink-edge--soft card-tilt paper-stack group relative flex h-full flex-col bg-paper-raised p-5 ${
        project.featured ? "ring-1 ring-accent/30" : ""
      }`}
    >
      {/* the folded corner */}
      <span className="fold" aria-hidden />

      {/* corner annotation — handwritten, breaks out the top-left so it never
          collides with the status tag or gets clipped */}
      <span className="pointer-events-none absolute -top-3 left-4 z-20 rotate-[-3deg] font-pen text-base leading-none text-accent-2">
        {project.note}
      </span>

      {/* header: name + status */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-marker text-2xl leading-none text-ink">
          {project.name}
        </h3>
        <StickyTab color={project.tagColor === "marker" ? "yellow" : "purple"}>
          {project.tag}
        </StickyTab>
      </div>

      <p className="mt-2 text-[13px] font-medium leading-snug text-accent">
        <InkBleed>{project.oneLiner}</InkBleed>
      </p>

      <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-ink-muted">
        <InkBleed delay={0.08}>{project.blurb}</InkBleed>
      </p>

      {project.metric && (
        <p className="mt-2 font-mono text-[11px] text-accent-2">
          {project.metric}
        </p>
      )}

      {/* tech tags — plain mono, comma-free like a ledger */}
      <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1">
        {project.tech.map((t) => (
          <span key={t} className="font-mono text-[10.5px] text-ink-faint">
            {t}
          </span>
        ))}
      </div>

      {/* footer: role + link */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-rule pt-2.5">
        <span className="truncate font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
          {project.credit ? (
            <>
              {project.role}{" "}
              <span className="text-accent-2">{project.credit.linkText}</span>
            </>
          ) : (
            project.role
          )}
        </span>
        <span className="nav-underline shrink-0 font-mono text-[11px] lowercase tracking-wide text-ink transition-colors group-hover:text-accent">
          {project.cta} →
        </span>
      </div>
    </a>
  );
}
