"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight01Icon,
  Cancel01Icon,
  Menu01Icon,
  Moon02Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";
import { navLinks, site } from "../../lib/config";
import { Icon } from "../ui/Icon";

/**
 * NAV, the floating pill. Logo sticker, section links, a live status dot,
 * a theme toggle, and the "Let's work" CTA. On mobile it collapses to a
 * hamburger that opens a sticker panel (keyboard-friendly, Esc closes).
 */
export function Nav() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const toggleTheme = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("emerald-theme", next);
    } catch {
      /* private mode, theme just won't persist */
    }
    setDark(!dark);
  };

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 max-md:hidden">
      <nav
        aria-label="Primary"
        className="sticker-sm flex w-full max-w-3xl items-center gap-2 rounded-full py-2 pl-3 pr-2 sm:gap-3 sm:pl-4"
      >
        <Link href="/#top" className="flex items-center gap-2.5" aria-label="Emerald, back to top">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl border-2 border-ink bg-leaf font-display text-lg font-extrabold text-bone">
            E
          </span>
          <span className="hidden font-display text-lg font-extrabold tracking-tight sm:block">
            Emerald
          </span>
        </Link>

        <ul className="ml-auto hidden items-center gap-0.5 md:flex">
          {navLinks.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                className="rounded-full px-3 py-2 font-mono text-[0.72rem] font-bold uppercase tracking-[0.12em] transition hover:bg-ink/10"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <span className="hidden items-center gap-2 lg:flex" title={site.availability}>
            <span className="size-2.5 animate-pulse-dot rounded-full bg-leaf" />
            <span className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em]">
              Open
            </span>
          </span>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            className="grid size-9 place-items-center rounded-full border-2 border-ink bg-paper transition hover:bg-ink/10"
          >
            <Icon icon={dark ? Sun01Icon : Moon02Icon} size={17} />
          </button>

          <Link href="/#contact" className="btn btn-leaf hidden px-4 py-2.5 text-sm md:inline-flex">
            Let&rsquo;s work
            <Icon icon={ArrowUpRight01Icon} size={15} />
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-9 place-items-center rounded-full border-2 border-ink bg-paper md:hidden"
          >
            <Icon icon={open ? Cancel01Icon : Menu01Icon} size={18} />
          </button>
        </div>
      </nav>

      {open ? (
        <div className="sticker absolute inset-x-4 top-full mt-3 rounded-3xl p-4 md:hidden">
          <ul className="flex flex-col">
            {navLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-3 font-display text-xl font-extrabold transition hover:bg-ink/5"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/#contact"
            onClick={() => setOpen(false)}
            className="btn btn-leaf mt-3 w-full"
          >
            Let&rsquo;s work together
            <Icon icon={ArrowUpRight01Icon} size={16} />
          </Link>
        </div>
      ) : null}
    </header>
  );
}
