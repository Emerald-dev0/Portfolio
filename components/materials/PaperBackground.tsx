/**
 * MATERIAL: Paper — the base surface.
 * The grain overlay itself is applied on <body> (.paper-grain) so it stays
 * fixed across the whole scroll. This component adds the faint ruled lines
 * for a given region and a left "margin rule" like a real notebook page.
 */

export default function PaperBackground({
  children,
  ruled = true,
  marginRule = false,
  className = "",
}: {
  children?: React.ReactNode;
  ruled?: boolean;
  marginRule?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative ${ruled ? "paper-ruled" : ""} ${className}`}>
      {marginRule && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-6 w-px lg:left-12 xl:left-16"
          style={{ background: "color-mix(in srgb, var(--color-accent) 35%, transparent)" }}
        />
      )}
      {children}
    </div>
  );
}
