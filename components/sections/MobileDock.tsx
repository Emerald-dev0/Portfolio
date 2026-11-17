"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight01Icon,
  Github01Icon,
  Home01Icon,
  Mail01Icon,
  TextAlignLeft01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "../ui/Icon";

/**
 * MOBILE DOCK
 * ------------------------------------------------------------------------
 * The thumb zone. On a phone the floating pill nav is a compromise; this is
 * the real navigation: a frosted bar pinned to the bottom, four destinations,
 * and a raised centre action for hiring. It appears once you scroll past the
 * hero, hides while you scroll down, returns when you scroll up, and it never
 * covers the footer's last line.
 */
const ITEMS = [
  { label: "Home", href: "/#top", icon: Home01Icon },
  { label: "Work", href: "/#work", icon: TextAlignLeft01Icon },
  {
    label: "Code",
    href: "https://github.com/Emerald-dev0",
    icon: Github01Icon,
    external: true,
  },
  {
    label: "Mail",
    href: "mailto:oluwadare458@gmail.com",
    icon: Mail01Icon,
    external: true,
  },
];

export function MobileDock() {
  const [show, setShow] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setShow(y > 420);
      setHidden(y > last && y > 620);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-3 bottom-3 z-50 md:hidden ${
        show ? "pointer-events-auto" : "pointer-events-none"
      }`}
      style={{
        transform: hidden ? "translateY(140%)" : "translateY(0)",
        opacity: show ? 1 : 0,
        transition:
          "transform 380ms cubic-bezier(0.16,1,0.3,1), opacity 240ms ease",
      }}
    >
      <nav
        aria-label="Quick navigation"
        className="flex items-center justify-between gap-1 rounded-[22px] border-[2.5px] border-ink bg-paper/95 px-2 py-2 shadow-[0_10px_30px_-12px_rgba(22,19,15,0.5)] backdrop-blur-md"
      >
        {ITEMS.slice(0, 2).map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 active:bg-ink/10"
          >
            <Icon icon={item.icon} size={19} />
            <span className="font-mono text-[0.54rem] font-bold uppercase tracking-[0.1em] opacity-70">
              {item.label}
            </span>
          </Link>
        ))}

        <Link
          href="/#contact"
          aria-label="Let's work together"
          className="mx-1 grid size-12 shrink-0 place-items-center rounded-full border-[2.5px] border-ink bg-tang text-night shadow-[3px_3px_0_var(--color-ink)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <Icon icon={ArrowUpRight01Icon} size={20} />
        </Link>

        {ITEMS.slice(2).map((item) => (
          <a
            key={item.label}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noreferrer noopener" : undefined}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 active:bg-ink/10"
          >
            <Icon icon={item.icon} size={19} />
            <span className="font-mono text-[0.54rem] font-bold uppercase tracking-[0.1em] opacity-70">
              {item.label}
            </span>
          </a>
        ))}
      </nav>
    </div>
  );
}
