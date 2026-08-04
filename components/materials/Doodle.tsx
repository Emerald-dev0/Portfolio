/**
 * MATERIAL: Ink — hand-drawn doodles.
 * Accent-only decoration, max 1–2 per section, never load-bearing.
 * Stroke inherits `currentColor` so callers set color via text-* classes;
 * default ink is #111.
 */

export type DoodleName =
  | "star"
  | "spark"
  | "crown"
  | "rocket"
  | "brain"
  | "arrow-curve";

const paths: Record<DoodleName, React.ReactNode> = {
  star: (
    <path d="M12 2 L14.4 9.2 L22 9.4 L15.9 14 L18 21.4 L12 17 L6 21.4 L8.1 14 L2 9.4 L9.6 9.2 Z" />
  ),
  spark: (
    <path d="M12 2 C12 8 13 10 20 12 C13 14 12 16 12 22 C12 16 11 14 4 12 C11 10 12 8 12 2 Z" />
  ),
  crown: (
    <path d="M3 18 L5 7 L9 13 L12 5 L15 13 L19 7 L21 18 Z M3 18 L21 18" />
  ),
  rocket: (
    <>
      <path d="M12 2 C16 5 17 11 15 16 L9 16 C7 11 8 5 12 2 Z" />
      <path d="M9 16 L6 20 L9 18 M15 16 L18 20 L15 18" />
      <circle cx="12" cy="9" r="1.6" />
    </>
  ),
  brain: (
    <path d="M9 4 C6 4 5 7 6 8 C4 9 4 12 6 12.5 C5 14 6 16 8 16 C8 18 10 19 12 18 L12 5 C11 4 10 4 9 4 Z M15 4 C18 4 19 7 18 8 C20 9 20 12 18 12.5 C19 14 18 16 16 16 C16 18 14 19 12 18" />
  ),
  "arrow-curve": (
    <path d="M3 5 C10 4 15 7 16 15 M16 15 L12 12 M16 15 L19 11" />
  ),
};

export default function Doodle({
  name,
  size = 32,
  className = "",
  strokeWidth = 1.6,
}: {
  name: DoodleName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}
