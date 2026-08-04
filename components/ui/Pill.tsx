import Link from "next/link";

/**
 * Pill — the single tactile button language for the whole site. Pill-shaped,
 * hand-weighted, with a nudging arrow. Replaces the old stamp CTAs.
 */

type Variant = "ink" | "paper" | "accent";

type Common = {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  arrow?: boolean;
};

type LinkProps = Common & { href: string; external?: boolean };

export default function Pill({
  children,
  variant = "ink",
  className = "",
  arrow = true,
  href,
  external,
}: LinkProps) {
  const ext = external ?? href.startsWith("http");
  return (
    <Link
      href={href}
      className={`pill pill--${variant} ${className}`}
      {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
      {arrow && <span className="pill-arrow">→</span>}
    </Link>
  );
}
