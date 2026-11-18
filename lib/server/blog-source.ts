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
import { slugify, type Post } from "../blog";
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
import { all } from "./db";

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

/* ------------------------------------------------------------ index reads */

/** A post plus the category it sits in, which is what the index shows. */
export type IndexPost = Post & { category: string | null };

export type IndexQuery = {
  q?: string;
  tag?: string;
  category?: string;
  limit?: number;
  offset?: number;
};

export type IndexPage = {
  posts: IndexPost[];
  total: number;
  categories: { name: string; slug: string; count: number }[];
  tags: { name: string; slug: string; count: number }[];
};

/**
 * Everything the index needs, from two reads of the published set.
 *
 * Search, tag, category and paging all filter the same in-memory list, so the
 * four of them can never disagree, and the facet counts are computed from the
 * same rows the cards came from. At the scale of a personal blog (tens of
 * posts, one query) this is both simpler and faster than four SQL paths.
 */
export async function readIndex(query: IndexQuery = {}): Promise<IndexPage> {
  // `publishedPosts` already attaches tags in one query, so this read is two
  // queries in total: the posts with their tags, and the category per slug.
  const rows = await publishedPosts({ limit: 500 });
  const categoryRows = await all<{ slug: string; category_name: string | null }>(
    `SELECT p.slug, c.name AS category_name
       FROM posts p LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.status = 'published'`,
  );
  const categoryBySlug = new Map(categoryRows.map((r) => [r.slug, r.category_name]));

  const posts: IndexPost[] = rows.map((row) => ({
    ...toPost(row),
    category: categoryBySlug.get(row.slug) ?? null,
  }));

  const tagCounts = new Map<string, number>();
  const catCounts = new Map<string, number>();
  for (const p of posts) {
    p.tags.forEach((t) => tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1));
    if (p.category) catCounts.set(p.category, (catCounts.get(p.category) ?? 0) + 1);
  }

  const q = (query.q ?? "").trim().toLowerCase();
  const tag = (query.tag ?? "").trim().toLowerCase();
  const category = (query.category ?? "").trim().toLowerCase();

  const filtered = posts.filter((post) => {
    if (tag && !post.tags.some((t) => t.toLowerCase() === tag)) return false;
    if (category && (post.category ?? "").toLowerCase() !== category) return false;
    if (!q) return true;
    return (
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q) ||
      post.tags.some((t) => t.toLowerCase().includes(q)) ||
      post.content.some((b) => JSON.stringify(b).toLowerCase().includes(q))
    );
  });

  const offset = Math.max(0, query.offset ?? 0);
  const limit = Math.min(100, Math.max(1, query.limit ?? 9));

  return {
    posts: filtered.slice(offset, offset + limit),
    total: filtered.length,
    categories: [...catCounts.entries()]
      .map(([name, count]) => ({ name, slug: slugify(name), count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    tags: [...tagCounts.entries()]
      .map(([name, count]) => ({ name, slug: slugify(name), count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
  };
}

/** The category a post sits in, for metadata and cards. */
export async function categoryNameFor(slug: string): Promise<string | null> {
  const row = await postBySlug(slug);
  return row?.category_name ?? null;
}
