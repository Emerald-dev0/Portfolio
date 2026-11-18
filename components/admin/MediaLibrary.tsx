"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Cancel01Icon, CloudUploadIcon, CopyCheckIcon, Copy01Icon, Delete01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "../ui/Icon";
import { ConfirmDialog } from "./ConfirmDialog";

export type MediaItem = {
  id: number;
  url: string;
  pathname: string;
  alt: string | null;
  caption: string | null;
  content_type: string | null;
  bytes: number | null;
  created_at: string;
};

/**
 * MEDIA LIBRARY. Drag or click to upload, edit the alt text and caption, copy
 * the URL, delete. Uploads are validated on the server (type, size, rewritten
 * name), so this component only has to be pleasant, not trusted.
 */
export function MediaLibrary({ media }: { media: MediaItem[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [confirming, setConfirming] = useState<MediaItem | null>(null);
  const [dragging, setDragging] = useState(false);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        form.append("alt", file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
        const res = await fetch("/api/admin/media", { method: "POST", body: form });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setError(data.error ?? `${file.name} could not be uploaded.`);
        }
      }
      router.refresh();
    } catch {
      setError("The upload did not finish. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function patch(item: MediaItem, patch: Partial<MediaItem>) {
    setBusy(true);
    const res = await fetch(`/api/admin/media/${item.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ alt: patch.alt ?? item.alt, caption: patch.caption ?? item.caption }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "That change was not saved.");
      return;
    }
    setEditing(null);
    router.refresh();
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      setError("The clipboard is blocked here. Select the URL and copy it by hand.");
    }
  }

  return (
    <>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void upload(e.dataTransfer.files);
        }}
        className={`rounded-2xl border-[2.5px] border-dashed p-8 text-center transition ${
          dragging ? "border-leaf bg-leaf/10" : "border-ink/30"
        }`}
      >
        <Icon icon={CloudUploadIcon} size={28} className="mx-auto opacity-60" />
        <p className="mt-3 font-display text-lg font-extrabold">
          {busy ? "Uploading" : "Drop images here"}
        </p>
        <p className="mt-1 text-sm opacity-60">PNG, JPEG, WebP, GIF or AVIF, up to 8 MB each.</p>
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="btn btn-paper mt-4 px-4 py-2 text-sm disabled:opacity-40"
        >
          Choose files
        </button>
        <input
          ref={input}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          className="sr-only"
          onChange={(e) => {
            void upload(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

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

      {media.length ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {media.map((item) => (
            <li key={item.id} className="sticker-flat overflow-hidden">
              <div className="relative aspect-[4/3] border-b-2 border-ink/10 bg-ink/5">
                <Image
                  src={item.url}
                  alt={item.alt ?? ""}
                  fill
                  sizes="(max-width: 640px) 100vw, 300px"
                  className="object-cover"
                />
              </div>
              <div className="p-3">
                {editing?.id === item.id ? (
                  <div>
                    <label className="block text-[0.55rem] font-bold uppercase tracking-[0.12em] opacity-60" htmlFor={`alt-${item.id}`}>
                      Alt text
                    </label>
                    <input
                      id={`alt-${item.id}`}
                      value={editing.alt ?? ""}
                      onChange={(e) => setEditing({ ...editing, alt: e.target.value })}
                      className="mt-1 w-full rounded-lg border-2 border-ink/20 px-2 py-1 text-xs outline-none focus:border-ink"
                    />
                    <label className="mt-2 block text-[0.55rem] font-bold uppercase tracking-[0.12em] opacity-60" htmlFor={`cap-${item.id}`}>
                      Caption
                    </label>
                    <input
                      id={`cap-${item.id}`}
                      value={editing.caption ?? ""}
                      onChange={(e) => setEditing({ ...editing, caption: e.target.value })}
                      className="mt-1 w-full rounded-lg border-2 border-ink/20 px-2 py-1 text-xs outline-none focus:border-ink"
                    />
                    <div className="mt-2 flex gap-1.5">
                      <button type="button" disabled={busy} onClick={() => void patch(item, editing)} className="btn btn-ink px-3 py-1 text-[0.6rem]">
                        Save
                      </button>
                      <button type="button" onClick={() => setEditing(null)} className="btn btn-paper px-3 py-1 text-[0.6rem]">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="truncate text-xs font-semibold">{item.alt || "No alt text"}</p>
                    <p className="mt-0.5 font-mono text-[0.55rem] uppercase tracking-[0.1em] opacity-50">
                      {item.bytes ? `${Math.max(1, Math.round(item.bytes / 1024))} KB` : "image"}
                    </p>
                    <div className="mt-2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => copy(item.url)}
                        aria-label={`Copy URL of ${item.alt ?? "image"}`}
                        className="grid size-7 place-items-center rounded-md border-2 border-ink/20 transition hover:border-ink"
                      >
                        <Icon icon={copied === item.url ? CopyCheckIcon : Copy01Icon} size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(item)}
                        className="rounded-md border-2 border-ink/20 px-2 text-[0.55rem] font-bold uppercase tracking-[0.1em] transition hover:border-ink"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirming(item)}
                        aria-label="Delete image"
                        className="ml-auto grid size-7 place-items-center rounded-md border-2 border-ink/20 text-tang transition hover:border-tang"
                      >
                        <Icon icon={Delete01Icon} size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-2xl border-[2.5px] border-dashed border-ink/30 p-10 text-center">
          <p className="font-display text-xl font-extrabold">No images yet.</p>
          <p className="mt-1 text-sm opacity-70">
            Upload one and paste its URL, or drag it straight into a post.
          </p>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirming)}
        title="Delete this image?"
        body="The file is removed and any post still pointing at it will show a broken image. Check where it is used first."
        confirmLabel="Delete image"
        tone="danger"
        onCancel={() => setConfirming(null)}
        onConfirm={async () => {
          const item = confirming;
          setConfirming(null);
          if (!item) return;
          const res = await fetch(`/api/admin/media/${item.id}`, { method: "DELETE" });
          if (res.ok) router.refresh();
          else setError("That image could not be deleted.");
        }}
      />
    </>
  );
}
