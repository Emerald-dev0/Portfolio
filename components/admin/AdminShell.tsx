import type { ReactNode } from "react";
import { AdminNav } from "./AdminNav";

/**
 * The frame every signed-in admin page sits in: rail on the left, content on
 * the right, one scroll container each on mobile.
 */
export function AdminShell({
  children,
  title,
  description,
  actions,
}: {
  children: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex min-h-[100svh] flex-col lg:flex-row">
      <AdminNav />
      <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold leading-none sm:text-4xl">{title}</h1>
            {description ? (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed muted">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </header>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
