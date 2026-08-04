/**
 * MATERIAL: Marker — sticky note tab + note card surface.
 * Only two marker colors allowed: yellow (default) and purple accent.
 * Enforced by the `color` prop type.
 */

type MarkerColor = "yellow" | "purple";

export function StickyTab({
  children,
  color = "yellow",
  className = "",
}: {
  children: React.ReactNode;
  color?: MarkerColor;
  className?: string;
}) {
  return (
    <span
      className={`sticky-tab ${color === "purple" ? "sticky-tab--purple" : ""} ${className}`}
    >
      {children}
    </span>
  );
}
