/**
 * ============================================================================
 * MARKDOWN TO TIPTAP DOC, pure, no DOM, unit tested.
 * ============================================================================
 * The database stores Markdown, because Markdown is what the renderer eats and
 * what a diff, a revision and an export can all read. The editor works on a
 * ProseMirror document, because that is what gives you real cursor behaviour,
 * undo, and paste handling.
 *
 * So: one lossless-enough conversion in, one out. The rules follow exactly the
 * blocks `lib/markdown.ts` produces, which is the set the site can render:
 * heading, paragraph, code, callout, list, quote, image, table, hr.
 *
 * Anything we cannot round-trip is preserved rather than dropped: unknown
 * constructs become paragraphs of their literal text, so opening and saving an
 * article in the editor never silently deletes prose.
 * ============================================================================
 */

import type { JSONContent } from "@tiptap/react";

/* --------------------------------------------------------------- inline */

const INLINE_RE =
  /(\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|\*[^*\n]+\*|_[^_\n]+_|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

type Mark = { type: string; attrs?: Record<string, unknown> };

/** Split one line of Markdown into text nodes carrying marks. */
export function inlineToNodes(text: string): JSONContent[] {
  const nodes: JSONContent[] = [];

  for (const part of text.split(INLINE_RE)) {
    if (!part) continue;

    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      nodes.push({ type: "text", text: part.slice(2, -2), marks: [{ type: "bold" }] });
    } else if (part.startsWith("__") && part.endsWith("__") && part.length > 4) {
      nodes.push({ type: "text", text: part.slice(2, -2), marks: [{ type: "bold" }] });
    } else if (part.startsWith("~~") && part.endsWith("~~") && part.length > 4) {
      nodes.push({ type: "text", text: part.slice(2, -2), marks: [{ type: "strike" }] });
    } else if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      nodes.push({ type: "text", text: part.slice(1, -1), marks: [{ type: "italic" }] });
    } else if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
      nodes.push({ type: "text", text: part.slice(1, -1), marks: [{ type: "italic" }] });
    } else if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      nodes.push({ type: "text", text: part.slice(1, -1), marks: [{ type: "code" }] });
    } else if (/^\[[^\]]+\]\([^)\s]+\)$/.test(part)) {
      const m = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
      if (m) nodes.push({ type: "text", text: m[1], marks: [{ type: "link", attrs: { href: m[2] } }] });
    } else {
      nodes.push({ type: "text", text: part });
    }
  }

  return nodes.length ? nodes : [{ type: "text", text: text }];
}

const para = (text: string): JSONContent =>
  text.trim() ? { type: "paragraph", content: inlineToNodes(text) } : { type: "paragraph" };

/* ------------------------------------------------------------ md -> doc */

const CALLOUTS: Record<string, "note" | "tip" | "warning"> = {
  NOTE: "note",
  INFO: "note",
  TIP: "tip",
  WARNING: "warning",
  IMPORTANT: "warning",
};

/**
 * Convert a Markdown article into a TipTap document.
 * Block-level only, because the renderer is block-level too.
 */
export function mdToDoc(md: string): JSONContent {
  const content: JSONContent[] = [];
  const lines = (md ?? "").replace(/\r\n/g, "\n").split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    /* blank */
    if (!line.trim()) {
      i++;
      continue;
    }

    /* fenced code */
    const fence = /^```(\S*)\s*$/.exec(line);
    if (fence) {
      const lang = fence[1] || "text";
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) body.push(lines[i++]);
      i++; // closing fence
      content.push({
        type: "codeBlock",
        attrs: { language: lang },
        content: [{ type: "text", text: body.join("\n") }],
      });
      continue;
    }

    /* horizontal rule */
    if (/^(---|\*\*\*|___)\s*$/.test(line)) {
      content.push({ type: "horizontalRule" });
      i++;
      continue;
    }

    /* heading */
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      const level = Math.min(4, Math.max(2, heading[1].length));
      content.push({
        type: "heading",
        attrs: { level },
        content: inlineToNodes(heading[2].trim()),
      });
      i++;
      continue;
    }

    /* blockquote, possibly a callout */
    if (line.startsWith(">")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      const joined = quote.join("\n").trim();
      const callout = /^\[!(\w+)\]\s*\n?([\s\S]*)$/.exec(joined);
      if (callout) {
        const kind = CALLOUTS[callout[1].toUpperCase()] ?? "note";
        content.push({
          type: "blockquote",
          attrs: { callout: kind },
          content: [para(callout[2].trim())],
        });
      } else {
        content.push({ type: "blockquote", content: [para(joined)] });
      }
      continue;
    }

    /* table */
    if (/^\s*\|.*\|\s*$/.test(line) && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] ?? "")) {
      const cells = (row: string) =>
        row
          .trim()
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((c) => c.trim());
      const header = cells(line);
      i += 2;
      const rows: JSONContent[] = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        rows.push({
          type: "tableRow",
          content: cells(lines[i]).map((c) => ({
            type: "tableCell",
            content: [para(c)],
          })),
        });
        i++;
      }
      content.push({
        type: "table",
        content: [
          {
            type: "tableRow",
            content: header.map((c) => ({
              type: "tableHeader",
              content: [{ type: "paragraph", content: inlineToNodes(c) }],
            })),
          },
          ...rows,
        ],
      });
      continue;
    }

    /* list, ordered or not, single level (the renderer is single level) */
    const bullet = /^\s*[-*+]\s+(.*)$/.exec(line);
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (bullet || numbered) {
      const ordered = Boolean(numbered);
      const items: JSONContent[] = [];
      const matches = ordered ? /^\s*\d+[.)]\s+(.*)$/ : /^\s*[-*+]\s+(.*)$/;
      while (i < lines.length) {
        const m = matches.exec(lines[i]);
        if (!m) break;
        items.push({ type: "listItem", content: [para(m[1])] });
        i++;
      }
      content.push({ type: ordered ? "orderedList" : "bulletList", content: items });
      continue;
    }

    /* standalone image, with an optional italic caption line after it */
    const image = /^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/.exec(line.trim());
    if (image) {
      const captionMatch = /^_([^_]+)_\s*$|^\*([^*]+)\*\s*$/.exec((lines[i + 1] ?? "").trim());
      content.push({
        type: "image",
        attrs: { src: image[2], alt: image[1], caption: captionMatch ? (captionMatch[1] ?? captionMatch[2]) : null },
      });
      i += captionMatch ? 2 : 1;
      continue;
    }

    /* paragraph, gathered until a blank line or another block starts */
    const buf: string[] = [];
    while (i < lines.length) {
      const l = lines[i];
      if (!l.trim()) break;
      if (/^(#{1,6})\s/.test(l) || l.startsWith(">") || /^```/.test(l)) break;
      if (/^(---|\*\*\*|___)\s*$/.test(l)) break;
      if (/^\s*[-*+]\s+/.test(l) || /^\s*\d+[.)]\s+/.test(l)) break;
      if (/^!\[[^\]]*\]\([^)\s]+\)\s*$/.test(l.trim())) break;
      buf.push(l.trim());
      i++;
    }
    if (buf.length) content.push(para(buf.join("\n")));
  }

  return { type: "doc", content: content.length ? content : [{ type: "paragraph" }] };
}

/* ------------------------------------------------------------ doc -> md */

/** Serialise inline nodes back to Markdown, preserving the original marks. */
export function nodesToInline(nodes: JSONContent[] = []): string {
  return nodes
    .map((node) => {
      if (node.type !== "text") return node.text ?? "";
      const text = node.text ?? "";
      const marks = (node.marks ?? []) as Mark[];
      const has = (type: string) => marks.some((m) => m.type === type);

      const link = marks.find((m) => m.type === "link");
      let out = text;
      if (has("code")) out = `\`${out}\``;
      if (has("bold")) out = `**${out}**`;
      if (has("italic")) out = `*${out}*`;
      if (has("strike")) out = `~~${out}~~`;
      if (link) out = `[${out}](${String(link.attrs?.href ?? "")})`;
      return out;
    })
    .join("");
}

/** Plain text of a container, newlines kept. */
function textOf(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  const inner = (node.content ?? []).map(textOf).join("");
  return inner;
}

/** Convert a TipTap document back into Markdown. */
export function docToMd(doc: JSONContent | null | undefined): string {
  if (!doc?.content) return "";
  const out: string[] = [];

  for (const node of doc.content) {
    switch (node.type) {
      case "heading": {
        const level = Number(node.attrs?.level ?? 2);
        out.push(`${"#".repeat(Math.min(4, Math.max(2, level)))} ${nodesToInline(node.content)}`);
        break;
      }

      case "paragraph": {
        out.push(nodesToInline(node.content).trimEnd());
        break;
      }

      case "codeBlock": {
        const lang = String(node.attrs?.language ?? "text");
        out.push(["```" + (lang === "text" ? "" : lang), textOf(node), "```"].join("\n"));
        break;
      }

      case "blockquote": {
        const callout = node.attrs?.callout as string | null | undefined;
        const body = (node.content ?? []).map((c) => textOf(c)).join("\n\n").trim();
        if (callout) {
          const tag = callout === "tip" ? "TIP" : callout === "warning" ? "WARNING" : "NOTE";
          out.push(
            ["> [!" + tag + "]", ...body.split("\n").map((l) => "> " + l)].join("\n"),
          );
        } else {
          out.push(body.split("\n").map((l) => "> " + l).join("\n"));
        }
        break;
      }

      case "bulletList":
      case "orderedList": {
        const ordered = node.type === "orderedList";
        const items = (node.content ?? []).map((item, index) => {
          const body = (item.content ?? []).map((c) => nodesToInline(c.content).trim()).join("\n\n");
          return `${ordered ? `${index + 1}.` : "-"} ${body}`;
        });
        out.push(items.join("\n"));
        break;
      }

      case "image": {
        const src = String(node.attrs?.src ?? "");
        const alt = String(node.attrs?.alt ?? "");
        const caption = node.attrs?.caption ? String(node.attrs.caption) : "";
        out.push(`![${alt}](${src})${caption ? `\n_${caption}_` : ""}`);
        break;
      }

      case "table": {
        const rows = (node.content ?? []).map((row) =>
          (row.content ?? []).map((cell) => textOf(cell).trim()),
        );
        if (!rows.length) break;
        const width = Math.max(...rows.map((r) => r.length));
        const pad = (r: string[]) => [...r, ...Array(width - r.length).fill("")];
        out.push(
          [
            `| ${pad(rows[0]).join(" | ")} |`,
            `| ${Array(width).fill("---").join(" | ")} |`,
            ...rows.slice(1).map((r) => `| ${pad(r).join(" | ")} |`),
          ].join("\n"),
        );
        break;
      }

      case "horizontalRule": {
        out.push("---");
        break;
      }

      default: {
        // An unknown node type keeps its words rather than vanishing.
        const text = textOf(node).trim();
        if (text) out.push(text);
      }
    }
  }

  return out.join("\n\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

/** Words in a Markdown string, code excluded, for the editor's counter. */
export function countWords(md: string): number {
  return (md ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}
