"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Doodle } from "../ui/Doodle";
import { Icon } from "../ui/Icon";

/**
 * STUDIO LOGIN, one password, one cookie. Explains exactly which env vars to
 * set when the studio hasn't been configured on this deployment.
 */
export function StudioLogin({ ready }: { ready: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Login failed.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-[100svh] place-items-center px-5 py-32">
      <div className="w-full max-w-md">
        <div className="sticker relative p-7 sm:p-9">
          <span className="grid size-12 place-items-center rounded-2xl border-[2.5px] border-ink bg-leaf text-bone shadow-[4px_4px_0_var(--color-ink)]">
            <Icon icon={LockIcon} size={22} />
          </span>

          <h1 className="display-card mt-6">The studio.</h1>
          <p className="mt-2 text-sm leading-relaxed opacity-80">
            Where posts get written. One password, no accounts, no dashboard to
            forget.
          </p>

          {ready ? (
            <form onSubmit={submit} className="mt-7">
              <label htmlFor="password" className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] opacity-60">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoFocus
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border-[2.5px] border-ink bg-paper px-4 py-3 font-mono text-base outline-none transition focus:shadow-[4px_4px_0_var(--color-ink)]"
                placeholder="••••••••••"
              />
              {error ? (
                <p className="mt-3 rounded-xl border-2 border-ink bg-tang px-3 py-2 text-sm font-semibold text-night">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={busy || !password}
                className="btn btn-ink mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "Checking…" : "Unlock"}
                <Icon icon={ArrowRight01Icon} size={16} />
              </button>
            </form>
          ) : (
            <div className="mt-7 rounded-2xl border-2 border-ink bg-tang/25 p-4 text-sm leading-relaxed">
              <p className="font-bold">Not configured on this deployment.</p>
              <p className="mt-2 opacity-85">
                Add these in Vercel → Project → Settings → Environment Variables, then redeploy:
              </p>
              <ul className="mt-3 space-y-1.5 font-mono text-xs">
                <li>
                  <code className="rounded bg-ink/10 px-1.5 py-0.5">STUDIO_PASSWORD</code>, the
                  password you just tried to type
                </li>
                <li>
                  <code className="rounded bg-ink/10 px-1.5 py-0.5">BLOB_READ_WRITE_TOKEN</code>, 
                  from a Vercel Blob store
                </li>
              </ul>
              <p className="mt-3 opacity-85">
                Until then the site runs on the Markdown files in{" "}
                <code className="rounded bg-ink/10 px-1 py-0.5">content/blog</code>.
              </p>
            </div>
          )}

          <Doodle
            name="spark"
            className="pointer-events-none absolute -right-3 -top-4 w-8 text-tang animate-float"
            strokeWidth={5}
          />
        </div>
      </div>
    </div>
  );
}
