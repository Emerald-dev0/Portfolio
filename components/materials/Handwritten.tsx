/**
 * MATERIAL: Hand-drawn paper widgets.
 * The small things a real notebook has that a web page usually fakes with
 * rounded rectangles: a checkbox with a tick that overhangs the box, a ruled
 * fill-in line, and a corner somebody folded over instead of using a bookmark.
 *
 * All of them are SVG or clipped divs, sized relative to their container, and
 * all of them inherit `currentColor`.
 */

/** A checkbox with a hand-drawn tick. The tick deliberately overshoots. */
export function Checkbox({ checked = true, size = 20 }: { checked?: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3.5 4.6 C8 3.9 14 3.8 20.4 4.4 C20.9 9 20.8 15 20.2 20.2 C14 20.9 8.4 20.8 3.9 20.1 C3.4 15 3.3 9 3.5 4.6 Z" strokeWidth="1.7" />
      {checked && (
        <path
          d="M6.6 12.6 C8.6 13.6 9.6 15.4 10.6 17.6 C12.6 12.8 15.6 8.4 20.4 5.4"
          strokeWidth="2.4"
        />
      )}
    </svg>
  );
}

/** A ruled line to write on, with an uneven left edge like a pen start. */
export function FillLine({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 10"
      preserveAspectRatio="none"
      className={className}
      fill="none"
      aria-hidden
    >
      <path
        d="M2 6.4 C30 5.6 70 6.8 92 5.9 C104 5.4 113 6.2 118 6.1"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

/** A corner folded over to mark the page. Top-right by default. */
export function FoldedCorner({
  size = 34,
  corner = "right",
  className = "",
}: {
  size?: number;
  corner?: "left" | "right";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute top-0 ${corner === "right" ? "right-0" : "left-0 -scale-x-100"} ${className}`}
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, var(--color-paper-shadow), var(--color-paper-raised))",
        clipPath: "polygon(100% 0, 100% 100%, 0 0)",
        boxShadow: "-2px 2px 5px -1px rgba(34,32,26,0.3)",
      }}
    />
  );
}
