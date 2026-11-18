"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import {
  BoldIcon,
  CodeIcon,
  ImageAdd01Icon,
  ItalicIcon,
  Link01Icon,
  ListSettingIcon,
  MinusSignIcon,
  QuoteUpIcon,
  RedoIcon,
  StrikethroughIcon,
  Table01Icon,
  Heading02Icon,
  Heading03Icon,
  UnderlineIcon,
  UndoIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "../ui/Icon";
import { docToMd, mdToDoc, countWords } from "../../lib/editor/md-doc";

const lowlight = createLowlight(common);

export type SaveState = "idle" | "unsaved" | "saving" | "saved" | "failed";

type Props = {
  initialMarkdown: string;
  onChange: (markdown: string) => void;
  onSaveRequest: () => void;
  saveState: SaveState;
  lastSavedAt: string | null;
};

/**
 * THE EDITOR.
 *
 * TipTap (ProseMirror) rather than a textarea, so headings, lists, quotes,
 * tables, code and images get real editing behaviour. Markdown stays the only
 * stored format: the document is converted in and out by `lib/editor/md-doc`,
 * which is pure and covered by tests, so what you write is exactly what the
 * public renderer reads.
 *
 * Autosave is owned by the page it sits in; this component only reports that
 * content changed and answers keyboard shortcuts. Nothing here talks to the
 * network except the image upload, which posts to the admin media route.
 */
export function Editor({ initialMarkdown, onChange, onSaveRequest, saveState, lastSavedAt }: Props) {
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        codeBlock: false,
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: "Start with the problem, then how you solved it." }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: mdToDoc(initialMarkdown),
    editorProps: {
      attributes: {
        class: "admin-prose focus:outline-none",
        "aria-label": "Article body",
      },
    },
    onUpdate: ({ editor: instance }) => {
      onChange(docToMd(instance.getJSON()));
    },
  });

  /* Ctrl or Cmd plus S saves immediately, and never opens the browser dialog. */
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        onSaveRequest();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSaveRequest]);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      setUploadError(null);
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("alt", file.name.replace(/\.[^.]+$/, ""));
        const res = await fetch("/api/admin/media", { method: "POST", body: form });
        const data = (await res.json().catch(() => ({}))) as { media?: { url: string }; error?: string };
        if (!res.ok || !data.media) {
          setUploadError(data.error ?? "That image could not be uploaded.");
          return;
        }
        editor?.chain().focus().setImage({ src: data.media.url, alt: file.name }).run();
      } catch {
        setUploadError("The upload did not finish. Check your connection.");
      } finally {
        setUploading(false);
      }
    },
    [editor],
  );

  // Word and character counts re-run whenever the document changes, which
  // saveState tracks, since autosave fires on every content edit.
  const { words, characters } = useMemo(() => {
    const md = docToMd(editor?.getJSON() ?? { type: "doc" });
    return { words: countWords(md), characters: md.trim().length };
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, saveState],
  );

  if (!editor) {
    return (
      <div className="sticker-flat min-h-[24rem] animate-pulse p-6" aria-hidden="true">
        <div className="h-3 w-2/3 rounded bg-ink/10" />
      </div>
    );
  }

  return (
    <div
      className="sticker-flat overflow-hidden"
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) e.preventDefault();
      }}
      onDrop={(e) => {
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
          e.preventDefault();
          void upload(file);
        }
      }}
    >
      <Toolbar
        editor={editor}
        onPickImage={() => fileInput.current?.click()}
        uploading={uploading}
      />

      <div className="px-5 py-5 sm:px-7">
        <EditorContent editor={editor} />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t-2 border-ink/10 px-5 py-2.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] muted-soft sm:px-7">
        <span>{words} words</span>
        <span>{characters} characters</span>
        <SaveBadge state={saveState} lastSavedAt={lastSavedAt} />
        <span className="ml-auto hidden sm:inline">Ctrl or Cmd + S to save</span>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />

      <div aria-live="polite">
        {uploadError ? (
          <p className="border-t-2 border-tang bg-tang/15 px-5 py-2 text-sm font-semibold">
            {uploadError}
          </p>
        ) : null}
        {uploading ? (
          <p className="border-t-2 border-ink/10 px-5 py-2 text-sm muted">Uploading image</p>
        ) : null}
      </div>
    </div>
  );
}

export function SaveBadge({ state, lastSavedAt }: { state: SaveState; lastSavedAt: string | null }) {
  const label =
    state === "saving"
      ? "Saving"
      : state === "saved"
        ? `Saved${lastSavedAt ? ` ${timeOf(lastSavedAt)}` : ""}`
        : state === "unsaved"
          ? "Unsaved changes"
          : state === "failed"
            ? "Save failed"
            : "Up to date";
  const tone =
    state === "failed"
      ? "text-tang"
      : state === "unsaved"
        ? "text-ink"
        : state === "saved"
          ? "text-leaf"
          : "muted-soft";
  return (
    <span className={`inline-flex items-center gap-1.5 ${tone}`} aria-live="polite">
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  );
}

function timeOf(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
}

type EditorLike = NonNullable<ReturnType<typeof useEditor>>;

function Toolbar({
  editor,
  onPickImage,
  uploading,
}: {
  editor: EditorLike;
  onPickImage: () => void;
  uploading: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b-2 border-ink/10 bg-ink/[0.03] px-2 py-2">
      <Btn label="Bold" hint="Ctrl+B" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Icon icon={BoldIcon} size={15} />
      </Btn>
      <Btn label="Italic" hint="Ctrl+I" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Icon icon={ItalicIcon} size={15} />
      </Btn>
      <Btn label="Underline" hint="Ctrl+U" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <Icon icon={UnderlineIcon} size={15} />
      </Btn>
      <Btn label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Icon icon={StrikethroughIcon} size={15} />
      </Btn>

      <Divider />

      <Btn label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Icon icon={Heading02Icon} size={15} />
      </Btn>
      <Btn label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Icon icon={Heading03Icon} size={15} />
      </Btn>
      <Btn label="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <Icon icon={CodeIcon} size={15} />
      </Btn>
      <Btn label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Icon icon={QuoteUpIcon} size={15} />
      </Btn>

      <Divider />

      <Btn label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <Icon icon={ListSettingIcon} size={15} />
      </Btn>
      <Btn label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <span className="font-mono text-xs font-bold">1.</span>
      </Btn>
      <Btn label="Table" active={editor.isActive("table")} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
        <Icon icon={Table01Icon} size={15} />
      </Btn>
      <Btn label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Icon icon={MinusSignIcon} size={15} />
      </Btn>

      <Divider />

      <Btn
        label="Link"
        active={editor.isActive("link")}
        onClick={() => {
          const previous = editor.getAttributes("link").href as string | undefined;
          const href = window.prompt("Link URL", previous ?? "https://");
          if (href === null) return;
          if (!href.trim()) {
            editor.chain().focus().unsetLink().run();
            return;
          }
          editor.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run();
        }}
      >
        <Icon icon={Link01Icon} size={15} />
      </Btn>
      <Btn label="Insert image" onClick={onPickImage} disabled={uploading}>
        <Icon icon={ImageAdd01Icon} size={15} />
      </Btn>

      <Divider />

      <Btn label="Undo" hint="Ctrl+Z" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        <Icon icon={UndoIcon} size={15} />
      </Btn>
      <Btn label="Redo" hint="Ctrl+Shift+Z" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        <Icon icon={RedoIcon} size={15} />
      </Btn>

      <span className="ml-auto hidden pr-1 font-mono text-[0.55rem] font-bold uppercase tracking-[0.12em] muted-soft lg:inline">
        Drag an image in, anywhere
      </span>
    </div>
  );
}

function Btn({
  label,
  hint,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  hint?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={hint ? `${label} (${hint})` : label}
      className={`grid size-8 place-items-center rounded-lg border-2 transition ${
        active ? "border-ink bg-ink text-paper" : "border-transparent hover:border-ink/25 hover:bg-ink/5"
      } disabled:opacity-30`}
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="mx-1 h-5 w-px bg-ink/15" aria-hidden="true" />;
