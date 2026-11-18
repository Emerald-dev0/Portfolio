"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUpRight01Icon, MusicNoteIcon } from "@hugeicons/core-free-icons";
import { Icon } from "./Icon";

/**
 * NOW PLAYING, a small sticker that shows the current Spotify track, with a
 * live progress bar. If Spotify isn't configured (or nothing has ever played),
 * it renders nothing at all rather than an empty shell.
 *
 * Polls every 30s; pauses while the tab is hidden.
 */

type Track = {
  configured: boolean;
  playing?: boolean;
  title?: string;
  artist?: string;
  album?: string;
  art?: string | null;
  url?: string;
  progressMs?: number;
  durationMs?: number;
  empty?: boolean;
  error?: string;
};

const EQ = [0, 1, 2, 3];

export function NowPlaying({ className = "" }: { className?: string }) {
  const [track, setTrack] = useState<Track | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const res = await fetch("/api/spotify/now-playing", { cache: "no-store" });
        const data = (await res.json()) as Track;
        if (alive) setTrack(data);
      } catch {
        if (alive) setTrack({ configured: false });
      }
    };

    void load();
    const poll = setInterval(load, 30_000);
    const progress = setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      alive = false;
      clearInterval(poll);
      clearInterval(progress);
    };
  }, []);

  if (!track?.configured || !track.title) return null;

  const duration = track.durationMs ?? 0;
  const progress = Math.min(
    duration,
    (track.progressMs ?? 0) + (track.playing ? tick * 1000 : 0),
  );
  const pct = duration ? Math.min(100, (progress / duration) * 100) : 0;

  return (
    <a
      href={track.url}
      target="_blank"
      rel="noreferrer noopener"
      className={`sticker-flat group flex items-center gap-3 rounded-2xl p-2.5 pr-4 transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-ink)] ${className}`}
      title={track.playing ? "Playing now on Spotify" : "Last played on Spotify"}
    >
      <span className="relative size-11 shrink-0 overflow-hidden rounded-xl border-2 border-ink bg-ink/10">
        {track.art ? (
          <Image src={track.art} alt="" fill sizes="44px" className="object-cover" />
        ) : (
          <span className="grid h-full place-items-center">
            <Icon icon={MusicNoteIcon} size={16} />
          </span>
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 font-mono text-[0.55rem] font-bold uppercase tracking-[0.14em] muted-soft">
          {track.playing ? (
            <>
              <span className="flex items-end gap-[2px]" aria-hidden="true">
                {EQ.map((i) => (
                  <span
                    key={i}
                    className="w-[2px] animate-bounce rounded-full bg-leaf"
                    style={{
                      height: `${6 + i * 2}px`,
                      animationDelay: `${i * 120}ms`,
                      animationDuration: "900ms",
                    }}
                  />
                ))}
              </span>
              now playing
            </>
          ) : (
            <>last played</>
          )}
        </span>
        <span className="mt-0.5 block truncate text-[0.78rem] font-bold leading-tight">
          {track.title}
        </span>
        <span className="block truncate text-[0.68rem] leading-tight muted-soft">
          {track.artist}
        </span>
        {duration ? (
          <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-ink/15">
            <span
              className="block h-full rounded-full bg-leaf transition-[width] duration-1000 ease-linear"
              style={{ width: `${pct}%` }}
            />
          </span>
        ) : null}
      </span>

      <Icon
        icon={ArrowUpRight01Icon}
        size={14}
        className="shrink-0 muted-soft transition group-hover:opacity-80"
      />
    </a>
  );
}
