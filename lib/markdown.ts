/**
 * ============================================================================
 * MARKDOWN, turns a Markdown string into the block list the renderer eats.
 * ============================================================================
 * `marked` lexes the document; we map its tokens onto a small, closed set of
 * blocks so the post renderer owns the typography, and so nothing raw is ever
 * injected into the DOM. Inline formatting (bold, italic, links, code) stays
 * as Markdown inside each block and is rendered by <RichText />.
 *
 * Supported beyond the basics:
 *   - `> [!NOTE]` / `[!TIP]` / `[!WARNING]` callouts
 *   - image blocks with an optional italic caption on the next line
 *   - tables
 *   - fenced code with a language hint
 * ============================================================================
 */

import { marked, type Token, type Tokens } from "marked";
import type { Block, CalloutKind, Post } from "./blog";

const CALLOUTS: Record<string, CalloutKind> = {
  NOTE: "note",
  INFO: "note",
  TIP: "tip",
  WARNING: "warning",
  IMPORTANT: "warning",
};

/** Pull `[!NOTE]` off a blockquote's first line and return the rest. */
function readCallout(text: string): { kind: CalloutKind; text: string } | null {
  const m = /^\[!(\w+)\]\s*\n?([\s\S]*)$/.exec(text.trim());
  if (!m) return null;
  const kind = CALLOUTS[m[1].toUpperCase()];
  if (!kind) return null;
  return { kind, text: m[2].trim() };
}

function toBlocks(tokens: Token[]): Block[] {
  const blocks: Block[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    switch (t.type) {
      case "heading": {
        const h = t as Tokens.Heading;
        const level = Math.min(4, Math.max(2, h.depth)) as 2 | 3 | 4;
        blocks.push({ type: "heading", level, text: h.text });
        break;
      }

      case "paragraph": {
        const p = t as Tokens.Paragraph;
        const toks = p.tokens ?? [];

        /* Case A, an image alone in its own paragraph, optionally followed by
           a short italic caption paragraph. */
        const lone =
          toks.length === 1 && toks[0].type === "image" ? (toks[0] as Tokens.Image) : null;
        if (lone) {
          const next = tokens[i + 1];
          let caption: string | undefined;
          let consumed = false;
          if (next?.type === "paragraph") {
            const cand = (next as Tokens.Paragraph).text.trim();
            const cap = /^_([^_]+)_$|^\*([^*]+)\*$/.exec(cand);
            if (cap) {
              caption = (cap[1] ?? cap[2]).trim();
              consumed = true;
            }
          }
          blocks.push({ type: "image", src: lone.href, alt: lone.text || "", caption });
          if (consumed) i++;
          break;
        }

        /* Case B, image then an italic caption in the SAME paragraph (Markdown
           folds them together when there is no blank line between). */
        const img = toks.find((x) => x.type === "image") as Tokens.Image | undefined;
        const em = toks.find((x) => x.type === "em") as Tokens.Em | undefined;
        if (img && em && toks.filter((x) => x.type !== "text" || x.raw.trim()).length === 2) {
          blocks.push({ type: "image", src: img.href, alt: img.text || "", caption: em.text });
          break;
        }

        if (p.text.trim()) blocks.push({ type: "paragraph", text: p.text });
        break;
      }

      case "code": {
        const c = t as Tokens.Code;
        blocks.push({ type: "code", lang: (c.lang || "text").split(/\s+/)[0], code: c.text });
        break;
      }

      case "blockquote": {
        const q = t as Tokens.Blockquote;
        const callout = readCallout(q.text);
        if (callout) blocks.push({ type: "callout", kind: callout.kind, text: callout.text });
        else blocks.push({ type: "quote", text: q.text.trim() });
        break;
      }

      case "list": {
        const l = t as Tokens.List;
        blocks.push({
          type: "list",
          ordered: Boolean(l.ordered),
          items: l.items.map((item) => item.text.trim()).filter(Boolean),
        });
        break;
      }

      case "table": {
        const tb = t as Tokens.Table;
        blocks.push({
          type: "table",
          head: tb.header.map((c) => c.text),
          rows: tb.rows.map((r) => r.map((c) => c.text)),
        });
        break;
      }

      case "hr":
        blocks.push({ type: "hr" });
        break;

      case "image": {
        const im = t as Tokens.Image;
        blocks.push({ type: "image", src: im.href, alt: im.text || "" });
        break;
      }

      case "space":
      case "html":
        break;

      default: {
        // Anything else: fall back to its raw text so nothing silently vanishes.
        const raw = "raw" in t ? String((t as { raw?: string }).raw ?? "").trim() : "";
        if (raw) blocks.push({ type: "paragraph", text: raw });
      }
    }
  }

  return blocks;
}

/** ~200 words a minute, counting prose (not code). */
export function estimateReadTime(markdown: string): number {
  const prose = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`|-]/g, " ");
  const words = prose.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Markdown string → blocks (sync; `marked` is sync for strings). */
export function parseMarkdown(markdown: string): Block[] {
  return toBlocks(marked.lexer(markdown));
}

/** Build a Post from frontmatter + body. Validates the essentials. */
/** YAML parses `date: 2026-11-06` into a Date; normalise to "YYYY-MM-DD". */
function isoDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && value.trim()) {
    const raw = value.trim();
    // Keep a plain YYYY-MM-DD as typed; otherwise parse and re-serialise.
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return null;
}

export function buildPost(
  slug: string,
  data: Record<string, unknown>,
  markdown: string,
): Post | null {
  const title = typeof data.title === "string" ? data.title.trim() : "";
  if (!title) return null;

  const date = isoDate(data.date) ?? new Date().toISOString().slice(0, 10);

  const body = markdown.trim();
  const firstPara = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .find((p) => p && !p.startsWith("#") && !p.startsWith("```") && !p.startsWith(">"));

  const excerpt =
    typeof data.excerpt === "string" && data.excerpt.trim()
      ? data.excerpt.trim()
      : (firstPara ?? "")
          .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
          .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
          .replace(/[*_`#]/g, "")
          .slice(0, 220)
          .trim();

  const tags = Array.isArray(data.tags)
    ? data.tags.map(String).map((t) => t.trim()).filter(Boolean)
    : typeof data.tags === "string"
      ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

  return {
    slug,
    title,
    excerpt,
    date,
    updated: isoDate(data.updated) ?? undefined,
    tags,
    featured: data.featured === true || data.featured === "true",
    draft: data.draft === true || data.draft === "true",
    cover: typeof data.cover === "string" && data.cover.trim() ? data.cover.trim() : undefined,
    content: parseMarkdown(body),
    readMinutes: estimateReadTime(body),
  };
}
