import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * The admin shell. Private, noindex, no public nav and no footer: this is a
 * tool, not a page. The sidebar is rendered by the pages that need it, so the
 * login screen can stay bare.
 */
export const metadata: Metadata = {
  title: "Blog admin",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-[100svh] bg-paper text-ink">{children}</div>;
}
