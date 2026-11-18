"use client";

import { useId, useMemo, useState } from "react";

/**
 * CHARTS, hand drawn SVG. No chart library, because the whole requirement here
 * is a line over time and a short bar list, and a dependency would ship more
 * JavaScript than the entire admin.
 *
 * Both are accessible: the line has a labelled summary for screen readers, the
 * bars are a list, and nothing depends on colour alone.
 */

type Point = { day: string; views: number };

/** Views over time. Fills the area under the line, marks the peak. */
export function Sparkline({ data, label }: { data: Point[]; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const gid = useId().replace(/:/g, "");
  const W = 720;
  const H = 200;
  const pad = 8;

  const max = Math.max(1, ...data.map((d) => d.views));
  const step = data.length > 1 ? (W - pad * 2) / (data.length - 1) : 0;
  const x = (i: number) => pad + i * step;
  const y = (v: number) => H - pad - (v / max) * (H - pad * 2);

  const points = data.map((d, i) => `${x(i)},${y(d.views)}`).join(" ");
  const area = `M${x(0)},${H - pad} L${points.split(" ").join(" L")} L${x(data.length - 1)},${H - pad} Z`;
  const total = data.reduce((sum, d) => sum + d.views, 0);
  const peakIndex = data.reduce((best, d, i) => (d.views > data[best].views ? i : best), 0);

  const summary = `${label}: ${total} views across ${data.length} days, peak ${data[peakIndex]?.views ?? 0} on ${data[peakIndex]?.day ?? "none"}.`;

  return (
    <figure className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-48 w-full"
        role="img"
        aria-label={summary}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-leaf)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--color-leaf)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={pad}
            x2={W - pad}
            y1={pad + f * (H - pad * 2)}
            y2={pad + f * (H - pad * 2)}
            stroke="currentColor"
            strokeOpacity={0.12}
            strokeDasharray="3 5"
          />
        ))}

        <path d={area} fill={`url(#fill-${gid})`} />
        <polyline
          points={points}
          fill="none"
          stroke="var(--color-leaf)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {data.map((d, i) => (
          <g key={d.day}>
            <rect
              x={x(i) - step / 2}
              y={0}
              width={Math.max(step, 6)}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
            {hover === i ? (
              <>
                <line x1={x(i)} x2={x(i)} y1={pad} y2={H - pad} stroke="currentColor" strokeOpacity={0.25} />
                <circle cx={x(i)} cy={y(d.views)} r={4.5} fill="var(--color-leaf)" stroke="var(--color-paper)" strokeWidth={2} />
              </>
            ) : null}
          </g>
        ))}
      </svg>

      <figcaption className="mt-1 flex items-center justify-between font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] muted-soft">
        <span>{data[0]?.day ?? ""}</span>
        <span aria-live="polite">
          {hover !== null ? `${data[hover].day}: ${data[hover].views} views` : `${total} views`}
        </span>
        <span>{data[data.length - 1]?.day ?? ""}</span>
      </figcaption>
    </figure>
  );
}

/** A horizontal bar list. Values are printed, so colour is never the only cue. */
export function BarList({
  items,
  emptyLabel = "Nothing recorded yet.",
}: {
  items: { name: string; count: number }[];
  emptyLabel?: string;
}) {
  const max = useMemo(() => Math.max(1, ...items.map((i) => i.count)), [items]);

  if (!items.length) {
    return <p className="py-6 text-sm muted-soft">{emptyLabel}</p>;
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item.name}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-semibold">{item.name}</span>
            <span className="shrink-0 font-mono text-xs font-bold muted-soft">{item.count}</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full border border-ink/15 bg-ink/5">
            <div
              className="h-full rounded-full bg-leaf"
              style={{ width: `${Math.max(3, (item.count / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** One number with its label, the unit of every admin screen. */
export function Stat({
  value,
  label,
  hint,
  tone = "paper",
}: {
  value: string | number;
  label: string;
  hint?: string;
  tone?: "paper" | "leaf" | "tang";
}) {
  const styles =
    tone === "leaf"
      ? "bg-leaf text-bone"
      : tone === "tang"
        ? "bg-tang text-night"
        : "bg-paper text-ink";
  return (
    <div className={`sticker-sm p-4 ${styles}`}>
      <p className="font-display text-3xl font-extrabold leading-none">{value}</p>
      <p className="mt-2 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] muted">
        {label}
      </p>
      {hint ? <p className="mt-1.5 text-xs muted">{hint}</p> : null}
    </div>
  );
}
