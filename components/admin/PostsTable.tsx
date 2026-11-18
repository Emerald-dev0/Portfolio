"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Copy01Icon,
  Delete01Icon,
  Loading03Icon,
  PencilEdit01Icon,
  Search01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "../ui/Icon";
import { StatusPill } from "./StatusPill";
import { ConfirmDialog } from "./ConfirmDialog";
import { formatDate } from "../../lib/blog";
import type { PostRow } from "../../lib/server/cms";

type Props = { posts: PostRow[]; categories: { id: number; name: string }[] };

const STATUS_FILTERS = ["all", "published", "draft", "scheduled", "archived"] as const;

/**
 * POSTS LIBRARY. A table on desktop, stacked cards on mobile, with the full
 * set of actions per row: edit, duplicate, publish or unpublish, archive,
 * delete. Every destructive action asks first, and every action reports its
 * own failure instead of pretending it worked.
 */
export function PostsTable({ posts, categories }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<{
    title: string;
    body: string;
    confirmLabel: string;
    tone?: "danger" | "ink";
    run: () => Promise<void>;
  } | null>(null);

  const categoryName = (id: number | null) =>
    categories.find((c) => c.id === id)?.name ?? "Uncategorised";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (!q) return true;
      return p.title.toLowerCase().includes(q) || p.slug.includes(q);
    });
  }, [posts, status, query]);

  async function call(label: string, url: string, init: RequestInit) {
    setBusy(label);
    setError(null);
    try {
      const res = await fetch(url, {
        ...init,
        headers: { "content-type": "application/json", ...(init.headers ?? {}) },
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? `That did not work (${res.status}).`);
        return null;
      }
      router.refresh();
      return (await res.json().catch(() => ({}))) as Record<string, unknown>;
    } catch {
      setError("The server did not answer. Try again.");
      return null;
    } finally {
      setBusy(null);
    }
  }

  const transition = (post: PostRow, next: string) => {
    const labels: Record<string, { title: string; body: string; confirm: string }> = {
      published: {
        title: "Publish this post?",
        body: `"${post.title}" becomes public immediately: it appears on the blog, in the feed and in the sitemap.`,
        confirm: "Publish",
      },
      draft: {
        title: "Move back to draft?",
        body: `"${post.title}" disappears from the public site. Anyone with the link will get a 404.`,
        confirm: "Unpublish",
      },
      archived: {
        title: "Archive this post?",
        body: `"${post.title}" stays reachable at its URL but leaves the blog index, the feed and the sitemap, and is marked noindex.`,
        confirm: "Archive",
      },
    };
    const copy = labels[next];
    if (!copy) return;
    setConfirming({
      ...copy,
      confirmLabel: copy.confirm,
      run: async () => {
        await call(
          `${post.id}:${next}`,
          `/api/admin/posts/${post.id}/publish`,
          { method: "POST", body: JSON.stringify({ status: next }) },
        );
      },
    });
  };

  const remove = (post: PostRow) => {
    setConfirming({
      title: "Delete this post permanently?",
      body: `"${post.title}" and its revisions are removed. This cannot be undone, and the URL will 404. If you only want it off the blog, archive it instead.`,
      confirmLabel: "Delete forever",
      tone: "danger",
      run: async () => {
        await call(`${post.id}:delete`, `/api/admin/posts/${post.id}`, { method: "DELETE" });
      },
    });
  };

  const duplicate = (post: PostRow) =>
    call(`${post.id}:duplicate`, `/api/admin/posts/${post.id}/duplicate`, { method: "POST" });

  return (
    <>
      <div className="sticker-sm flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <form
          className="flex flex-1 items-center gap-2 rounded-xl border-2 border-ink px-3 py-2"
          onSubmit={(e) => e.preventDefault()}
        >
          <Icon icon={Search01Icon} size={15} className="opacity-60" />
          <label className="sr-only" htmlFor="post-search">
            Search posts
          </label>
          <input
            id="post-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or slug"
            className="w-full bg-transparent text-sm outline-none placeholder:opacity-50"
          />
          {query ? (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
              <Icon icon={Cancel01Icon} size={14} className="opacity-60" />
            </button>
          ) : null}
        </form>

        <div className="flex gap-1.5 overflow-x-auto" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              aria-pressed={status === s}
              className={`chip shrink-0 text-[0.65rem] capitalize ${status === s ? "bg-ink text-paper" : ""}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div aria-live="polite">
        {error ? (
          <p className="mt-3 rounded-lg border-2 border-tang bg-tang/15 px-3 py-2 text-sm font-semibold">
            {error}
          </p>
        ) : null}
      </div>

      {filtered.length ? (
        <div className="mt-4 overflow-hidden rounded-2xl border-[2.5px] border-ink">
          <table className="hidden w-full border-collapse text-left text-sm md:table">
            <thead>
              <tr className="border-b-[2.5px] border-ink bg-ink text-paper">
                {["Title", "Status", "Category", "Updated", "Actions"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-3 py-2.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr key={post.id} className="border-b-2 border-ink/10 last:border-0">
                  <td className="max-w-[26rem] px-3 py-3">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="block truncate font-semibold hover:text-leaf"
                    >
                      {post.title}
                    </Link>
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] opacity-50">
                      /blog/{post.slug}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <StatusPill status={post.status} />
                  </td>
                  <td className="px-3 py-3 text-xs opacity-70">{categoryName(post.category_id)}</td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-[0.6rem] uppercase tracking-[0.1em] opacity-60">
                    {formatDay(post.updated_at)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/posts/${post.id}`}
                        aria-label={`Edit ${post.title}`}
                        className="grid size-8 place-items-center rounded-lg border-2 border-ink/20 transition hover:border-ink"
                      >
                        <Icon icon={PencilEdit01Icon} size={14} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => duplicate(post)}
                        disabled={busy === `${post.id}:duplicate`}
                        aria-label={`Duplicate ${post.title}`}
                        className="grid size-8 place-items-center rounded-lg border-2 border-ink/20 transition hover:border-ink disabled:opacity-40"
                      >
                        <Icon icon={Copy01Icon} size={14} />
                      </button>
                      <StatusMenu
                        post={post}
                        onTransition={transition}
                        busy={busy}
                      />
                      <button
                        type="button"
                        onClick={() => remove(post)}
                        aria-label={`Delete ${post.title}`}
                        className="grid size-8 place-items-center rounded-lg border-2 border-ink/20 text-tang transition hover:border-tang"
                      >
                        <Icon icon={Delete01Icon} size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile: one card per post */}
          <ul className="flex flex-col md:hidden">
            {filtered.map((post) => (
              <li key={post.id} className="border-b-2 border-ink/10 p-4 last:border-0">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/admin/posts/${post.id}`} className="font-semibold leading-snug">
                    {post.title}
                  </Link>
                  <StatusPill status={post.status} />
                </div>
                <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.1em] opacity-50">
                  {categoryName(post.category_id)} · {formatDay(post.updated_at)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/admin/posts/${post.id}`} className="btn btn-paper px-3 py-1.5 text-xs">
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => duplicate(post)}
                    disabled={busy === `${post.id}:duplicate`}
                    className="btn btn-paper px-3 py-1.5 text-xs disabled:opacity-40"
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(post)}
                    className="btn btn-paper px-3 py-1.5 text-xs text-tang"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border-[2.5px] border-dashed border-ink/30 p-10 text-center">
          <p className="font-display text-xl font-extrabold">
            {posts.length ? "No posts match this filter." : "No posts yet."}
          </p>
          <p className="mt-1 text-sm opacity-70">
            {posts.length
              ? "Try a different status or clear the search."
              : "Write the first one and it appears on the blog the moment you publish."}
          </p>
          {posts.length ? (
            <button
              type="button"
              onClick={() => {
                setStatus("all");
                setQuery("");
              }}
              className="btn btn-ink mt-5 px-4 py-2 text-sm"
            >
              Clear filters
            </button>
          ) : (
            <Link href="/admin/posts/new" className="btn btn-leaf mt-5 px-4 py-2 text-sm">
              New post
            </Link>
          )}
        </div>
      )}

      {busy ? (
        <p className="mt-3 inline-flex items-center gap-2 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] opacity-60">
          <Icon icon={Loading03Icon} size={12} className="animate-spin" />
          Working
        </p>
      ) : null}

      <ConfirmDialog
        open={Boolean(confirming)}
        title={confirming?.title ?? ""}
        body={confirming?.body ?? ""}
        confirmLabel={confirming?.confirmLabel ?? "Confirm"}
        tone={confirming?.tone}
        onCancel={() => setConfirming(null)}
        onConfirm={async () => {
          const action = confirming;
          setConfirming(null);
          await action?.run();
        }}
      />
    </>
  );
}

/** The status changes for one row, in a details element so it needs no JS. */
function StatusMenu({
  post,
  onTransition,
  busy,
}: {
  post: PostRow;
  onTransition: (post: PostRow, status: string) => void;
  busy: string | null;
}) {
  const options = ["published", "draft", "scheduled", "archived"].filter(
    (s) => s !== post.status && !(s === "scheduled"),
  );
  return (
    <details className="relative">
      <summary
        className="grid size-8 cursor-pointer list-none place-items-center rounded-lg border-2 border-ink/20 transition hover:border-ink"
        aria-label={`Change status of ${post.title}`}
      >
        <span className="font-mono text-xs font-bold">···</span>
      </summary>
      <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border-2 border-ink bg-paper shadow-[4px_4px_0_var(--color-ink)]">
        {options.map((s) => (
          <button
            key={s}
            type="button"
            disabled={busy === `${post.id}:${s}`}
            onClick={() => onTransition(post, s)}
            className="block w-full px-3 py-2 text-left text-xs font-semibold capitalize transition hover:bg-ink hover:text-paper disabled:opacity-40"
          >
            {s === "draft" ? "Unpublish to draft" : s === "published" ? "Publish" : "Archive"}
          </button>
        ))}
        <Link
          href={`/admin/posts/${post.id}#publish`}
          className="block border-t-2 border-ink/10 px-3 py-2 text-xs font-semibold transition hover:bg-ink hover:text-paper"
        >
          Schedule
        </Link>
      </div>
    </details>
  );
}

function formatDay(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso.slice(0, 10) : formatDate(d.toISOString().slice(0, 10));
}
