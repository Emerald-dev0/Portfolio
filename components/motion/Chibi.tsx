"use client";

/**
 * ============================================================================
 * THE CAST — hand-drawn ink characters who live in the margins.
 * ============================================================================
 * Everything here is one SVG, `stroke="currentColor"`, animated with CSS — no
 * JS ticking, so a page full of characters costs nothing. The colour comes
 * from a `.crayon-*` class on any ancestor (see `--crayon` in globals.css), so
 * a character can be re-inked per section without touching this file.
 *
 * Three things to know:
 *  1. `variant` is a pose. Add a new pose to POSES and every character can
 *     use it — the drawing is descriptor data, not hand-written JSX per pose.
 *  2. `accessory` is a hat, headphones, glasses or a ponytail. They stack onto
 *     any pose, which is how the cast gets to look like individuals.
 *  3. `<Character id="dash" />` renders a named member of the cast with the
 *     right pose, accessory and crayon. Use that in sections.
 *
 * Respects prefers-reduced-motion via the global rule.
 * ============================================================================
 */

import type { CSSProperties, ReactNode } from "react";
import { cast, type CharacterId, type Crayon } from "@/lib/content";

type Variant =
  | "wave"
  | "walk"
  | "think"
  | "peek"
  | "jump"
  | "sit"
  | "run"
  | "sleep"
  | "point"
  | "shrug";

type Accessory = "none" | "cap" | "headphones" | "glasses" | "ponytail";

type Limb = { d: string; style?: CSSProperties };

type Pose = {
  /** torso */
  body: string;
  bodyStyle?: CSSProperties;
  armL: Limb;
  armR: Limb;
  legL: Limb;
  legR: Limb;
  headStyle?: CSSProperties;
  eyes?: "open" | "closed";
  extras?: ReactNode;
  /** peek draws a shorter viewBox — a head over an edge */
  viewBox?: string;
};

const ORIGIN = (x: number, y: number): CSSProperties => ({
  transformOrigin: `${x}px ${y}px`,
});

const POSES: Record<Variant, Pose> = {
  /* stands and waves hello */
  wave: {
    body: "M31 31 L31 46",
    bodyStyle: { ...ORIGIN(31, 32), animation: "chibi-bob 3s ease-in-out infinite" },
    armL: { d: "M31 35 L23 41" },
    armR: { d: "M31 34 L40 28", style: { ...ORIGIN(31, 34), animation: "chibi-wave 1.6s ease-in-out infinite" } },
    legL: { d: "M31 46 L26 57" },
    legR: { d: "M31 46 L36 57" },
  },
  /* strolls — legs swing, arms counter-swing */
  walk: {
    body: "M31 30 L31 44",
    bodyStyle: { ...ORIGIN(31, 32), animation: "chibi-bob 1.1s ease-in-out infinite" },
    armL: { d: "M31 34 L22 39", style: { ...ORIGIN(31, 34), animation: "chibi-legL 0.9s ease-in-out infinite" } },
    armR: { d: "M31 34 L40 39", style: { ...ORIGIN(31, 34), animation: "chibi-legR 0.9s ease-in-out infinite" } },
    legL: { d: "M31 44 L26 55", style: { ...ORIGIN(31, 44), animation: "chibi-legL 0.9s ease-in-out infinite" } },
    legR: { d: "M31 44 L36 55", style: { ...ORIGIN(31, 44), animation: "chibi-legR 0.9s ease-in-out infinite" } },
  },
  /* taps a chin, thinks a thought */
  think: {
    body: "M31 31 L31 46",
    bodyStyle: { ...ORIGIN(31, 32), animation: "chibi-bob 3.4s ease-in-out infinite" },
    armL: { d: "M31 35 L22 40" },
    armR: { d: "M31 35 L39 27 L36 23" },
    legL: { d: "M31 46 L26 57" },
    legR: { d: "M31 46 L36 57" },
    extras: (
      <g style={{ animation: "float-soft 3s ease-in-out infinite" }}>
        <circle cx="46" cy="13" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="52" cy="8" r="2.4" />
      </g>
    ),
  },
  /* peeks over an edge (viewBox is shorter — clip it at a section top) */
  peek: {
    viewBox: "0 0 64 40",
    body: "M31 40 L31 34",
    bodyStyle: { ...ORIGIN(31, 26), animation: "chibi-bob 2.6s ease-in-out infinite" },
    armL: { d: "M23 38 q-2 -3 1 -5" },
    armR: { d: "M39 38 q2 -3 -1 -5" },
    legL: { d: "" },
    legR: { d: "" },
  },
  /* both arms up — used when something actually works */
  jump: {
    body: "M31 31 L31 44",
    bodyStyle: { ...ORIGIN(31, 38), animation: "chibi-hop 1.5s ease-in-out infinite" },
    armL: { d: "M31 34 L21 25" },
    armR: { d: "M31 34 L41 25" },
    legL: { d: "M31 44 L25 53" },
    legR: { d: "M31 44 L37 53" },
  },
  /* sits on a rule with legs dangling */
  sit: {
    body: "M31 32 L31 42",
    bodyStyle: { ...ORIGIN(31, 40), animation: "chibi-bob 4s ease-in-out infinite" },
    armL: { d: "M31 36 L23 42" },
    armR: { d: "M31 36 L39 42" },
    legL: { d: "M31 42 L27 50 L27 54", style: { ...ORIGIN(31, 42), animation: "chibi-legL 2.4s ease-in-out infinite" } },
    legR: { d: "M31 42 L35 50 L35 54", style: { ...ORIGIN(31, 42), animation: "chibi-legR 2.4s ease-in-out infinite" } },
  },
  /* runs somewhere with intent */
  run: {
    body: "M32 30 L30 44",
    bodyStyle: { ...ORIGIN(31, 34), animation: "chibi-bob 0.7s ease-in-out infinite" },
    armL: { d: "M32 34 L23 30 L19 34", style: { ...ORIGIN(32, 34), animation: "chibi-arm-run 0.7s ease-in-out infinite" } },
    armR: { d: "M32 34 L40 39", style: { ...ORIGIN(32, 34), animation: "chibi-arm-run-b 0.7s ease-in-out infinite" } },
    legL: { d: "M30 44 L23 51 L17 49", style: { ...ORIGIN(30, 44), animation: "chibi-legL 0.7s ease-in-out infinite" } },
    legR: { d: "M30 44 L37 51 L43 55", style: { ...ORIGIN(30, 44), animation: "chibi-legR 0.7s ease-in-out infinite" } },
  },
  /* asleep at the desk. it's a whole mood. */
  sleep: {
    body: "M31 32 L31 45",
    bodyStyle: { ...ORIGIN(31, 36), animation: "chibi-bob 5.5s ease-in-out infinite" },
    armL: { d: "M31 36 L24 43" },
    armR: { d: "M31 36 L38 43" },
    legL: { d: "M31 45 L25 53" },
    legR: { d: "M31 45 L37 53" },
    headStyle: { ...ORIGIN(31, 20), transform: "rotate(9deg)" },
    eyes: "closed",
    extras: (
      <g stroke="currentColor" strokeWidth={1.8} fill="none" strokeLinecap="round">
        <path d="M44 16 h5 l-5 5 h5" style={{ animation: "chibi-zzz 3.6s ease-in-out infinite" }} />
        <path d="M50 8 h4 l-4 4 h4" style={{ animation: "chibi-zzz 3.6s ease-in-out 1.2s infinite" }} />
      </g>
    ),
  },
  /* points at the thing you're supposed to read */
  point: {
    body: "M31 31 L31 46",
    bodyStyle: { ...ORIGIN(31, 32), animation: "chibi-bob 3.8s ease-in-out infinite" },
    armL: { d: "M31 35 L24 41" },
    armR: { d: "M31 34 L45 31", style: { ...ORIGIN(31, 34), animation: "sway 2.6s ease-in-out infinite" } },
    legL: { d: "M31 46 L26 57" },
    legR: { d: "M31 46 L36 57" },
  },
  /* has no idea. neither do I, usually. */
  shrug: {
    body: "M31 31 L31 46",
    bodyStyle: { ...ORIGIN(31, 32), animation: "chibi-bob 4.2s ease-in-out infinite" },
    armL: { d: "M31 35 L21 31 L19 35" },
    armR: { d: "M31 35 L41 31 L43 35" },
    legL: { d: "M31 46 L26 57" },
    legR: { d: "M31 46 L36 57" },
    extras: (
      <g stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round">
        <path d="M45 10 q4 3 0 5" style={{ animation: "float-soft 3.2s ease-in-out infinite" }} />
        <circle cx="45" cy="19" r="1.3" fill="currentColor" stroke="none" />
      </g>
    ),
  },
};

/* --------------------------------------------------------------------------
 * Accessories — stacked on the head of any pose.
 * ------------------------------------------------------------------------ */
function Accessory({ kind }: { kind: Accessory }) {
  switch (kind) {
    case "cap":
      return (
        <g>
          <path
            d="M21 18 A10.5 10.5 0 0 1 41 18 Z"
            fill="var(--crayon, var(--color-marker))"
            stroke="currentColor"
            strokeWidth={2.2}
          />
          <path d="M41 18 q4.5 0 6 2.2" />
        </g>
      );
    case "headphones":
      return (
        <g>
          <path d="M20.5 19.5 A11 11 0 0 1 41.5 19.5" />
          <rect x="17" y="17.5" width="6" height="9" rx="3" fill="var(--crayon, var(--color-purple))" />
          <rect x="39" y="17.5" width="6" height="9" rx="3" fill="var(--crayon, var(--color-purple))" />
        </g>
      );
    case "glasses":
      return (
        <g strokeWidth={1.9}>
          <circle cx="26" cy="21" r="4.3" />
          <circle cx="36" cy="21" r="4.3" />
          <path d="M30.3 21 h1.4 M21.7 20.4 l-2.2 -0.6 M40.3 20.4 l2.2 -0.6" />
        </g>
      );
    case "ponytail":
      return (
        <g>
          <path d="M23 12.5 c-6.5 2 -7.5 10 -4 15" />
          <circle cx="23.4" cy="13" r="1.9" fill="var(--crayon, var(--color-accent))" stroke="currentColor" strokeWidth={1.6} />
        </g>
      );
    default:
      return null;
  }
}

/** Three strands of hair. Some characters are blessed, some are not. */
function Hair() {
  return (
    <g strokeWidth={2}>
      <path d="M27 10.5 l1.4 -4.2 M31.5 9.4 l0.6 -4.4 M35.6 10.5 l-1.4 -4.2" />
    </g>
  );
}

/* --------------------------------------------------------------------------
 * Chibi — the drawing itself.
 * ------------------------------------------------------------------------ */
export default function Chibi({
  variant = "wave",
  accessory = "none",
  hair = false,
  size = 64,
  className = "",
  title,
}: {
  variant?: Variant;
  accessory?: Accessory;
  hair?: boolean;
  size?: number;
  className?: string;
  title?: string;
}) {
  const pose = POSES[variant] ?? POSES.wave;
  const viewBox = pose.viewBox ?? "0 0 64 64";
  const ratio = viewBox === "0 0 64 40" ? 40 / 64 : 1;

  return (
    <svg
      width={size}
      height={size * ratio}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`chibi ${className}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {/* legs first so they tuck behind the torso */}
      {pose.legL.d && <path d={pose.legL.d} style={pose.legL.style} />}
      {pose.legR.d && <path d={pose.legR.d} style={pose.legR.style} />}

      <g style={pose.bodyStyle}>
        {variant === "peek" ? (
          <path d="M20 40 a11 11 0 0 1 22 0" />
        ) : (
          <circle cx="31" cy="20" r="11" style={pose.headStyle} />
        )}

        {/* face */}
        {pose.eyes === "closed" ? (
          <g strokeWidth={2}>
            <path d="M23.5 20.5 q2.5 2 5 0 M33.5 20.5 q2.5 2 5 0" />
          </g>
        ) : (
          <g style={{ ...ORIGIN(31, 20), animation: "chibi-blink 5.5s ease-in-out infinite" }}>
            <circle cx="26" cy="20" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="36" cy="20" r="1.5" fill="currentColor" stroke="none" />
          </g>
        )}

        {variant !== "peek" && (
          <>
            <path d="M31 22 l3.2 2.6" strokeWidth={1.8} />
            <path d="M27 26.6 q4 2.6 8 0" strokeWidth={2} />
          </>
        )}

        {hair && <Hair />}
        <Accessory kind={accessory} />

        {/* arms */}
        <path d={pose.armL.d} style={pose.armL.style} />
        <path d={pose.armR.d} style={pose.armR.style} />
        <path d={pose.body} />
      </g>

      {pose.extras}
    </svg>
  );
}

/* --------------------------------------------------------------------------
 * Biscuit — the dog. A different body plan entirely, because dogs are.
 * ------------------------------------------------------------------------ */
export function Dog({
  size = 64,
  className = "",
  title,
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size * 0.75}
      viewBox="0 0 64 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <g style={{ ...ORIGIN(30, 30), animation: "chibi-bob 2.2s ease-in-out infinite" }}>
        {/* tail */}
        <path
          d="M17 27 q-6 -3 -5.5 -10"
          style={{ ...ORIGIN(17, 27), animation: "chibi-tail 0.9s ease-in-out infinite" }}
        />
        {/* legs */}
        <path d="M21 36 v7 M27 37 v6 M37 37 v6 M43 36 v7" strokeWidth={2.1} />
        {/* body */}
        <ellipse cx="31" cy="30" rx="14" ry="7.5" />
        {/* head */}
        <g style={{ ...ORIGIN(46, 22), animation: "chibi-ears 4.4s ease-in-out infinite" }}>
          <circle cx="46" cy="21" r="8.5" />
          {/* floppy ear */}
          <path
            d="M41 15 q-4.5 1 -3.2 7 q3.4 0.6 4.6 -4.4 z"
            fill="var(--crayon, var(--color-marker))"
            strokeWidth={1.9}
          />
          {/* snout + nose */}
          <path d="M52 19 q4 1.5 3.4 4.6 q-0.6 3 -4 2.6" strokeWidth={2.1} />
          <circle cx="55" cy="21.5" r="1.5" fill="currentColor" stroke="none" />
          {/* eye + tongue */}
          <circle cx="47" cy="19" r="1.4" fill="currentColor" stroke="none" />
          <path d="M53 26 q1 3 3.2 2.4" strokeWidth={1.8} />
        </g>
      </g>
    </svg>
  );
}

/* --------------------------------------------------------------------------
 * The named cast — one config per character, so sections never have to
 * remember which dog is which.
 * ------------------------------------------------------------------------ */
type CastSheet = {
  pose: Variant;
  /** used when the character should look busy rather than posed */
  busyPose?: Variant;
  accessory: Accessory;
  hair?: boolean;
  crayon: Crayon;
  dog?: boolean;
};

const SHEET: Record<CharacterId, CastSheet> = {
  dash: { pose: "wave", busyPose: "run", accessory: "cap", crayon: "oxblood" },
  pip: { pose: "walk", busyPose: "sit", accessory: "headphones", crayon: "purple" },
  nova: { pose: "point", busyPose: "think", accessory: "glasses", hair: true, crayon: "teal" },
  biscuit: { pose: "walk", accessory: "none", crayon: "mustard", dog: true },
  moss: { pose: "shrug", busyPose: "think", accessory: "ponytail", hair: true, crayon: "green" },
};

export function castMeta(id: CharacterId) {
  return cast.find((c) => c.id === id) ?? cast[0];
}

/**
 * <Character id="dash" /> — a named cast member in their own colour.
 * `busy` swaps to their secondary pose (walking, thinking) for margins where
 * a wave would be too friendly.
 */
export function Character({
  id,
  size = 56,
  className = "",
  busy = false,
  title,
}: {
  id: CharacterId;
  size?: number;
  className?: string;
  busy?: boolean;
  title?: string;
}) {
  const sheet = SHEET[id] ?? SHEET.dash;
  const meta = castMeta(id);
  const pose = busy && sheet.busyPose ? sheet.busyPose : sheet.pose;
  // an empty title means "purely decorative" — never an unlabelled img
  const label = title === undefined ? `${meta.name} — ${meta.role}` : title || undefined;

  return (
    <span className={`crayon-${sheet.crayon} inline-block ${className}`}>
      {sheet.dog ? (
        <Dog size={size} title={label} />
      ) : (
        <Chibi
          variant={pose}
          accessory={sheet.accessory}
          hair={sheet.hair}
          size={size}
          title={label}
        />
      )}
    </span>
  );
}

export type { Variant as ChibiVariant, Accessory as ChibiAccessory };
