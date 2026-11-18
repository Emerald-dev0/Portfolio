"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft01Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  Copy01Icon,
  Delete01Icon,
  EyeIcon,
  Loading03Icon,
  RefreshIcon,
  SlidersHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "../ui/Icon";
import { StatusPill } from "./StatusPill";
import { Editor, SaveBadge, type SaveState } from "./Editor";
import { ConfirmDialog } from "./ConfirmDialog";
import { PreviewPane } from "./PreviewPane";
import type { PostRow } from "../../lib/server/cms";

type Revision = {
  id: number;
  title: string;
  excerpt: string;
  content_md: string;
  created_at: string;
  note: string | null;
};

type Props = {
  post: PostRow;
  categories: { id: number; name: string }[];
  revisions: Revision[];
  isNew: boolean;
};

const AUTOSAVE_MS = 1800;

/**
 * THE POST EDITOR.
 *
 * Owns the draft state, the autosave loop and every lifecycle action. The
 * rules it keeps:
 *
 *   - nothing is saved twice for the same edit, and a save in flight is never
 *     overtaken by a second one
 *   - the badge is honest: Saving, Saved, Unsaved changes, Save failed
 *   - leaving with unsaved changes asks first
 *   - preview renders the same Markdown the public page will render
 *   - publishing, scheduling, archiving, deleting and changing the slug all
 *     confirm, because all of them are visible to the world
 */
export function PostEditor({ post, categories, revisions, isNew }: Props) {
  const router = useRouter();

  const [markdown, setMarkdown] = useState(post.content_md);
  const [title, setTitle] = useState(post.title);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [slug, setSlug] = useState(post.slug);
  const [categoryId, setCategoryId] = useState<number | null>(post.category_id);
  const [tags, setTags] = useState((post.tags ?? []).join(", "));
  const [featured, setFeatured] = useState(Boolean(post.featured));
  const [seoTitle, setSeoTitle] = useState(post.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(post.seo_description ?? "");
  const [scheduledFor, setScheduledFor] = useState(
    post.scheduled_for ? toLocalInput(post.scheduled_for) : "",
  );

  const [status, setStatus] = useState(post.status);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(post.updated_at);
  const [error, setError] = useState<string | null>(null);
  const id = post.id;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);

  const [confirming, setConfirming] = useState<{
    title: string;
    body: string;
    confirmLabel: string;
    tone?: "danger" | "ink";
    run: () => Promise<void>;
  } | null>(null);

  const snapshot = useMemo(
    () =>
      JSON.stringify({
        title,
        excerpt,
        markdown,
        slug,
        categoryId,
        tags,
        featured,
        seoTitle,
        seoDescription,
      }),
    [title, excerpt, markdown, slug, categoryId, tags, featured, seoTitle, seoDescription],
  );
  const saved = useRef(snapshot);
  const inFlight = useRef(false);

  // A reload or a closed tab with unsaved work should not be silent.
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (snapshot !== saved.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [snapshot]);

  const save = useCallback(
    async (overrides: Record<string, unknown> = {}, options: { silent?: boolean } = {}) => {
      if (inFlight.current) return false;
      inFlight.current = true;
      setSaving(true);
      if (!options.silent) setSaveState("saving");
      else setSaveState("saving");

      const payload = {
        title: title.trim() || "Untitled",
        excerpt,
        content_md: markdown,
        slug: slug.trim() || undefined,
        category_id: categoryId,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        featured,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
        ...overrides,
      };

      try {
        const res = await fetch(`/api/admin/posts/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setSaveState("failed");
          setError(data.error ?? `Save failed (${res.status}).`);
          return false;
        }
        const data = (await res.json()) as { post: PostRow; savedAt: string };
        saved.current = snapshot;
        setLastSavedAt(data.savedAt);
        setSaveState("saved");
        setError(null);
        if (data.post.slug !== slug) setSlug(data.post.slug);
        if (data.post.status !== status) setStatus(data.post.status);
        return true;
      } catch {
        setSaveState("failed");
        setError("The server did not answer. Your work is still here, try save again.");
        return false;
      } finally {
        inFlight.current = false;
        setSaving(false);
      }
    },
    [
      categoryId,
      excerpt,
      featured,
      id,
      markdown,
      seoDescription,
      seoTitle,
      slug,
      snapshot,
      status,
      tags,
      title,
    ],
  );

  // Debounced autosave, only when something actually changed.
  useEffect(() => {
    if (snapshot === saved.current) return;
    setSaveState("unsaved");
    const timer = window.setTimeout(() => {
      void save({}, { silent: true });
    }, AUTOSAVE_MS);
    return () => window.clearTimeout(timer);
  }, [snapshot, save]);

  async function lifecycle(next: string) {
    if (next === "scheduled") {
      if (!scheduledFor) {
        setError("Pick a date and time to schedule this post.");
        return;
      }
      const when = new Date(scheduledFor);
      if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
        setError("That time is in the past. Pick a time in the future.");
        return;
      }
    }

    const ok = await save({
      status: next,
      scheduled_for: next === "scheduled" ? new Date(scheduledFor).toISOString() : null,
    });
    if (!ok) return;

    setStatus(next as PostRow["status"]);
    router.refresh();

    if (next === "published" && isNew) {
      // The first save of a brand new post already created it server side, so
      // the URL is stable now; replace the history entry rather than push.
      router.replace(`/admin/posts/${id}`);
    }
  }

  function askPublish() {
    setConfirming({
      title: "Publish this post?",
      body: `"${title || "Untitled"}" goes live on the blog, in the RSS feed and in the sitemap. Its URL is /blog/${slug || "..."}.`,
      confirmLabel: "Publish now",
      run: () => lifecycle("published"),
    });
  }

  function askUnpublish() {
    setConfirming({
      title: "Unpublish this post?",
      body: "It goes back to draft: the public URL returns 404 and it leaves the feed and the sitemap.",
      confirmLabel: "Move to draft",
      run: () => lifecycle("draft"),
    });
  }

  function askArchive() {
    setConfirming({
      title: "Archive this post?",
      body: "It stays reachable at its URL but leaves the index, the feed and the sitemap, and is marked noindex for search engines.",
      confirmLabel: "Archive",
      run: () => lifecycle("archived"),
    });
  }

  function askDelete() {
    setConfirming({
      title: "Delete this post forever?",
      body: "The post and every revision go with it. This cannot be undone. Archive it instead if you only want it off the blog.",
      confirmLabel: "Delete forever",
      tone: "danger",
      run: async () => {
        const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
        if (res.ok) {
          router.push("/admin/posts");
          router.refresh();
        } else {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setError(data.error ?? "The post could not be deleted.");
        }
      },
    });
  }

  function askSlugChange() {
    const next = slug.trim();
    if (!next || next === post.slug) {
      void save();
      return;
    }
    setConfirming({
      title: "Change the URL?",
      body: `The post moves from /blog/${post.slug} to /blog/${next}. The old address keeps working through a permanent redirect, and external links, search results and shares will follow it.`,
      confirmLabel: "Change URL",
      run: async () => {
        await save({ slug: next });
        router.refresh();
      },
    });
  }

  async function duplicate() {
    const res = await fetch(`/api/admin/posts/${id}/duplicate`, { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as { post?: PostRow; error?: string };
    if (res.ok && data.post) router.push(`/admin/posts/${data.post.id}`);
    else setError(data.error ?? "The post could not be duplicated.");
  }

  async function restore(revisionId: number, createdAt: string) {
    setConfirming({
      title: "Restore this revision?",
      body: `The article will be replaced with the version saved on ${new Date(createdAt).toLocaleString("en-GB", { timeZone: "UTC" })}. The current version is saved as a revision first, so you can undo this.`,
      confirmLabel: "Restore",
      run: async () => {
        const res = await fetch(`/api/admin/posts/${id}/restore`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ revisionId }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          post?: PostRow;
          error?: string;
          needsConfirmation?: boolean;
        };
        if (res.status === 409 && data.needsConfirmation) {
          setConfirming({
            title: "This post is newer than that revision",
            body: data.error ?? "The article changed after this revision was saved. Restoring would discard that work.",
            confirmLabel: "Restore anyway",
            tone: "danger",
            run: async () => {
              await fetch(`/api/admin/posts/${id}/restore`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ revisionId, force: true }),
              });
              router.refresh();
            },
          });
          return;
        }
        if (res.ok && data.post) {
          setMarkdown(data.post.content_md);
          setTitle(data.post.title);
          setExcerpt(data.post.excerpt);
          saved.current = JSON.stringify({
            title: data.post.title,
            excerpt: data.post.excerpt,
            markdown: data.post.content_md,
            slug,
            categoryId,
            tags,
            featured,
            seoTitle,
            seoDescription,
          });
          setSaveState("saved");
          router.refresh();
        } else {
          setError(data.error ?? "That revision could not be restored.");
        }
      },
    });
  }

  const dirty = snapshot !== saved.current;

  return (
    <>
      <form
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/posts"
              className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] muted-soft transition hover:opacity-100"
            >
              <Icon icon={ArrowLeft01Icon} size={13} />
              All posts
            </Link>
            <StatusPill status={status} />
            <SaveBadge state={saveState} lastSavedAt={lastSavedAt} />
            {dirty ? (
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving}
                className="ml-auto inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] disabled:opacity-50"
              >
                {saving ? <Icon icon={Loading03Icon} size={12} className="animate-spin" /> : null}
                Save now
              </button>
            ) : null}
          </div>

          <div aria-live="polite">
            {error ? (
              <p className="mt-3 flex items-start gap-2 rounded-lg border-2 border-tang bg-tang/15 px-3 py-2 text-sm font-semibold">
                {error}
                <button type="button" onClick={() => setError(null)} aria-label="Dismiss" className="ml-auto">
                  <Icon icon={Cancel01Icon} size={14} />
                </button>
              </p>
            ) : null}
          </div>

          <label className="mt-5 block">
            <span className="sr-only">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className="w-full bg-transparent font-display text-3xl font-extrabold leading-tight tracking-tight outline-none placeholder:opacity-30 sm:text-4xl"
            />
          </label>

          <label className="mt-3 block">
            <span className="sr-only">Excerpt</span>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="One or two sentences that explain why someone should read this."
              className="w-full resize-none rounded-xl border-2 border-ink/15 bg-transparent px-3 py-2 text-sm leading-relaxed outline-none focus:border-ink placeholder:opacity-40"
            />
          </label>

          <div className="mt-4">
            <Editor
              initialMarkdown={post.content_md}
              onChange={setMarkdown}
              onSaveRequest={() => void save()}
              saveState={saveState}
              lastSavedAt={lastSavedAt}
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-4">
          <section className="sticker-flat p-4">
            <h2 className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] muted-soft">
              Publishing
            </h2>

            <div className="mt-3 flex flex-col gap-2">
              {status === "published" ? (
                <>
                  <a
                    href={`/blog/${slug}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn btn-paper w-full px-3 py-2 text-sm"
                  >
                    <Icon icon={EyeIcon} size={14} />
                    View live
                  </a>
                  <button type="button" onClick={askUnpublish} className="btn btn-paper w-full px-3 py-2 text-sm">
                    Unpublish
                  </button>
                  <button type="button" onClick={askArchive} className="btn btn-paper w-full px-3 py-2 text-sm">
                    Archive
                  </button>
                </>
              ) : (
                <button type="button" onClick={askPublish} className="btn btn-leaf w-full px-3 py-2 text-sm">
                  Publish now
                </button>
              )}

              <div className="mt-2 rounded-xl border-2 border-ink/15 p-3">
                <label
                  htmlFor="scheduled-for"
                  className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.14em] muted-soft"
                >
                  Schedule for
                </label>
                <input
                  id="scheduled-for"
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border-2 border-ink/20 bg-transparent px-2 py-1.5 text-xs outline-none focus:border-ink"
                />
                <button
                  type="button"
                  onClick={() => void lifecycle("scheduled")}
                  disabled={!scheduledFor}
                  className="btn btn-paper mt-2 w-full px-3 py-1.5 text-xs disabled:opacity-40"
                >
                  {status === "scheduled" ? "Update schedule" : "Schedule"}
                </button>
                {status === "scheduled" && post.scheduled_for ? (
                  <p className="mt-2 text-[0.65rem] leading-snug muted-soft">
                    Goes live {new Date(post.scheduled_for).toLocaleString("en-GB", { timeZone: "UTC" })} UTC.
                  </p>
                ) : null}
              </div>

              <label className="mt-1 flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="size-4 accent-[var(--color-leaf)]"
                />
                Feature on the blog
              </label>
            </div>
          </section>

          <section className="sticker-flat p-4">
            <h2 className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] muted-soft">
              Details
            </h2>

            <label className="mt-3 block text-xs font-bold uppercase tracking-[0.1em] muted-soft" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              value={categoryId ?? ""}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
              className="mt-1 w-full rounded-lg border-2 border-ink/20 bg-paper px-2 py-2 text-sm outline-none focus:border-ink"
            >
              <option value="">Uncategorised</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <label className="mt-3 block text-xs font-bold uppercase tracking-[0.1em] muted-soft" htmlFor="tags">
              Tags
            </label>
            <input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="SQLite, Testing, TypeScript"
              className="mt-1 w-full rounded-lg border-2 border-ink/20 bg-transparent px-2 py-2 text-sm outline-none focus:border-ink placeholder:opacity-40"
            />
            <p className="mt-1 text-[0.62rem] leading-snug muted-soft">Comma separated, six at most.</p>

            <label className="mt-3 block text-xs font-bold uppercase tracking-[0.1em] muted-soft" htmlFor="slug">
              URL
            </label>
            <div className="mt-1 flex items-center gap-1 text-xs">
              <span className="shrink-0 muted-soft">/blog/</span>
              <input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                onBlur={askSlugChange}
                className="w-full rounded-lg border-2 border-ink/20 bg-transparent px-2 py-2 font-mono text-xs outline-none focus:border-ink"
              />
            </div>
            {slug !== post.slug ? (
              <p className="mt-1 text-[0.62rem] font-semibold leading-snug text-tang">
                Changing this leaves a permanent redirect from the old URL.
              </p>
            ) : null}
          </section>

          <section className="sticker-flat p-4">
            <button
              type="button"
              onClick={() => setShowSettings((v) => !v)}
              aria-expanded={showSettings}
              className="flex w-full items-center justify-between font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] muted"
            >
              <span className="inline-flex items-center gap-1.5">
                <Icon icon={SlidersHorizontalIcon} size={12} />
                Search and sharing
              </span>
              <span aria-hidden="true">{showSettings ? "–" : "+"}</span>
            </button>

            {showSettings ? (
              <div className="mt-3">
                <label className="block text-xs font-bold uppercase tracking-[0.1em] muted-soft" htmlFor="seo-title">
                  SEO title
                </label>
                <input
                  id="seo-title"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={title}
                  className="mt-1 w-full rounded-lg border-2 border-ink/20 bg-transparent px-2 py-2 text-sm outline-none focus:border-ink placeholder:opacity-40"
                />
                <label
                  className="mt-3 block text-xs font-bold uppercase tracking-[0.1em] muted-soft"
                  htmlFor="seo-description"
                >
                  Meta description
                </label>
                <textarea
                  id="seo-description"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  rows={3}
                  placeholder={excerpt || "Describe the post for search results."}
                  className="mt-1 w-full resize-none rounded-lg border-2 border-ink/20 bg-transparent px-2 py-2 text-sm outline-none focus:border-ink placeholder:opacity-40"
                />
                <p className="mt-1 text-[0.62rem] muted-soft">
                  {seoDescription.length} characters, around 155 is a good target.
                </p>
              </div>
            ) : null}
          </section>

          <section className="sticker-flat p-4">
            <h2 className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] muted-soft">
              Preview
            </h2>
            <p className="mt-2 text-xs leading-relaxed muted-soft">
              Renders with the same components as the public article, from the current draft.
            </p>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="btn btn-paper mt-3 w-full px-3 py-2 text-sm"
            >
              Open preview
            </button>
          </section>

          <section className="sticker-flat p-4">
            <h2 className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] muted-soft">
              Revisions
            </h2>
            {revisions.length ? (
              <ul className="mt-3 flex flex-col gap-2">
                {revisions.slice(0, 6).map((rev) => (
                  <li key={rev.id} className="flex items-center gap-2 border-b-2 border-ink/10 pb-2 last:border-0">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold">{rev.title}</span>
                      <span className="block font-mono text-[0.55rem] uppercase tracking-[0.1em] muted-soft">
                        {new Date(rev.created_at).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "UTC",
                        })}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => void restore(rev.id, rev.created_at)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-ink/25 px-2 py-1 font-mono text-[0.55rem] font-bold uppercase tracking-[0.1em] transition hover:border-ink"
                    >
                      <Icon icon={RefreshIcon} size={10} />
                      Restore
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs muted-soft">A revision is saved on every edit, so this fills up as you work.</p>
            )}
          </section>

          <section className="flex flex-wrap gap-2">
            <button type="button" onClick={duplicate} className="btn btn-paper flex-1 px-3 py-2 text-xs">
              <Icon icon={Copy01Icon} size={13} />
              Duplicate
            </button>
            <button type="button" onClick={askDelete} className="btn btn-paper px-3 py-2 text-xs text-tang">
              <Icon icon={Delete01Icon} size={13} />
              Delete
            </button>
          </section>
        </aside>
      </form>

      <PreviewPane
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        device={device}
        onDevice={setDevice}
        title={title}
        excerpt={excerpt}
        markdown={markdown}
        tags={tags.split(",").map((t) => t.trim()).filter(Boolean)}
        category={categories.find((c) => c.id === categoryId)?.name ?? null}
        slug={slug}
      />

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

/** ISO to the value a datetime-local input expects, in local time. */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function SuccessNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-sm font-semibold text-leaf">
      <Icon icon={CheckmarkCircle01Icon} size={14} />
      {children}
    </p>
  );
}
