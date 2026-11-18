"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cancel01Icon, Delete01Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { Icon } from "../ui/Icon";
import { ConfirmDialog } from "./ConfirmDialog";

type Category = { id: number; slug: string; name: string; description: string | null; count: number };

/**
 * CATEGORIES. Create, rename, delete. Deleting never destroys a post: the posts
 * in it fall back to uncategorised, which the API does in one transaction.
 */
export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: number; name: string } | null>(null);
  const [confirming, setConfirming] = useState<Category | null>(null);

  async function request(url: string, init: RequestInit) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, {
        ...init,
        headers: { "content-type": "application/json", ...(init.headers ?? {}) },
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "That did not work.");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("The server did not answer.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <section className="sticker-flat h-fit p-5">
          <h2 className="font-display text-lg font-extrabold">New category</h2>
          <form
            className="mt-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!name.trim()) return;
              const ok = await request("/api/admin/categories", {
                method: "POST",
                body: JSON.stringify({ name }),
              });
              if (ok) setName("");
            }}
          >
            <label className="sr-only" htmlFor="category-name">
              Category name
            </label>
            <input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Backend Engineering"
              className="w-full rounded-xl border-2 border-ink/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-ink placeholder:opacity-40"
            />
            <button type="submit" disabled={busy || !name.trim()} className="btn btn-leaf mt-3 w-full px-4 py-2 text-sm disabled:opacity-40">
              <Icon icon={PlusSignIcon} size={14} />
              Add category
            </button>
          </form>

          <div aria-live="polite">
            {error ? (
              <p className="mt-3 flex items-start gap-2 rounded-lg border-2 border-tang bg-tang/15 px-3 py-2 text-sm font-semibold">
                {error}
                <button type="button" onClick={() => setError(null)} aria-label="Dismiss" className="ml-auto">
                  <Icon icon={Cancel01Icon} size={13} />
                </button>
              </p>
            ) : null}
          </div>

          <p className="mt-4 text-xs leading-relaxed muted-soft">
            Categories group posts on the blog index and get their own page at /blog/category/slug.
            Tags stay free form in the editor.
          </p>
        </section>

        <section>
          {categories.length ? (
            <ul className="overflow-hidden rounded-2xl border-[2.5px] border-ink">
              {categories.map((cat) => (
                <li key={cat.id} className="flex flex-wrap items-center gap-3 border-b-2 border-ink/10 p-4 last:border-0">
                  {editing?.id === cat.id ? (
                    <>
                      <input
                        value={editing.name}
                        onChange={(e) => setEditing({ id: cat.id, name: e.target.value })}
                        className="min-w-0 flex-1 rounded-lg border-2 border-ink px-2 py-1.5 text-sm outline-none"
                        aria-label={`Rename ${cat.name}`}
                        autoFocus
                      />
                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          const ok = await request(`/api/admin/categories/${cat.id}`, {
                            method: "PATCH",
                            body: JSON.stringify({ name: editing.name }),
                          });
                          if (ok) setEditing(null);
                        }}
                        className="btn btn-ink px-3 py-1.5 text-xs"
                      >
                        Save
                      </button>
                      <button type="button" onClick={() => setEditing(null)} className="btn btn-paper px-3 py-1.5 text-xs">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{cat.name}</span>
                        <span className="font-mono text-[0.55rem] uppercase tracking-[0.1em] muted-soft">
                          /blog/category/{cat.slug} · {cat.count} published
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditing({ id: cat.id, name: cat.name })}
                        className="rounded-full border-2 border-ink/25 px-3 py-1 font-mono text-[0.55rem] font-bold uppercase tracking-[0.1em] transition hover:border-ink"
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirming(cat)}
                        aria-label={`Delete ${cat.name}`}
                        className="grid size-8 place-items-center rounded-lg border-2 border-ink/20 text-tang transition hover:border-tang"
                      >
                        <Icon icon={Delete01Icon} size={14} />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border-[2.5px] border-dashed border-ink/30 p-10 text-center">
              <p className="font-display text-xl font-extrabold">No categories yet.</p>
              <p className="mt-1 text-sm muted">
                Create one and it appears in the filter rail on the blog straight away.
              </p>
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(confirming)}
        title="Delete this category?"
        body={
          confirming
            ? `${confirming.count > 0 ? `${confirming.count} published post${confirming.count === 1 ? "" : "s"} will become uncategorised. No posts are deleted.` : "No posts use it, so nothing else changes."}`
            : ""
        }
        confirmLabel="Delete category"
        tone="danger"
        onCancel={() => setConfirming(null)}
        onConfirm={async () => {
          const cat = confirming;
          setConfirming(null);
          if (cat) await request(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
        }}
      />
    </>
  );
}
