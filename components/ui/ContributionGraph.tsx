import type { Contributions } from "../../lib/github";

/**
 * CONTRIBUTION GRAPH, a year of commits as a heatmap, drawn in the sticker
 * language: ink-bordered squares shaded in leaf greens, sitting on a paper
 * card. Data is the same calendar GitHub renders on the profile, read
 * server-side (see lib/github.ts). Levels are relative to this account's
 * busiest day, so the shading stays honest across the whole year.
 * Server component, no interactivity needed, squares carry title tooltips.
 */

const WEEKS = 53;

const LEVEL_CLASS = [
  "bg-ink/10",
  "bg-leaf/25",
  "bg-leaf/50",
  "bg-leaf/75",
  "bg-leaf",
];

type Cell = { date: string; count: number };

/** Build a 53×7 grid ending on the calendar's last day. */
function buildGrid(contributions: Contributions): Cell[][] {
  const counts = new Map(contributions.active);
  const end = new Date(`${contributions.to}T00:00:00Z`);
  const total = contributions.totalDays;

  const cells: Cell[] = [];
  for (let i = total - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setUTCDate(d.getUTCDate() - i);
    const iso = d.toISOString().slice(0, 10);
    cells.push({ date: iso, count: counts.get(iso) ?? 0 });
  }

  // Pad the front so column 0 starts on a Sunday.
  const firstDow = new Date(`${cells[0].date}T00:00:00Z`).getUTCDay();
  for (let i = 0; i < firstDow; i++) cells.unshift({ date: "", count: -1 });

  const columns: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) columns.push(cells.slice(i, i + 7));
  return columns.slice(-WEEKS);
}

export function ContributionGraph({ contributions }: { contributions: Contributions }) {
  const columns = buildGrid(contributions);
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

  // One month label per month, on the column where it first appears.
  const monthLabels: (string | null)[] = columns.map((col, i) => {
    const firstReal = col.find((c) => c.date);
    if (!firstReal) return null;
    const month = firstReal.date.slice(0, 7);
    const prev = columns
      .slice(0, i)
      .map((c) => c.find((x) => x.date)?.date.slice(0, 7))
      .filter(Boolean)
      .pop();
    if (month === prev) return null;
    const d = new Date(`${firstReal.date}T00:00:00Z`);
    return d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });
  });

  return (
    <div>
      <div className="flex gap-[3px]" aria-hidden="true">
        {monthLabels.map((label, i) => (
          <span key={i} className="w-[11px] shrink-0 font-mono text-[9px] font-bold uppercase text-ink/50">
            {label ?? ""}
          </span>
        ))}
      </div>
      <div
        className="mt-1 flex gap-[3px] overflow-x-auto pb-1"
        role="img"
        aria-label={`${contributions.total.toLocaleString()} contributions in the last year, across ${contributions.activeDays} active days`}
      >
        {columns.map((col, i) => (
          <div key={i} className="flex shrink-0 flex-col gap-[3px]">
            {col.map((cell, j) =>
              cell.date ? (
                <span
                  key={j}
                  className={`size-[11px] rounded-[3px] border border-ink/15 ${LEVEL_CLASS[level(cell.count)]}`}
                  title={`${cell.date}: ${cell.count} contribution${cell.count === 1 ? "" : "s"}`}
                />
              ) : (
                <span key={j} className="size-[11px]" />
              ),
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 font-mono text-[0.65rem] font-bold uppercase tracking-widest text-ink/50">
        Less
        {LEVEL_CLASS.map((cls, i) => (
          <span key={i} className={`size-[11px] rounded-[3px] border border-ink/15 ${cls}`} />
        ))}
        More
      </div>
    </div>
  );
}
