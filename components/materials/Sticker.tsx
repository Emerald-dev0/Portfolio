/**
 * MATERIAL: Sticker — a coloured, slightly-rotated label.
 * Wraps the `.crayon-*` class so the sticker's ink and its legible text colour
 * come from one place. Use `tag` for square-ish section tags, default pill for
 * status chips.
 */

import type { Crayon } from "@/lib/content";

export function Sticker({
  children,
  crayon = "mustard",
  shape = "pill",
  ghost = false,
  rotate,
  className = "",
}: {
  children: React.ReactNode;
  crayon?: Crayon;
  shape?: "pill" | "tag";
  /** outline only — for secondary information */
  ghost?: boolean;
  /** degrees; omit for the default slight tilt */
  rotate?: number;
  className?: string;
}) {
  return (
    <span
      className={`crayon-${crayon} sticker ${shape === "tag" ? "sticker--tag" : ""} ${
        ghost ? "sticker--ghost" : ""
      } ${className}`}
      style={rotate !== undefined ? ({ "--sticker-r": `${rotate}deg` } as React.CSSProperties) : undefined}
    >
      {children}
    </span>
  );
}

export default Sticker;
