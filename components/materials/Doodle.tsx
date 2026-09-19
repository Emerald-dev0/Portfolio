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
  | "arrow-curve"
  | "lightbulb"
  | "coffee"
  | "bug"
  | "flag"
  | "cloud"
  | "wifi";

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
  lightbulb: (
    <>
      <path d="M12 3 a6 6 0 0 1 3.4 10.9 c-.5.4-.8 1-.8 1.6 v.6 H9.4 v-.6 c0-.6-.3-1.2-.8-1.6 A6 6 0 0 1 12 3 Z" />
      <path d="M9.6 19 h4.8 M10.6 21.4 h2.8" />
    </>
  ),
  coffee: (
    <>
      <path d="M4 9 h12 v6 a4 4 0 0 1 -4 4 H8 a4 4 0 0 1 -4 -4 Z" />
      <path d="M16 10.5 h1.6 a2.6 2.6 0 0 1 0 5.2 H16" />
      <path d="M7 6 q1 -1.4 0 -3 M11 6 q1 -1.4 0 -3" />
    </>
  ),
  bug: (
    <>
      <path d="M9 6 a3 3 0 0 1 6 0" />
      <path d="M7 9.5 h10 V14 a5 5 0 0 1 -10 0 Z" />
      <path d="M3.6 8.4 L6.2 10 M20.4 8.4 L17.8 10 M3.6 16.6 L6.2 15 M20.4 16.6 L17.8 15" />
    </>
  ),
  flag: (
    <path d="M6 21 V3 M6 4 h11 q-3 3.2 0 6.4 H6" />
  ),
  cloud: (
    <path d="M6.6 18 a3.6 3.6 0 0 1 -.2 -7.2 a5 5 0 0 1 9.8 -1.3 a3.7 3.7 0 0 1 1 8.5 Z" />
  ),
  wifi: (
    <>
      <path d="M2.6 9.2 a14.4 14.4 0 0 1 18.8 0" />
      <path d="M6 12.8 a9 9 0 0 1 12 0" />
      <path d="M9.4 16.2 a4.4 4.4 0 0 1 5.2 0" />
      <circle cx="12" cy="19.4" r="0.9" fill="currentColor" stroke="none" />
    </>
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
