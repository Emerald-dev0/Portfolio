"use client";

/**
 * ContributionGraph — a year of commits, drawn on paper.
 *
 * The data is the same calendar GitHub renders in the profile sidebar, read
 * from the API (see lib/github.ts). It is stored as a list of (date, count) for
 * days that had activity; the empty squares are generated here, which keeps the
 * payload small and means a gap in the year shows up as a gap.
 *
 * Squares use the site's own green rather than GitHub's palette, so it reads as
 * part of the notebook and not as an embedded widget. Levels are relative to
 * this account's busiest day, so the shading is honest across the whole year.
 */

import { useMemo } from "react";
import type { Contributions } from "@/lib/github";
import { compact } from "@/lib/format";

const WEEKS = 53;

/** Four levels of ink for one square, from "nothing" to "that was a big day". */
const LEVEL_FILL = [
  "color-mix(in srgb, var(--color-rule) 45%, transparent)",
  "color-mix(in srgb, var(--color-crayon-green) 26%, transparent)",
  "color-mix(in srgb, var(--color-crayon-green) 50%, transparent)",
  "color-mix(in srgb, var(--color-crayon-green) 72%, transparent)",
  "var(--color-crayon-green)",
];

type Cell = { date: string; count: number };

/** Build a 53×7 grid ending on the calendar's last day. */
function buildGrid(contributions: Contributions): Cell[][] {
  const counts = new Map(contributions.active);
  const end = new Date(`${contributions.to}T00:00:00Z`);
  const total = contributions.totalDays;

  // walk back to the Sunday that starts the first column of the last 53 weeks
  const cells: Cell[] = [];
  for (let i = total - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setUTCDate(d.getUTCDate() - i);
    const iso = d.toISOString().slice(0, 10);
    cells.push({ date: iso, count: counts.get(iso) ?? 0 });
  }

  // pad the front so column 0 starts on a Sunday
  const firstDow = new Date(`${cells[0].date}T00:00:00Z`).getUTCDay();
  for (let i = 0; i < firstDow; i++) cells.unshift({ date: "", count: -1 });

  const columns: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) columns.push(cells.slice(i, i + 7));
  return columns.slice(-WEEKS);
}

export default function ContributionGraph({
  contributions,
  login,
  generatedLabel,
}: {
  contributions: Contributions;
  login: string;
  generatedLabel: string | null;
}) {
  const { columns, monthLabels, levelOf, max } = useMemo(() => {
    const cols = buildGrid(contributions);
    const peak = Math.max(
      contributions.busiestDay?.count ?? 1,
      ...contributions.active.map(([, n]) => n),
    );

    const level = (count: number) => {
      if (count <= 0) return 0;
      const ratio = count / peak;
      if (ratio > 0.66) return 4;
      if (ratio > 0.33) return 3;
      if (ratio > 0.12) return 2;
      return 1;
    };

    // one label per month, placed on the column where it first appears
    const labels: { index: number; label: string }[] = [];
    let lastMonth = "";
    cols.forEach((col, i) => {
      const firstReal = col.find((c) => c.date);
      if (!firstReal) return;
      const month = firstReal.date.slice(0, 7);
      if (month !== lastMonth) {
        const d = new Date(`${firstReal.date}T00:00:00Z`);
        const name = d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });
        // don't crowd the first column or repeat within four weeks
        if (i === 0 || (labels.length && i - labels[labels.length - 1].index < 4)) {
          lastMonth = month;
          return;
        }
        labels.push({ index: i, label: name });
        lastMonth = month;
      }
    });

    return { columns: cols, monthLabels: labels, levelOf: level, max: peak };
  }, [contributions]);

  return (
    <figure className="w-full">
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[640px]">
          {/* month labels */}
          <div className="relative mb-1 h-4">
            {monthLabels.map((m) => (
              <span
                key={`${m.label}-${m.index}`}
                className="absolute font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint"
                style={{ left: `${(m.index / columns.length) * 100}%` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-[3px]">
            {columns.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-[3px]">
                {col.map((cell, ri) => (
                  <span
                    key={`${ci}-${ri}`}
                    title={
                      cell.date
                        ? `${cell.date}: ${cell.count} contribution${cell.count === 1 ? "" : "s"}`
                        : undefined
                    }
                    className="h-[11px] w-[11px] rounded-[2px] border border-ink/10"
                    style={{ background: LEVEL_FILL[levelOf(cell.count)] }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-ink-muted">
          <span className="font-marker text-lg text-ink">
            {contributions.total.toLocaleString()}
          </span>{" "}
          contributions in the last year, across{" "}
          <span className="text-ink">{contributions.activeDays}</span> days.
        </p>

        <a
          href={`https://github.com/${login}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint hover:text-accent"
        >
          {generatedLabel ? `synced ${generatedLabel}` : "synced"} · github.com/{login}
        </a>
      </figcaption>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-rule pt-3 font-mono text-[10.5px] text-ink-muted">
        <span>
          longest streak{" "}
          <span className="text-ink">{contributions.longestStreak} days</span>
        </span>
        <span>
          current streak{" "}
          <span className="text-ink">{contributions.currentStreak} days</span>
        </span>
        {contributions.busiestDay && (
          <span>
            busiest day{" "}
            <span className="text-ink">
              {contributions.busiestDay.count} on {contributions.busiestDay.date}
            </span>
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-1.5">
          less
          {LEVEL_FILL.map((fill, i) => (
            <span
              key={i}
              aria-hidden
              className="inline-block h-[10px] w-[10px] rounded-[2px] border border-ink/10"
              style={{ background: fill }}
            />
          ))}
          more
          <span className="ml-1 text-ink-faint">(peak {compact(max)})</span>
        </span>
      </div>
    </figure>
  );
}
