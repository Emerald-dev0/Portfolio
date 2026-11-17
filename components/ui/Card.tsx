import type { ReactNode } from "react";

/**
 * CARD, the sticker card. Thick outline + hard shadow, an optional resting
 * rotation (so the wall never looks machine-aligned), and a lift on hover.
 * `flat` drops the shadow for dense lists where depth would get noisy.
 */
export function Card({
  className = "",
  rotate = 0,
  flat = false,
  children,
}: {
  className?: string;
  rotate?: number;
  flat?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`${flat ? "sticker-flat" : "sticker"} transition-transform duration-200 hover:-translate-y-1.5 ${className}`}
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      {children}
    </div>
  );
}
