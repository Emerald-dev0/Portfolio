/**
 * ============================================================================
 * BLOG, types and pure helpers. Safe to import anywhere (client included).
 * ============================================================================
 * Posts are authored as Markdown. They come from two places, merged by
 * `lib/server/blog-store.ts`:
 *
 *   1. `content/blog/*.md` in the repo, the seed posts, version controlled.
 *   2. Vercel Blob, anything written in /studio, which wins over a file
 *      with the same slug.
 *
 * This file only knows about the shape of a post and how to format it, so a
 * client component can import it without pulling in `fs` or the Blob SDK.
 * ============================================================================
 */

export type CalloutKind = "note" | "tip" | "warning";

export type Block =
  | { type: "heading"; level: 2 | 3 | 4; text: string }
  | { type: "paragraph"; text: string }
  | { type: "code"; lang: string; code: string }
  | { type: "callout"; kind: CalloutKind; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "quote"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "hr" };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date, e.g. "2026-11-10" */
  date: string;
  /** ISO timestamp of the last edit, when known. */
  updated?: string;
  tags: string[];
  featured?: boolean;
  /** Drafts are visible in /studio only, never on the public site. */
  draft?: boolean;
  /** Cover image URL (repo path or Blob URL). */
  cover?: string;
  content: Block[];
  /** Derived: whole minutes at ~200 wpm. */
  readMinutes: number;
};

export type TocEntry = { id: string; text: string; level: 2 | 3 | 4 };

/** Heading anchor ids, shared by the TOC and the renderer. */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The table of contents for a post. */
export function tocOf(content: Block[]): TocEntry[] {
  return content
    .filter((b): b is Extract<Block, { type: "heading" }> => b.type === "heading")
    .map((b) => ({ id: headingId(b.text), text: b.text, level: b.level }));
}

/** "Nov 10, 2026", plain, human, no timestamps. */
export function formatDate(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Newest first, drafts removed. */
export function publicPosts(posts: Post[]): Post[] {
  return posts.filter((p) => !p.draft).sort((a, b) => b.date.localeCompare(a.date));
}

/** Previous (older) and next (newer) posts relative to a slug. */
export function adjacent(posts: Post[], slug: string): { prev: Post | null; next: Post | null } {
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return { prev: posts[i + 1] ?? null, next: posts[i - 1] ?? null };
}

/** Every tag used, for the index filter chips. */
export function tagsOf(posts: Post[]): string[] {
  const set = new Set<string>();
  for (const p of posts) for (const t of p.tags) set.add(t);
  return [...set].sort();
}

/** Slugs must be url-safe and unique-ish. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 70)
    .replace(/-+$/, "");
}

/** Short label for a post's length. */
export function readLabel(post: Post): string {
  return `${post.readMinutes} min read`;
}
