/**
 * MATERIAL: Paper — a torn edge.
 * Used ONCE as a closing gesture above the footer (Part 2 §10). Jagged,
 * irregular black-edged tear. `flip` points the tear the other way.
 */

export default function TornEdge({
  className = "",
  fill = "#111111",
  flip = false,
}: {
  className?: string;
  fill?: string;
  flip?: boolean;
}) {
  return (
    <div
      className={`relative w-full leading-[0] ${className}`}
      aria-hidden
      style={{ transform: flip ? "scaleY(-1)" : undefined }}
    >
      <svg
        width="100%"
        height="34"
        viewBox="0 0 1200 34"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 34 L0 14 L28 20 L60 8 L96 22 L134 10 L172 24 L214 12 L256 26 L300 9 L342 22 L388 11 L430 25 L474 13 L520 27 L566 10 L610 23 L656 12 L700 26 L744 9 L790 22 L836 12 L882 25 L928 11 L974 24 L1020 10 L1066 23 L1112 12 L1158 25 L1200 14 L1200 34 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}
