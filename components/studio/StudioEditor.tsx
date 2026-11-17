"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft01Icon,
  ArrowUpRight01Icon,
  CheckIcon,
  Copy01Icon,
  Delete02Icon,
  EyeIcon,
  PencilEdit02Icon,
  RefreshIcon,
  Rocket01Icon,
  TextAlignLeftIcon,
} from "@hugeicons/core-free-icons";
import { parseMarkdown } from "../../lib/markdown";
import { slugify, type Post } from "../../lib/blog";
import { BlockRenderer } from "../blog/BlockRenderer";
import { Doodle } from "../ui/Doodle";
import { Icon } from "../ui/Icon";

/**
 * STUDIO EDITOR, a real writing tool, not a textarea:
 *
 *   · title / slug / date / tags / excerpt / featured / draft controls
 *   · Markdown body with a formatting toolbar (Cmd/Ctrl shortcuts)
 *   · Write ⇄ Preview split on desktop, tabs on mobile
 *   · autosave to localStorage so a refresh never eats a draft
 *   · publish (live) or save draft (studio-only)
 *
 * Preview and the published page use the same BlockRenderer, so what you see
 * here is what ships.
 */

type Draft = {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  tags: string;
  cover: string;
  markdown: string;
  featured: boolean;
  draft: boolean;
};

const BLANK: Draft = {
  title: "",
  slug: "",
  excerpt: "",
  date: new Date().toISOString().slice(0, 10),
  tags: "",
  cover: "",
  markdown:
    "Open with one honest paragraph: what changed, why it mattered, what you'd tell yourself before starting.\n\n## The setup\n\nContext in three lines. What were you building, and what was in the way?\n\n## What I did\n\n```ts\n// the interesting part\n```\n\n> [!TIP]\n> One thing worth stealing.\n\n## What I'd do differently\n\n- The honest list.\n",
  featured: false,
  draft: true,
};

const WELCOME_KEY = "emerald-studio-draft-v1";

const SHORTCUTS: Record<string, [string, string]> = {
  b: ["**", "**"],
  i: ["*", "*"],
  k: ["[", "](https://)"],
  e: ["`", "`"],
};

function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] opacity-55">
        {label}
        {hint ? <span className="ml-1.5 normal-case tracking-normal opacity-70">,  {hint}</span> : null}
      </span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border-2 border-ink bg-paper px-3 py-2 text-sm outline-none transition focus:shadow-[3px_3px_0_var(--color-ink)]";

export function StudioEditor({
  posts,
  hasBlob,
  initialSlug,
}: {
  posts: Post[];
  hasBlob: boolean;
  initialSlug?: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(BLANK);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; text: string; href?: string } | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const loadedSlug = useRef<string | null>(null);

  /* ---- restore an unsaved draft, or open a post passed in the URL ---- */
  useEffect(() => {
    if (loadedSlug.current) return;
    loadedSlug.current = initialSlug ?? "";

    if (initialSlug) {
      void load(initialSlug);
      return;
    }
    try {
      const saved = localStorage.getItem(WELCOME_KEY);
      if (saved) setDraft({ ...BLANK, ...(JSON.parse(saved) as Partial<Draft>) });
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSlug]);

  /* ---- autosave ---- */
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(WELCOME_KEY, JSON.stringify(draft));
      } catch {
        /* quota / private mode, not fatal */
      }
    }, 600);
    return () => clearTimeout(t);
  }, [draft]);

  /* ---- keyboard: Cmd/Ctrl+S saves a draft ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  const slug = slugify(draft.slug || draft.title);
  const blocks = useMemo(() => parseMarkdown(draft.markdown), [draft.markdown]);

  async function load(slugToLoad: string) {
    try {
      const res = await fetch(`/api/studio/posts?slug=${encodeURIComponent(slugToLoad)}`);
      const data = (await res.json()) as { markdown?: string; error?: string };
      if (!res.ok || typeof data.markdown !== "string") throw new Error(data.error ?? "Load failed.");
      const meta = posts.find((p) => p.slug === slugToLoad);
      setDraft({
        title: meta?.title ?? "",
        slug: slugToLoad,
        excerpt: meta?.excerpt ?? "",
        date: meta?.date ?? BLANK.date,
        tags: (meta?.tags ?? []).join(", "),
        cover: meta?.cover ?? "",
        markdown: data.markdown,
        featured: Boolean(meta?.featured),
        draft: Boolean(meta?.draft),
      });
      setSlugTouched(true);
    } catch (err) {
      setToast({ kind: "err", text: err instanceof Error ? err.message : "Load failed." });
    }
  }

  function wrap(before: string, after: string) {
    const el = bodyRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end, value } = el;
    const selected = value.slice(start, end) || "text";
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    set({ markdown: next });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  const onBodyKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    const pair = SHORTCUTS[e.key.toLowerCase()];
    if (pair) {
      e.preventDefault();
      wrap(pair[0], pair[1]);
    }
  };

  async function save(asDraft: boolean) {
    if (!draft.title.trim()) {
      setToast({ kind: "err", text: "Give it a title first." });
      return;
    }
    setBusy(true);
    setToast(null);
    try {
      const res = await fetch("/api/studio/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          slug,
          tags: draft.tags.split(","),
          draft: asDraft,
        }),
      });
      const data = (await res.json()) as { error?: string; href?: string };
      if (!res.ok) throw new Error(data.error ?? "Save failed.");
      setToast({
        kind: "ok",
        text: asDraft ? "Draft saved, only you can see it." : "Published. It's live.",
        href: data.href,
      });
      router.refresh();
    } catch (err) {
      setToast({ kind: "err", text: err instanceof Error ? err.message : "Save failed." });
    } finally {
      setBusy(false);
    }
  }

  async function remove(targetSlug: string) {
    if (!confirm(`Delete “${targetSlug}” permanently?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/studio/posts/${encodeURIComponent(targetSlug)}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Delete failed.");
      setToast({ kind: "ok", text: "Deleted." });
      router.refresh();
    } catch (err) {
      setToast({ kind: "err", text: err instanceof Error ? err.message : "Delete failed." });
    } finally {
      setBusy(false);
    }
  }

  const charCount = draft.markdown.length;
  const wordCount = draft.markdown.split(/\s+/).filter(Boolean).length;

  return (
    <div className="mx-auto max-w-[1500px] px-4 pb-16 pt-6 sm:px-6">
      {/* ---------------------------------------------------------------- */}
      {/* Bar                                                               */}
      {/* ---------------------------------------------------------------- */}
      <div className="sticker-sm flex flex-wrap items-center gap-2 rounded-2xl px-3 py-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 font-mono text-[0.65rem] font-bold uppercase tracking-[0.12em] transition hover:bg-ink/10"
        >
          <Icon icon={ArrowLeft01Icon} size={14} />
          Site
        </Link>
        <span className="grid size-7 place-items-center rounded-lg border-2 border-ink bg-leaf font-display text-sm font-extrabold text-bone">
          E
        </span>
        <span className="font-display text-base font-extrabold">Studio</span>

        <span className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-2 font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] opacity-55 sm:flex">
            {wordCount} words · {Math.max(1, Math.round(wordCount / 200))} min
          </span>
          <button
            type="button"
            onClick={() => save(true)}
            disabled={busy || !hasBlob}
            className="btn btn-paper px-3.5 py-2 text-xs disabled:opacity-40"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() => save(false)}
            disabled={busy || !hasBlob}
            className="btn btn-leaf px-3.5 py-2 text-xs disabled:opacity-40"
          >
            {busy ? "Saving…" : "Publish"}
            <Icon icon={Rocket01Icon} size={14} />
          </button>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/studio/logout", { method: "POST" });
              router.refresh();
            }}
            className="rounded-full px-2.5 py-1.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] opacity-60 transition hover:opacity-100"
          >
            Lock
          </button>
        </span>
      </div>

      {!hasBlob ? (
        <p className="sticker-flat mt-3 bg-tang/25 p-4 text-sm">
          <strong>Read-only:</strong> <code className="font-mono text-xs">BLOB_READ_WRITE_TOKEN</code>{" "}
          isn&rsquo;t set, so nothing can be published yet. You can still write and preview here;
          add the token and redeploy to go live.
        </p>
      ) : null}

      {toast ? (
        <div
          role="status"
          className={`sticker-flat mt-3 flex flex-wrap items-center gap-3 p-4 text-sm ${
            toast.kind === "ok" ? "bg-leaf text-bone" : "bg-tang text-night"
          }`}
        >
          <strong>{toast.text}</strong>
          {toast.href ? (
            <Link
              href={toast.href}
              className="ml-auto inline-flex items-center gap-1.5 font-mono text-[0.65rem] font-bold uppercase tracking-[0.12em] underline decoration-2 underline-offset-4"
            >
              Open
              <Icon icon={ArrowUpRight01Icon} size={13} />
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-auto font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] opacity-70"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        {/* -------------------------------------------------------------- */}
        {/* Left: posts                                                    */}
        {/* -------------------------------------------------------------- */}
        <aside className="lg:col-span-3">
          <div className="sticker-flat p-3 lg:sticky lg:top-6">
            <button
              type="button"
              onClick={() => {
                setDraft({ ...BLANK, date: new Date().toISOString().slice(0, 10) });
                setSlugTouched(false);
                setTab("write");
              }}
              className="btn btn-ink w-full px-3 py-2 text-xs"
            >
              <Icon icon={PencilEdit02Icon} size={14} />
              New post
            </button>

            <p className="mt-4 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] opacity-50">
              {posts.length} posts
            </p>
            <ul className="mt-2 max-h-[52vh] overflow-y-auto pr-1">
              {posts.map((p) => (
                <li key={p.slug} className="group flex items-start gap-1 border-b border-ink/10 py-2 last:border-0">
                  <button
                    type="button"
                    onClick={() => load(p.slug)}
                    className="flex-1 text-left"
                  >
                    <span className="block text-xs font-bold leading-snug transition group-hover:text-leaf">
                      {p.title}
                    </span>
                    <span className="mt-0.5 block font-mono text-[0.55rem] font-bold uppercase tracking-[0.1em] opacity-50">
                      {p.draft ? "draft" : p.date}
                    </span>
                  </button>
                  {p.draft ? (
                    <button
                      type="button"
                      aria-label={`Delete ${p.title}`}
                      onClick={() => remove(p.slug)}
                      className="mt-0.5 shrink-0 opacity-30 transition hover:opacity-100 hover:text-tang"
                    >
                      <Icon icon={Delete02Icon} size={13} />
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* -------------------------------------------------------------- */}
        {/* Middle: meta                                                   */}
        {/* -------------------------------------------------------------- */}
        <div className="lg:col-span-3">
          <div className="sticker-flat flex flex-col gap-3 p-4">
            <Field label="Title">
              <input
                value={draft.title}
                onChange={(e) => {
                  const title = e.target.value;
                  set({ title, ...(slugTouched ? {} : { slug: slugify(title) }) });
                }}
                placeholder="What happened this week?"
                className={`${inputCls} font-display text-base font-extrabold`}
              />
            </Field>

            <Field label="URL" hint={`/blog/${slug || "…"}`}>
              <input
                value={draft.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set({ slug: e.target.value });
                }}
                placeholder="my-post-slug"
                className={`${inputCls} font-mono text-xs`}
              />
            </Field>

            <Field label="Summary" hint="shown in cards + search">
              <textarea
                value={draft.excerpt}
                onChange={(e) => set({ excerpt: e.target.value })}
                rows={3}
                placeholder="Leave blank to use the first paragraph."
                className={`${inputCls} resize-y text-xs leading-relaxed`}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Date">
                <input
                  type="date"
                  value={draft.date}
                  onChange={(e) => set({ date: e.target.value })}
                  className={`${inputCls} font-mono text-xs`}
                />
              </Field>
              <Field label="Tags" hint="comma">
                <input
                  value={draft.tags}
                  onChange={(e) => set({ tags: e.target.value })}
                  placeholder="Building, APIs"
                  className={`${inputCls} text-xs`}
                />
              </Field>
            </div>

            <Field label="Cover image" hint="URL or /path">
              <input
                value={draft.cover}
                onChange={(e) => set({ cover: e.target.value })}
                placeholder="/projects/calder.webp"
                className={`${inputCls} font-mono text-xs`}
              />
            </Field>

            <div className="flex flex-wrap gap-1.5">
              {["/projects/calder.webp", "/projects/testflow.webp", "/projects/telegram.webp"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set({ cover: c })}
                  className="chip px-2 py-0.5 text-[0.55rem] transition hover:-translate-y-0.5"
                >
                  {c.split("/").pop()?.replace(".webp", "")}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(e) => set({ featured: e.target.checked })}
                className="size-4 accent-[var(--color-leaf)]"
              />
              Feature on the blog page
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                checked={draft.draft}
                onChange={(e) => set({ draft: e.target.checked })}
                className="size-4 accent-[var(--color-leaf)]"
              />
              Keep as draft
            </label>

            <div className="mt-1 rounded-xl bg-ink/5 p-3 font-mono text-[0.55rem] leading-relaxed opacity-70">
              Cmd/Ctrl + B bold · I italic · K link · E code · S save draft
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Right: body                                                    */}
        {/* -------------------------------------------------------------- */}
        <div className="lg:col-span-6">
          <div className="sticker-flat overflow-hidden">
            <div className="flex items-center gap-1 border-b-2 border-ink/15 p-2">
              <button
                type="button"
                onClick={() => setTab("write")}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[0.62rem] font-bold uppercase tracking-[0.12em] transition ${
                  tab === "write" ? "bg-ink text-paper" : "hover:bg-ink/10"
                }`}
              >
                <Icon icon={TextAlignLeftIcon} size={13} />
                Write
              </button>
              <button
                type="button"
                onClick={() => setTab("preview")}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[0.62rem] font-bold uppercase tracking-[0.12em] transition lg:hidden ${
                  tab === "preview" ? "bg-ink text-paper" : "hover:bg-ink/10"
                }`}
              >
                <Icon icon={EyeIcon} size={13} />
                Preview
              </button>

              <div className="ml-auto flex items-center gap-0.5">
                {[
                  ["B", "**", "**"],
                  ["I", "*", "*"],
                  ["`", "`", "`"],
                  ["H2", "\n## ", "\n"],
                  ["•", "\n- ", ""],
                  ["”", "\n> ", ""],
                  ["```", "\n```ts\n", "\n```"],
                  ["[!]", "\n> [!TIP]\n> ", ""],
                ].map(([label, before, after]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => wrap(before, after)}
                    className="rounded-md px-1.5 py-1 font-mono text-[0.62rem] font-bold transition hover:bg-ink/10"
                    aria-label={`Insert ${label}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className={tab === "preview" ? "hidden lg:block" : "lg:block"}>
              <textarea
                ref={bodyRef}
                value={draft.markdown}
                onChange={(e) => set({ markdown: e.target.value })}
                onKeyDown={onBodyKeyDown}
                spellCheck
                className="min-h-[62vh] w-full resize-y bg-transparent px-5 py-5 font-mono text-[0.82rem] leading-[1.75] outline-none placeholder:opacity-40"
                placeholder="# Start writing…"
              />
            </div>
            <div className="flex items-center justify-between border-t-2 border-ink/15 px-4 py-2 font-mono text-[0.55rem] font-bold uppercase tracking-[0.12em] opacity-50">
              <span>Markdown · {charCount} chars</span>
              <span className="inline-flex items-center gap-1.5">
                <Icon icon={CheckIcon} size={11} />
                autosaved locally
              </span>
            </div>
          </div>

          {/* Live preview (desktop) / preview tab (mobile) */}
          <div
            className={`sticker-flat mt-4 p-6 ${
              tab === "preview" ? "block" : "hidden lg:block"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] opacity-50">
                Live preview
              </p>
              <span className="inline-flex items-center gap-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] opacity-50">
                <Icon icon={RefreshIcon} size={11} />
                live
              </span>
            </div>

            <article className="mt-5">
              {draft.cover ? (
                <div className="sticker-flat mb-6 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={draft.cover} alt="" className="aspect-[16/9] w-full object-cover" />
                </div>
              ) : null}
              <h1 className="display-card">{draft.title || "Untitled post"}</h1>
              {draft.excerpt ? (
                <p className="mt-3 text-base opacity-80">{draft.excerpt}</p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {draft.tags.split(",").filter(Boolean).map((t) => (
                  <span key={t} className="chip text-[0.6rem]">
                    {t.trim()}
                  </span>
                ))}
              </div>
              <hr className="my-6 border-t-2 border-ink/15" />
              <div className="flex flex-col gap-5">
                {blocks.length ? (
                  blocks.map((b, i) => <BlockRenderer key={i} block={b} />)
                ) : (
                  <p className="font-hand text-2xl opacity-60">
                    Your words show up here as you type.
                  </p>
                )}
              </div>
            </article>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 font-hand text-xl opacity-50">
        <Doodle name="asterisk" className="w-4" strokeWidth={6} />
        write badly, then edit
        <Icon icon={Copy01Icon} size={12} className="opacity-0" />
      </div>
    </div>
  );
}
