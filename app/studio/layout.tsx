import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Studio layout, noindex, no footer wordmark, no distractors. Just the nav
 * that takes you home and the writing surface.
 */
export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-[100svh] bg-paper">{children}</div>;
}
