"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  DashboardSquare01Icon,
  Edit02Icon,
  Analytics01Icon,
  Image01Icon,
  Folder01Icon,
  Home01Icon,
  Logout01Icon,
  Menu01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "../ui/Icon";

const LINKS = [
  { href: "/admin", label: "Overview", icon: DashboardSquare01Icon },
  { href: "/admin/posts", label: "Posts", icon: Edit02Icon },
  { href: "/admin/categories", label: "Categories", icon: Folder01Icon },
  { href: "/admin/media", label: "Media", icon: Image01Icon },
  { href: "/admin/analytics", label: "Analytics", icon: Analytics01Icon },
];

/**
 * ADMIN NAV. A left rail on desktop, a top bar on mobile. Every link is a real
 * route with a real URL, so the browser's back button works, and the active
 * item is derived from the path rather than tracked in state.
 */
export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b-[2.5px] border-ink bg-paper px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className="grid size-10 place-items-center rounded-xl border-2 border-ink"
        >
          <Icon icon={Menu01Icon} size={18} />
        </button>
        <span className="font-display text-lg font-extrabold">Blog admin</span>
        <Link href="/blog" className="ml-auto font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em]">
          View site
        </Link>
      </div>

      <aside
        className={`${open ? "block" : "hidden"} sticky top-0 z-30 h-[100svh] w-full shrink-0 border-ink lg:block lg:w-60 lg:border-r-[2.5px]`}
      >
        <div className="flex h-full flex-col gap-1 p-4">
          <div className="mb-4 hidden items-center gap-2 px-2 lg:flex">
            <span className="grid size-9 place-items-center rounded-xl border-2 border-ink bg-leaf font-display text-sm font-extrabold text-bone">
              E
            </span>
            <div className="leading-tight">
              <p className="font-display text-base font-extrabold">Blog admin</p>
              <p className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.14em] opacity-50">
                Private
              </p>
            </div>
          </div>

          <nav aria-label="Admin" className="flex flex-col gap-1">
            {LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-2 text-sm font-bold transition ${
                    active
                      ? "border-ink bg-ink text-paper"
                      : "border-transparent hover:border-ink/20 hover:bg-ink/5"
                  }`}
                >
                  <Icon icon={link.icon} size={17} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-1 border-t-2 border-ink/10 pt-3">
            <Link
              href="/blog"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold transition hover:bg-ink/5"
            >
              <Icon icon={Home01Icon} size={17} />
              View blog
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-bold transition hover:bg-ink/5"
            >
              <Icon icon={Logout01Icon} size={17} />
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
