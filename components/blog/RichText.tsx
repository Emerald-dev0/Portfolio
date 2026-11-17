"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * RICH TEXT, renders the inline Markdown that survives inside a block:
 * **bold**, *italic*, `code`, ~~strike~~, [links](url), and bare URLs.
 *
 * It builds React nodes directly instead of using dangerouslySetInnerHTML, so
 * there is no HTML injection surface anywhere in the blog, no matter who is
 * typing into the studio.
 */

type Props = { text: string; className?: string };

const INLINE =
  /(\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|\*[^*\n]+\*|_[^_\n]+_|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

function renderLink(href: string, label: string, key: number): ReactNode {
  const external = /^https?:\/\//.test(href);
  if (external) {
    return (
      <a
        key={key}
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="font-semibold underline decoration-leaf decoration-2 underline-offset-[3px] transition hover:bg-leaf/15"
      >
        {label}
      </a>
    );
  }
  return (
    <Link
      key={key}
      href={href}
      className="font-semibold underline decoration-leaf decoration-2 underline-offset-[3px] transition hover:bg-leaf/15"
    >
      {label}
    </Link>
  );
}

export function RichText({ text, className }: Props) {
  const parts = text.split(INLINE).filter((p) => p !== "");

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-extrabold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("__") && part.endsWith("__")) {
          return <strong key={i} className="font-extrabold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("~~") && part.endsWith("~~")) {
          return <del key={i} className="opacity-70">{part.slice(2, -2)}</del>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="rounded-md border-2 border-ink/25 bg-ink/8 px-1.5 py-0.5 font-mono text-[0.88em] font-semibold"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("[") ) {
          const m = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
          if (m) return renderLink(m[2], m[1], i);
        }
        if (
          (part.startsWith("*") && part.endsWith("*") && part.length > 2) ||
          (part.startsWith("_") && part.endsWith("_") && part.length > 2)
        ) {
          return <em key={i} className="italic">{part.slice(1, -1)}</em>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
