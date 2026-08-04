"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { nav } from "@/lib/content";

/**
 * Navigation — no wordmark. Two intentional, distinct surfaces:
 *
 * DESKTOP: a floating centered pill. A hovered/active link is filled by a
 * single sliding ink pill (shared layoutId), so the highlight glides between
 * items. A hair-thin ink progress line under the pill tracks scroll depth. The
 * ✦ dot spins home.
 *
 * MOBILE: a thumb-reachable bottom dock — a rounded ink bar of icon+label tabs
 * that lifts the active tab on a paper chip. Not a hamburger; a real, memorable
 * surface you navigate without opening anything.
 */
export default function Nav() {
  const [active, setActive] = useState("top");
  const [hovered, setHovered] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  useEffect(() => {
    const ids = ["top", ...nav.links.map((l) => l.href.slice(1))];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((s) => observer.observe(s));
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // which link the sliding pill sits under: hovered wins, else active section
  const lit = hovered ?? active;

  return (
    <>
      {/* ---------------- DESKTOP ---------------- */}
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="fixed inset-x-0 top-0 z-50 hidden justify-center px-3 pt-4 sm:flex"
      >
        <nav
          onMouseLeave={() => setHovered(null)}
          className={`t-base relative flex items-center gap-1 rounded-full p-1.5 transition-all ${
            scrolled
              ? "border border-ink/15 bg-paper-raised/85 shadow-[0_8px_24px_-12px_rgba(34,32,26,0.55)] backdrop-blur-md"
              : "border border-ink/10 bg-paper-raised/40 backdrop-blur-sm"
          }`}
        >
          {/* monogram anchor dot */}
          <a
            href="#top"
            aria-label="Back to top"
            onMouseEnter={() => setHovered("top")}
            className="mr-1 flex h-9 w-9 items-center justify-center rounded-full bg-ink font-marker text-base leading-none text-marker transition-transform hover:rotate-[20deg]"
          >
            ✦
          </a>

          <ul className="flex items-center">
            {nav.links.map((link) => {
              const id = link.href.slice(1);
              const isLit = lit === id;
              return (
                <li key={link.href} className="relative">
                  <a
                    href={link.href}
                    onMouseEnter={() => setHovered(id)}
                    className={`relative z-10 inline-block px-4 py-2 font-mono text-[12px] lowercase tracking-wide transition-colors duration-200 ${
                      isLit ? "text-paper" : "text-ink-muted"
                    }`}
                  >
                    {link.label}
                  </a>
                  {isLit && (
                    <motion.span
                      layoutId="nav-ink"
                      className="absolute inset-0 -z-0 bg-ink"
                      style={{ borderRadius: "14px 11px 13px 12px" }}
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                </li>
              );
            })}
          </ul>

          {/* scroll-depth ink line under the pill */}
          <motion.span
            aria-hidden
            className="absolute -bottom-[3px] left-6 right-6 h-[2px] origin-left rounded-full bg-accent/70"
            style={{ scaleX: progress }}
          />
        </nav>
      </motion.header>

      {/* ---------------- MOBILE (bottom dock) ---------------- */}
      <motion.nav
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden"
      >
        <ul className="flex items-end gap-0.5 rounded-[26px] border border-paper/15 bg-ink/95 px-1.5 py-1.5 shadow-[0_10px_30px_-8px_rgba(34,32,26,0.6)] backdrop-blur">
          {nav.links.map((link) => {
            const id = link.href.slice(1);
            const isActive = active === id;
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  aria-current={isActive ? "true" : undefined}
                  className="relative flex flex-col items-center gap-1 px-3 py-1.5"
                >
                  <span
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      isActive ? "text-ink" : "text-paper/70"
                    }`}
                  >
                    <TabIcon id={id} />
                    {isActive && (
                      <motion.span
                        layoutId="dock-chip"
                        className="absolute inset-0 -z-0 rounded-full bg-marker"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                  </span>
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, y: -3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="font-mono text-[9px] lowercase tracking-wide text-marker"
                      >
                        {link.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </a>
              </li>
            );
          })}
        </ul>
      </motion.nav>
    </>
  );
}

/** Minimal line-icons for the mobile dock tabs. */
function TabIcon({ id }: { id: string }) {
  const c = {
    width: 17,
    height: 17,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (id) {
    case "about":
      return (
        <svg {...c}>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5 20c1.5-4 12-4 14 0" />
        </svg>
      );
    case "work":
      return (
        <svg {...c}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7" />
        </svg>
      );
    case "stack":
      return (
        <svg {...c}>
          <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
          <path d="M3 12l9 4.5L21 12M3 16.5 12 21l9-4.5" />
        </svg>
      );
    case "journey":
      return (
        <svg {...c}>
          <path d="M6 20V8a3 3 0 0 1 3-3h6" />
          <path d="M13 3l3 2-3 2" />
          <circle cx="6" cy="20" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );
    default: // contact
      return (
        <svg {...c}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M4 7l8 6 8-6" />
        </svg>
      );
  }
}
