/**
 * MATERIAL: The book cover.
 *
 * An "8th Grade" style binder cover is the most recognisable single object
 * around this whole metaphor, so this wraps the portfolio the way one sits on
 * a desk: a dark slab with an oversized wonky nameplate, a little character
 * breaking out of the frame, and a warning about reading it.
 *
 * `bare` drops the card and leaves just the title, for the 404 page where the
 * joke would be the same twice.
 */

import Link from "next/link";
import { Character } from "@/components/motion/Chibi";
import { Sticker } from "@/components/materials/Sticker";
import { FillLine } from "@/components/materials/Handwritten";
import { identity } from "@/lib/content";

export default function BookCover({
  className = "",
  /** shown above the nameplate, e.g. "AN ENGINEER'S NOTEBOOK" */
  kicker = "An engineer's notebook",
  /** "this is not a résumé" */
  blurb,
  children,
  href = "/",
  /** hide the CTA (404 already is the CTA) */
  showLink = true,
}: {
  className?: string;
  kicker?: string;
  blurb?: React.ReactNode;
  children?: React.ReactNode;
  href?: string;
  showLink?: boolean;
}) {
  return (
    <div
      className={`relative rounded-[10px_6px_9px_7px] border-[3px] border-ink bg-ink p-5 text-paper shadow-[0_18px_40px_-20px_rgba(34,32,26,0.8)] sm:p-7 ${className}`}
    >
      {/* the sticker someone stuck on the cover */}
      <Sticker
        crayon="mustard"
        className="absolute -right-3 -top-3 z-20 text-[10px]"
        rotate={-7}
      >
        404
      </Sticker>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-marker">
            {kicker}
          </p>

          <p className="mt-2 font-marker text-[clamp(1.8rem,6vw,3.2rem)] leading-[0.98] text-paper">
            The Engineer&rsquo;s
            <br />
            <span className="relative inline-block text-marker">
              Journal
              <FillLine className="absolute -bottom-2 left-0 h-3 w-full text-paper/60" />
            </span>
          </p>

          <p className="mt-4 max-w-md text-[13px] leading-relaxed text-paper/70">
            {blurb ?? (
              <>
                {identity.realName}, {identity.personaHandle}. Notes, decisions
                and the occasional mistake, written down as they happened.
              </>
            )}
          </p>

          {showLink && (
            <Link
              href={href}
              className="pill pill--paper mt-5 inline-flex border-paper/40 bg-paper text-ink"
            >
              open it
              <span className="pill-arrow">→</span>
            </Link>
          )}

          {children && <div className="mt-5">{children}</div>}
        </div>

        <div className="relative shrink-0 self-end sm:self-center">
          <span aria-hidden className="block">
            <Character id="dash" size={96} />
          </span>
        </div>
      </div>
    </div>
  );
}
