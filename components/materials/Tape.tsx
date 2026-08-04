/**
 * MATERIAL: Tape & Paperclip.
 * Small graphic accents signaling something is physically stuck down.
 */

type TapeProps = {
  className?: string;
  /** rotation in degrees */
  rotate?: number;
  width?: number;
  tone?: "neutral" | "yellow";
};

/** A strip of translucent tape. Place absolutely over a corner/edge. */
export function Tape({
  className,
  rotate = -4,
  width = 88,
  tone = "neutral",
}: TapeProps) {
  const fill =
    tone === "yellow"
      ? "rgba(250, 204, 21, 0.45)"
      : "rgba(210, 200, 180, 0.55)";
  return (
    <span
      className={className}
      aria-hidden
      style={{
        display: "inline-block",
        width,
        height: 26,
        transform: `rotate(${rotate}deg)`,
        background: fill,
        boxShadow: "0 1px 2px rgba(38,34,27,0.12)",
        // torn ends
        clipPath:
          "polygon(3% 0, 97% 4%, 100% 96%, 96% 100%, 4% 96%, 0 6%)",
        backdropFilter: "saturate(1.1)",
      }}
    />
  );
}

type ClipProps = { className?: string; size?: number };

/** A paperclip hooked over a top edge. */
export function Paperclip({ className, size = 34 }: ClipProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size * 1.6}
      viewBox="0 0 20 32"
      fill="none"
      aria-hidden
    >
      <path
        d="M6 9 V22 a4 4 0 0 0 8 0 V7 a5.5 5.5 0 0 0 -11 0 V21 a7 7 0 0 0 14 0 V10"
        stroke="#8a8272"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
