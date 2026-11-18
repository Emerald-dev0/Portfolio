"use client";

import { useEffect, useRef } from "react";

/**
 * CONFIRM DIALOG. A native <dialog> so focus trapping, escape and inertness
 * come from the platform rather than from a fragile custom overlay.
 *
 * It is used for every irreversible or public-facing change: publish, delete,
 * archive, slug change, restoring an old revision.
 */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "ink",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "ink";
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClick={(e) => {
        // A click on the backdrop, not on the panel, dismisses.
        if (e.target === ref.current) onCancel();
      }}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-2xl border-[2.5px] border-ink bg-paper p-0 text-ink shadow-[8px_8px_0_var(--color-ink)] backdrop:bg-ink/50"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-body"
    >
      <div className="p-6">
        <h2 id="confirm-title" className="font-display text-2xl font-extrabold leading-tight">
          {title}
        </h2>
        <p id="confirm-body" className="mt-3 text-sm leading-relaxed opacity-80">
          {body}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn btn-paper px-4 py-2 text-sm">
            {cancelLabel}
          </button>
          <button
            type="button"
            autoFocus
            onClick={() => void onConfirm()}
            className={`btn px-4 py-2 text-sm ${tone === "danger" ? "btn-tang" : "btn-ink"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
