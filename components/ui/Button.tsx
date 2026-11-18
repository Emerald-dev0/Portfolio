import type { ReactNode } from "react";

/**
 * BUTTON, the sticker button. Thick outline, hard offset shadow, presses
 * down into the shadow on :active. Renders an <a> when `href` is set,
 * otherwise a <button> (for form submits). `external` adds target/rel.
 */

export type ButtonVariant = "ink" | "leaf" | "tang" | "paper" | "grape";

const VARIANTS: Record<ButtonVariant, string> = {
  ink: "btn-ink",
  leaf: "btn-leaf",
  tang: "btn-tang",
  paper: "btn-paper",
  grape: "btn-grape",
};

export function Button({
  href,
  variant = "ink",
  className = "",
  external = false,
  onClick,
  type = "button",
  ariaLabel,
  children,
}: {
  href?: string;
  variant?: ButtonVariant;
  className?: string;
  external?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  ariaLabel?: string;
  children: ReactNode;
}) {
  const cls = `btn ${VARIANTS[variant]} ${className}`;
  if (href) {
    return (
      <a
        href={href}
        className={cls}
        aria-label={ariaLabel}
        {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} aria-label={ariaLabel} className={cls}>
      {children}
    </button>
  );
}
