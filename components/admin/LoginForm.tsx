"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LockPasswordIcon, ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";
import { Icon } from "../ui/Icon";

/**
 * SIGN IN. One password, a visible error, a shake that is motion only, and a
 * lockout message that tells you how long to wait. Nothing here decides access:
 * the cookie is set by the server, and every API route checks it again.
 */
export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace("/admin");
        router.refresh();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Sign in failed.");
    } catch {
      setError("The server did not answer. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="sticker w-full max-w-md p-7">
      <span className="grid size-12 place-items-center rounded-2xl border-2 border-ink bg-leaf text-bone">
        <Icon icon={LockPasswordIcon} size={22} />
      </span>
      <h1 className="mt-5 font-display text-3xl font-extrabold leading-none">Blog admin</h1>
      <p className="mt-2 text-sm muted">
        The password is the one in your environment, nothing is stored in the browser.
      </p>

      <label className="mt-6 block font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] muted-soft">
        Password
        <span className="mt-2 flex items-center gap-2 rounded-xl border-2 border-ink bg-paper px-3 py-2">
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete="current-password"
            required
            className="w-full bg-transparent text-base font-medium tracking-normal outline-none"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            className="shrink-0 muted-soft transition hover:opacity-100"
          >
            <Icon icon={show ? ViewOffSlashIcon : ViewIcon} size={16} />
          </button>
        </span>
      </label>

      <div aria-live="polite" className="min-h-6">
        {error ? (
          <p className="mt-3 rounded-lg border-2 border-tang bg-tang/15 px-3 py-2 text-sm font-semibold text-ink">
            {error}
          </p>
        ) : null}
      </div>

      <button type="submit" disabled={busy || !password} className="btn btn-ink mt-4 w-full disabled:opacity-50">
        {busy ? "Checking" : "Sign in"}
      </button>
    </form>
  );
}
