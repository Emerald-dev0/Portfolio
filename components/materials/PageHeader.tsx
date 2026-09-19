/**
 * MATERIAL: Page header.
 * The top of a page in a bound book: a running head on the left, a page number
 * on the right, a hairline between them, and underneath it the date the diary
 * entry was written. Every section starts with one, which is what makes the
 * whole site read as a week of entries rather than a stack of sections.
 */

import { journal } from "@/lib/content";

export function PageHeader({
  date,
  page,
  /** set false on hero/marquee bands that shouldn't look like a new page */
  runningHead = true,
  className = "",
}: {
  /** e.g. "MONDAY, LATER" — omit when the caller prints the date itself */
  date?: string;
  page: number;
  runningHead?: boolean;
  className?: string;
}) {
  return (
    <header className={`mb-5 ${className}`}>
      {runningHead && (
        <div className="mb-3 flex items-center gap-3">
          <span className="page-num truncate">
            {journal.runningHead} · {journal.owner}
          </span>
          <span aria-hidden className="ink-rule h-px flex-1 opacity-70" />
          <span className="page-num shrink-0">PAGE {String(page).padStart(2, "0")}</span>
        </div>
      )}

      {date && (
        <p className="font-marker text-[clamp(1.05rem,2.2vw,1.5rem)] leading-none text-ink">
          {date}
        </p>
      )}
    </header>
  );
}

export default PageHeader;
