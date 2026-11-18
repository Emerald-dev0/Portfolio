/**
 * ============================================================================
 * BLOG SOURCE, server-only. The database, adapted into the `Post` shape the
 * existing pages and renderer already understand.
 * ============================================================================
 * This is the bridge that keeps the redesign honest: the public pages, the
 * RSS route, the sitemap, the share cards and the admin preview all read the
 * same rows through this one module, so a published article looks identical
 * everywhere. The Markdown is parsed with the existing `lib/markdown.ts`
 * pipeline and rendered with the existing `BlockRenderer`, so there is exactly
 * one content format and one renderer in the codebase.
 * ============================================================================
 */

import "server-only";
import { buildPost } from "../markdown";
import type { Post } from "../blog";
import {
  publishedPosts,
  postBySlug,
  publishDue,
  related,
  neighbours,
  countPublished,
  type PostRow,
} from "./cms";
import { seedOnce } from "./seed";

/** Row -> Post, through the same Markdown pipeline the files used. */
export function toPost(row: PostRow): Post {
  const built = buildPost(
    row.slug,
    {
      title: row.title,
      excerpt: row.excerpt,
      date: row.published_at ?? row.created_at,
      updated: row.updated_at,
      tags: row.tags ?? [],
      featured: Boolean(row.featured),
      cover: row.cover_url ?? undefined,
    },
    row.content_md,
  );

  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    date: (row.published_at ?? row.created_at).slice(0, 10),
    updated: row.updated_at,
    tags: row.tags ?? [],
    featured: Boolean(row.featured),
    draft: row.status !== "published",
    cover: row.cover_url ?? undefined,
    content: built?.content ?? [],
    readMinutes: built?.readMinutes ?? row.read_minutes,
  };
}

export type BlogFilters = { q?: string; tag?: string; category?: string };

/**
 * The public index. Filtering happens in memory over the published page,
 * which is correct and fast at this scale (dozens of posts, one query) and
 * avoids four different SQL paths for four filter combinations.
 */
export async function listPublic(opts: { limit?: number; offset?: number } = {}): Promise<Post[]> {
  await seedOnce();
  await publishDue();
  const rows = await publishedPosts(opts);
  return rows.map(toPost);
}

export async function getAllPublic(): Promise<Post[]> {
  await seedOnce();
  await publishDue();
  return (await publishedPosts({ limit: 500 })).map(toPost);
}

export async function getPublicPost(slug: string): Promise<Post | null> {
  await seedOnce();
  await publishDue();
  const row = await postBySlug(slug);
  if (!row || row.status !== "published") return null;
  return toPost(row);
}

/** Same as getPublicPost but also returns the row, for analytics and meta. */
export async function getPublicPostWithRow(
  slug: string,
): Promise<{ post: Post; row: PostRow } | null> {
  await seedOnce();
  await publishDue();
  const row = await postBySlug(slug);
  if (!row || row.status !== "published") return null;
  return { post: toPost(row), row };
}

export async function getRelated(slug: string, limit = 3): Promise<Post[]> {
  const row = await postBySlug(slug);
  if (!row) return [];
  return (await related(row, limit)).map(toPost);
}

export async function getNeighbours(slug: string): Promise<{ newer: Post | null; older: Post | null }> {
  const row = await postBySlug(slug);
  if (!row) return { newer: null, older: null };
  const { newer, older } = await neighbours(row);
  return { newer: newer ? toPost(newer) : null, older: older ? toPost(older) : null };
}

export async function totalPublished(): Promise<number> {
  await seedOnce();
  await publishDue();
  return countPublished();
}
