/**
 * MATERIAL: Marker — sticky note tab + note card surface.
 * The tab started as two colours (yellow / purple). It now takes any crayon in
 * the box, because project panels are inked per-project and the tag should
 * match the panel it sits on.
 */

import type { Crayon } from "@/lib/content";

type MarkerColor = "yellow" | "purple" | Crayon;

/** The two original names still work, so older call sites don't have to move. */
const ALIAS: Partial<Record<MarkerColor, string>> = {
  yellow: "mustard",
  purple: "oxblood",
};

export function StickyTab({
  children,
  color = "yellow",
  className = "",
}: {
  children: React.ReactNode;
  color?: MarkerColor;
  className?: string;
}) {
  const crayon = ALIAS[color] ?? color;
  return (
    <span className={`crayon-${crayon} sticky-tab sticky-tab--crayon ${className}`}>
      {children}
    </span>
  );
}

export default StickyTab;
