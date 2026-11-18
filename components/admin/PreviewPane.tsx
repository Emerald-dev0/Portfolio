"use client";

import { useEffect, useState } from "react";
import { Cancel01Icon, ComputerIcon, SmartPhone01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "../ui/Icon";
import { BlockRenderer } from "../blog/BlockRenderer";
import { RichText } from "../blog/RichText";
import { formatDate, tocOf, type Block } from "../../lib/blog";

type Props = {
  open: boolean;
  onClose: () => void;
  device: "desktop" | "mobile";
  onDevice: (device: "desktop" | "mobile") => void;
  title: string;
  excerpt: string;
  markdown: string;
  tags: string[];
  category: string | null;
  slug: string;
};

/**
 * LIVE PREVIEW.
 *
 * It does not invent its own rendering. It posts the current draft to
 * /api/admin/preview, which runs the same `buildPost` parser the public page
 * uses, and then draws the blocks with the same `BlockRenderer`. So the title,
 * the headings, the code blocks, the callouts and the images are the real
 * article, only inside a panel behind the admin cookie.
 *
 * Desktop and mobile are the same markup at two widths, which is exactly how
 * the real page behaves.
 */
export function PreviewPane({
  open,
  onClose,
  device,
  onDevice,
  title,
  excerpt,
  markdown,
  tags,
  category,
  slug,
}: Props) {
  const [blocks, setBlocks] = useState<Block[] | null>(null);
  const [minutes, setMinutes] = useState(1);
  const [words, setWords] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/preview", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ title, excerpt, content_md: markdown }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          post?: { content: Block[]; readMinutes: number } | null;
          words?: number;
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "The preview could not be rendered.");
          return;
        }
        setBlocks(data.post?.content ?? []);
        setMinutes(data.post?.readMinutes ?? 1);
        setWords(data.words ?? 0);
      } catch {
        if (!cancelled) setError("The preview could not reach the server.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, title, excerpt, markdown]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const entries = blocks ? tocOf(blocks) : [];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-ink/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Article preview"
    >
      <div className="flex flex-wrap items-center gap-2 border-b-[2.5px] border-ink bg-paper px-4 py-2.5">
        <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em]">Preview</span>
        <span className="hidden font-mono text-[0.55rem] uppercase tracking-[0.12em] opacity-50 sm:inline">
          Private, not indexed, not public
        </span>

        <div className="ml-auto flex items-center gap-1 rounded-full border-2 border-ink p-0.5">
          <button
            type="button"
            onClick={() => onDevice("desktop")}
            aria-pressed={device === "desktop"}
            className={`grid size-7 place-items-center rounded-full ${device === "desktop" ? "bg-ink text-paper" : ""}`}
            aria-label="Desktop width"
          >
            <Icon icon={ComputerIcon} size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDevice("mobile")}
            aria-pressed={device === "mobile"}
            className={`grid size-7 place-items-center rounded-full ${device === "mobile" ? "bg-ink text-paper" : ""}`}
            aria-label="Mobile width"
          >
            <Icon icon={SmartPhone01Icon} size={14} />
          </button>
        </div>

        <span className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.12em] opacity-50">
          {loading ? "Rendering" : `${words} words · ${minutes} min`}
        </span>

        <button
          type="button"
          onClick={onClose}
          className="grid size-8 place-items-center rounded-full border-2 border-ink transition hover:bg-ink hover:text-paper"
          aria-label="Close preview"
        >
          <Icon icon={Cancel01Icon} size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        <div
          className={`mx-auto overflow-hidden rounded-2xl border-[2.5px] border-ink bg-paper shadow-[8px_8px_0_var(--color-ink)] transition-[max-width] duration-300 ${
            device === "mobile" ? "max-w-[390px]" : "max-w-[900px]"
          }`}
        >
          <div className="border-b-2 border-ink/10 px-5 py-3">
            <p className="truncate font-mono text-[0.55rem] uppercase tracking-[0.12em] opacity-50">
              /blog/{slug}
            </p>
          </div>

          <article className="px-5 pb-10 pt-6 sm:px-8">
            <div className="flex flex-wrap gap-1.5">
              {category ? (
                <span className="chip bg-ink text-paper text-[0.6rem]">{category}</span>
              ) : null}
              {tags.map((t) => (
                <span key={t} className="chip text-[0.6rem]">
                  {t}
                </span>
              ))}
            </div>

            <h1 className="display-card mt-3 text-[clamp(1.6rem,4vw,2.6rem)]">
              <RichText text={title || "Untitled"} />
            </h1>
            {excerpt ? (
              <p className="mt-3 text-base leading-relaxed opacity-75">{excerpt}</p>
            ) : null}
            <p className="mt-4 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] opacity-50">
              {formatDate(new Date().toISOString().slice(0, 10))} · {minutes} min read
            </p>

            {entries.length ? (
              <div className="mt-6 rounded-xl border-2 border-ink/15 p-3">
                <p className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.14em] opacity-50">
                  On this page
                </p>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {entries.map((e) => (
                    <li
                      key={e.id}
                      className={`text-xs font-semibold ${e.level === 3 ? "pl-3 opacity-80" : ""}`}
                    >
                      {e.text}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-5">
              {error ? (
                <p className="rounded-lg border-2 border-tang bg-tang/15 px-3 py-2 text-sm font-semibold">
                  {error}
                </p>
              ) : null}
              {blocks?.length ? (
                blocks.map((block, i) => <BlockRenderer key={i} block={block} />)
              ) : (
                <p className="text-sm opacity-50">Nothing to preview yet. Start writing and this fills in.</p>
              )}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
