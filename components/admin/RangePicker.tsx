"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const RANGES = [
  { id: "24h", label: "24 hours" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
  { id: "all", label: "All time" },
] as const;

/**
 * RANGE PICKER. Writes the window into the URL, so a view is shareable and a
 * reload lands on the same numbers. Custom dates are two inputs and a button,
 * which is all a single-operator blog needs.
 */
export function RangePicker({ active }: { active: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [from, setFrom] = useState(params.get("from") ?? "");
  const [to, setTo] = useState(params.get("to") ?? "");
  const [open, setOpen] = useState(active === "custom");

  function push(range: string, extra: Record<string, string> = {}) {
    const search = new URLSearchParams();
    search.set("range", range);
    for (const [k, v] of Object.entries(extra)) if (v) search.set(k, v);
    router.push(`${pathname}?${search.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1" role="group" aria-label="Time range">
        {RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => push(r.id)}
            aria-pressed={active === r.id}
            className={`chip text-[0.62rem] ${active === r.id ? "bg-ink text-paper" : ""}`}
          >
            {r.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-pressed={active === "custom"}
          aria-expanded={open}
          className={`chip text-[0.62rem] ${active === "custom" ? "bg-ink text-paper" : ""}`}
        >
          Custom
        </button>
      </div>

      {open ? (
        <form
          className="flex flex-wrap items-end gap-2 rounded-xl border-2 border-ink px-2 py-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            if (from && to) push("custom", { from, to });
          }}
        >
          <label className="text-[0.55rem] font-bold uppercase tracking-[0.1em] muted-soft">
            From
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-0.5 block rounded-md border-2 border-ink/20 px-1.5 py-1 text-xs font-normal outline-none focus:border-ink"
            />
          </label>
          <label className="text-[0.55rem] font-bold uppercase tracking-[0.1em] muted-soft">
            To
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-0.5 block rounded-md border-2 border-ink/20 px-1.5 py-1 text-xs font-normal outline-none focus:border-ink"
            />
          </label>
          <button type="submit" disabled={!from || !to} className="btn btn-ink px-3 py-1 text-[0.6rem] disabled:opacity-40">
            Apply
          </button>
        </form>
      ) : null}
    </div>
  );
}
