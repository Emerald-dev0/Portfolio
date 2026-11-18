import { MusicNoteIcon } from "@hugeicons/core-free-icons";
import { Doodle } from "../ui/Doodle";
import { Icon } from "../ui/Icon";
import { NowPlaying } from "../ui/NowPlaying";
import { spotifySection } from "../../lib/content";

/**
 * NOW PLAYING BAND, the "currently listening" strip. Copy lives in
 * lib/content.ts (spotifySection). The widget itself hides when Spotify isn't
 * configured, so the band still reads properly on its own.
 */
export function NowPlayingBand() {
  return (
    <div className="relative z-20 mx-auto max-w-7xl px-5 sm:px-8">
      <div className="sticker-flat flex flex-col items-start gap-5 rounded-3xl bg-tang p-5 text-night sm:flex-row sm:items-center sm:gap-7">
        <span className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-ink bg-night text-bone">
            <Icon icon={MusicNoteIcon} size={18} />
          </span>
          <span>
            <span className="block font-mono text-[0.55rem] font-bold uppercase tracking-[0.16em] muted-soft">
              {spotifySection.label}
            </span>
            <span className="mt-1 block font-display text-[1.05rem] font-extrabold leading-tight">
              {spotifySection.heading}
            </span>
            <span className="mt-1 block max-w-sm text-[0.85rem] leading-snug muted">
              {spotifySection.body}
            </span>
            <span className="mt-1 block font-mono text-[0.55rem] font-bold uppercase tracking-[0.14em] muted-soft">
              {spotifySection.note}
            </span>
          </span>
        </span>

        <Doodle name="squiggle" className="hidden w-16 muted-soft sm:block" strokeWidth={5} />

        <NowPlaying className="w-full bg-paper text-ink shadow-[4px_4px_0_var(--color-ink)] sm:ml-auto sm:w-auto sm:min-w-[280px]" />
      </div>
    </div>
  );
}
