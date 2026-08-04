"use client";

/**
 * Chibi — tiny hand-drawn ink characters that idle-bob, blink, and wave, so the
 * page feels inhabited rather than decorated. Pure SVG + CSS animation (no JS
 * ticking), currentColor stroke so callers tint them. Variants:
 *  - "wave"   : stands and waves an arm (great near the hero / contact)
 *  - "walk"   : legs swing back and forth (great in margins/footers)
 *  - "think"  : taps a chin, a little thought-spark above (near about/journey)
 *  - "peek"   : peeks over an edge (great clipped at a section top)
 * Respects prefers-reduced-motion via the global reduce rule.
 */

type Variant = "wave" | "walk" | "think" | "peek";

export default function Chibi({
  variant = "wave",
  size = 64,
  className = "",
  title,
}: {
  variant?: Variant;
  size?: number;
  className?: string;
  title?: string;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 64 64",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: `chibi ${className}`,
    role: title ? ("img" as const) : undefined,
    "aria-hidden": title ? undefined : true,
  };

  // eyes shared across variants
  const Eyes = (
    <g style={{ transformOrigin: "center", animation: "chibi-blink 5.5s ease-in-out infinite" }}>
      <circle cx="26" cy="20" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="36" cy="20" r="1.5" fill="currentColor" stroke="none" />
    </g>
  );

  if (variant === "walk") {
    return (
      <svg {...common}>
        <g style={{ transformOrigin: "31px 32px", animation: "chibi-bob 1.1s ease-in-out infinite" }}>
          <circle cx="31" cy="19" r="11" />
          {Eyes}
          <path d="M27 25 q4 3 8 0" />
          <path d="M31 30 L31 44" />
          <path d="M31 34 L22 39 M31 34 L40 39" />
        </g>
        <path d="M31 44 L26 55" style={{ transformOrigin: "31px 44px", animation: "chibi-legL 0.9s ease-in-out infinite" }} />
        <path d="M31 44 L36 55" style={{ transformOrigin: "31px 44px", animation: "chibi-legR 0.9s ease-in-out infinite" }} />
      </svg>
    );
  }

  if (variant === "think") {
    return (
      <svg {...common}>
        <g style={{ transformOrigin: "31px 32px", animation: "chibi-bob 3.4s ease-in-out infinite" }}>
          <circle cx="31" cy="20" r="11" />
          {Eyes}
          <path d="M28 26 q3 1.5 6 0" />
          <path d="M31 31 L31 46" />
          <path d="M31 35 L22 40" />
          {/* arm tapping chin */}
          <path d="M31 35 L39 27 L36 23" />
          <path d="M31 46 L26 57 M31 46 L36 57" />
        </g>
        <g style={{ animation: "float-soft 3s ease-in-out infinite" }}>
          <circle cx="47" cy="12" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="52" cy="8" r="2.4" />
        </g>
      </svg>
    );
  }

  if (variant === "peek") {
    return (
      <svg {...common} viewBox="0 0 64 40">
        <g style={{ transformOrigin: "31px 26px", animation: "chibi-bob 2.6s ease-in-out infinite" }}>
          <path d="M20 40 a11 11 0 0 1 22 0" />
          {/* hands gripping the edge */}
          <path d="M22 38 q-2 -3 1 -5 M42 38 q2 -3 -1 -5" />
          <circle cx="26" cy="30" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="36" cy="30" r="1.4" fill="currentColor" stroke="none" />
        </g>
      </svg>
    );
  }

  // wave (default)
  return (
    <svg {...common}>
      <g style={{ transformOrigin: "31px 32px", animation: "chibi-bob 3s ease-in-out infinite" }}>
        <circle cx="31" cy="20" r="11" />
        {Eyes}
        <path d="M27 25 q4 3 8 0" />
        <path d="M31 31 L31 46" />
        {/* still arm */}
        <path d="M31 35 L23 41" />
        {/* waving arm */}
        <path
          d="M31 34 L40 28"
          style={{ transformOrigin: "31px 34px", animation: "chibi-wave 1.6s ease-in-out infinite" }}
        />
        <path d="M31 46 L26 57 M31 46 L36 57" />
      </g>
    </svg>
  );
}
