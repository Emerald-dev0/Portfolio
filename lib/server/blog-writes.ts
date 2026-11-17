/**
 * ============================================================================
 * BLOG WRITES, server-only. Publishing a post, listing drafts, deleting.
 * ============================================================================
 * A post is one Markdown file in Vercel Blob at `posts/<slug>.md`, with YAML
 * frontmatter at the top. That is deliberately boring: the same file works in
 * the repo, in a gist, or in any editor, and the site can read it without a
 * database.
 * ============================================================================
 */

import "server-only";
import { del, list, put } from "@vercel/blob";
import type { Post } from "../blog";

const PREFIX = "posts/";

export type PostInput = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  draft: boolean;
  featured: boolean;
  cover?: string;
  markdown: string;
};

/** Minimal frontmatter writer, quotes everything so YAML can't be broken. */
function frontmatter(input: PostInput): string {
  const q = (s: string) => JSON.stringify(s);
  const lines = [
    "---",
    `title: ${q(input.title)}`,
    `excerpt: ${q(input.excerpt)}`,
    `date: ${input.date}`,
    `tags: ${JSON.stringify(input.tags)}`,
    `featured: ${input.featured}`,
    `draft: ${input.draft}`,
  ];
  if (input.cover) lines.push(`cover: ${q(input.cover)}`);
  lines.push("---", "");
  return lines.join("\n");
}

export function configured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Publish (or update) one post. Returns the public URL of the Markdown file. */
export async function savePost(input: PostInput): Promise<string> {
  if (!configured()) throw new Error("Blob storage is not configured.");
  const { url } = await put(`${PREFIX}${input.slug}.md`, frontmatter(input) + input.markdown, {
    access: "public",
    contentType: "text/markdown; charset=utf-8",
    addRandomSuffix: false,
    allowOverwrite: true,
    // Read-through is short so a publish shows up almost immediately.
    cacheControlMaxAge: 60,
  });
  return url;
}

export async function deletePost(slug: string): Promise<void> {
  if (!configured()) throw new Error("Blob storage is not configured.");
  const { blobs } = await list({ prefix: `${PREFIX}${slug}.md`, limit: 10 });
  await Promise.all(blobs.map((b) => del(b.url)));
}

/** Slugs already published from the studio (so the editor can warn). */
export async function blobSlugs(): Promise<string[]> {
  if (!configured()) return [];
  try {
    const { blobs } = await list({ prefix: PREFIX, limit: 1000 });
    return blobs
      .filter((b) => b.pathname.endsWith(".md"))
      .map((b) => b.pathname.replace(PREFIX, "").replace(/\.md$/, ""));
  } catch {
    return [];
  }
}

/** Sorted studio list: drafts first, then newest. */
export function studioOrder(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    if (Boolean(a.draft) !== Boolean(b.draft)) return a.draft ? -1 : 1;
    return b.date.localeCompare(a.date);
  });
}
