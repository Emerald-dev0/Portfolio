"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * TERMINAL, the footer's opening act. Types a session out line by line:
 * whoami, the stack, what I'm shipping, the contact card. Nothing here is a
 * frozen screenshot; it types itself, and skips instantly for reduced motion.
 *
 * The full transcript is read by screen readers as one block of text, so the
 * animation never becomes the only way to get the information.
 */

const SCRIPT: { cmd: string; out: string[] }[] = [
  {
    cmd: "whoami",
    out: ["daniel_oluwadare", "software engineer", "backend @ testflow"],
  },
  {
    cmd: "cat stack.json",
    out: [
      '{ "core": ["typescript", "next.js", "node", "postgres"],',
      '  "infra": ["neon", "prisma", "vercel", "aws ses"],',
      '  "also": ["kotlin", "python", "mcp"] }',
    ],
  },
  {
    cmd: "ls ~/projects",
    out: [
      "calder/       communication infrastructure",
      "testflow/     exam preparation platform",
      "orrei/        property presentation platform",
    ],
  },
  {
    cmd: "git log --oneline -1",
    out: ["a1f3c9d  still building, still learning"],
  },
  {
    cmd: "contact --open",
    out: [
      "email     oluwadare458@gmail.com",
      "github    github.com/Emerald-dev0",
      "location  Ile-Ife, Nigeria · UTC+1",
    ],
  },
];

const TYPING_MS = 26;
const LINE_MS = 90;

export function Terminal() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [chars, setChars] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Flat timeline of what to draw: each entry is a command or an output line. */
  const timeline = useMemo(() => {
    const rows: { kind: "cmd" | "out"; text: string }[] = [];
    for (const block of SCRIPT) {
      rows.push({ kind: "cmd", text: block.cmd });
      for (const line of block.out) rows.push({ kind: "out", text: line });
    }
    return rows;
  }, []);

  useEffect(() => {
    if (reduce) {
      setStep(timeline.length);
      return;
    }
    if (step >= timeline.length) return;

    const row = timeline[step];
    const total = row.kind === "cmd" ? row.text.length : 0;

    if (row.kind === "cmd" && chars < total) {
      timer.current = setTimeout(() => setChars((c) => c + 1), TYPING_MS);
      return () => {
        if (timer.current) clearTimeout(timer.current);
      };
    }

    timer.current = setTimeout(
      () => {
        setChars(0);
        setStep((s) => s + 1);
      },
      row.kind === "cmd" ? 260 : LINE_MS,
    );
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [step, chars, timeline, reduce]);

  const done = step >= timeline.length;

  return (
    <div className="sticker overflow-hidden rounded-2xl border-night/20 bg-night shadow-[8px_8px_0_var(--color-tang)]">
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b-2 border-bone/15 px-4 py-2.5">
        <span className="size-3 rounded-full border-2 border-night/40 bg-tang" />
        <span className="size-3 rounded-full border-2 border-night/40 bg-bone/70" />
        <span className="size-3 rounded-full border-2 border-night/40 bg-leaf" />
        <p className="ml-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em] text-bone/60">
          emerald: zsh: 80x24
        </p>
        <span className="ml-auto font-mono text-[0.58rem] font-bold uppercase tracking-[0.14em] text-bone/40">
          {done ? "connected" : "connecting"}
        </span>
      </div>

      {/* Body */}
      <div className="space-y-1 px-4 py-4 font-mono text-[0.72rem] leading-relaxed text-bone/90 sm:px-5 sm:text-[0.8rem]">
        <p className="text-bone/40">Last login: today · Ile-Ife, Nigeria</p>

        {timeline.map((row, i) => {
          if (i > step) return null;
          const isCurrent = i === step;
          const text = isCurrent && row.kind === "cmd" ? row.text.slice(0, chars) : row.text;

          if (row.kind === "cmd") {
            return (
              <p key={i} className="break-words">
                <span className="mr-1.5 text-leaf">➜</span>
                <span className="mr-1.5 text-lagoon">~</span>
                <span>{text}</span>
                {isCurrent && !done ? (
                  <span className="ml-0.5 inline-block h-[1em] w-[0.5em] translate-y-[0.1em] animate-pulse bg-tang" />
                ) : null}
              </p>
            );
          }
          return (
            <p key={i} className="whitespace-pre-wrap break-words pl-5 text-bone/65">
              {text}
            </p>
          );
        })}

        {done ? (
          <p className="pt-1">
            <span className="mr-1.5 text-leaf">➜</span>
            <span className="mr-1.5 text-lagoon">~</span>
            <span className="inline-block h-[1em] w-[0.55em] translate-y-[0.1em] animate-pulse bg-tang" />
          </p>
        ) : null}
      </div>

      {/* Hidden full transcript for assistive tech */}
      <div className="sr-only">
        <p>Terminal session with Daniel Oluwadare.</p>
        {SCRIPT.map((b) => (
          <p key={b.cmd}>
            Command: {b.cmd}. Output: {b.out.join(" ")}
          </p>
        ))}
      </div>
    </div>
  );
}
