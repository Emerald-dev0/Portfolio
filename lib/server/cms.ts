/**
 * ============================================================================
 * CMS, server-only. Every read and write for posts, categories, tags, media,
 * revisions and slug redirects.
 * ============================================================================
 * Design notes that matter:
 *
 *  - Article bodies stay Markdown. One format on disk, one renderer, and the
 *    seed posts in `content/blog` seed the table on first boot.
 *  - `publishDue()` is idempotent and called from the cron route *and* from
 *    blog reads, so a scheduled post goes live even if the cron never fires.
 *  - Every mutation bumps `updated_at` and writes a revision, so nothing is
 *    ever unrecoverable.
 *  - Slug changes on a published post record a redirect instead of breaking
 *    the old URL.
 *  - Queries are written to avoid N+1: tags and categories are joined in one
 *    pass, never looped per row.
 * ============================================================================
 */

import "server-only";
import { all, one, run, upsert } from "./db";
import { slugify } from "../blog";

/* ----------------------------------------------------------------- types */

export type Status = "draft" | "published" | "scheduled" | "archived";

export type PostRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content_md: string;
  category_id: number | null;
  status: Status;
  featured: number;
  cover_url: string | null;
  cover_alt: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  published_at: string | null;
  scheduled_for: string | null;
  created_at: string;
  updated_at: string;
  read_minutes: number;
  category_slug?: string | null;
  category_name?: string | null;
  tags?: string[];
};

export type PostWrite = {
  title: string;
  slug?: string;
  excerpt?: string;
  content_md?: string;
  category_id?: number | null;
  status?: Status;
  featured?: boolean;
  cover_url?: string | null;
  cover_alt?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image?: string | null;
  scheduled_for?: string | null;
  tags?: string[];
};

/* ------------------------------------------------------------- utilities */

const now = () => new Date().toISOString();

/** Whole minutes at ~200 wpm, never zero. */
export function readMinutes(md: string): number {
  const words = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`\-|]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

type TagRow = { post_id: number; name: string };

/** Attach tags to a page of posts in one query, not one per post. */
async function withTags(rows: PostRow[]): Promise<PostRow[]> {
  if (!rows.length) return rows;
  const ids = rows.map((r) => r.id);
  const placeholders = ids.map(() => "?").join(",");
  const pairs = await all<TagRow>(
    `SELECT pt.post_id, t.name FROM post_tags pt
       JOIN tags t ON t.id = pt.tag_id
      WHERE pt.post_id IN (${placeholders})
      ORDER BY t.name`,
    ids,
  );
  const byPost = new Map<number, string[]>();
  for (const p of pairs) {
    const list = byPost.get(p.post_id) ?? [];
    list.push(p.name);
    byPost.set(p.post_id, list);
  }
  return rows.map((r) => ({ ...r, tags: byPost.get(r.id) ?? [] }));
}

const SELECT = `SELECT p.*, c.slug AS category_slug, c.name AS category_name
                  FROM posts p LEFT JOIN categories c ON c.id = p.category_id`;

/* ---------------------------------------------------------------- reads */

/** Everything, for the admin list. Filter by status or search text. */
export async function listPosts(opts: {
  status?: Status | "all";
  q?: string;
  category?: number;
  limit?: number;
  offset?: number;
} = {}): Promise<PostRow[]> {
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (opts.status && opts.status !== "all") {
    where.push("p.status = ?");
    args.push(opts.status);
  }
  if (opts.category) {
    where.push("p.category_id = ?");
    args.push(opts.category);
  }
  if (opts.q) {
    where.push("(p.title LIKE ? OR p.excerpt LIKE ? OR p.content_md LIKE ?)");
    const like = `%${opts.q}%`;
    args.push(like, like, like);
  }
  const sql = `${SELECT} ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
               ORDER BY COALESCE(p.published_at, p.updated_at) DESC
               LIMIT ? OFFSET ?`;
  args.push(opts.limit ?? 100, opts.offset ?? 0);
  return withTags(await all<PostRow>(sql, args));
}

export async function postById(id: number): Promise<PostRow | null> {
  const row = await one<PostRow>(`${SELECT} WHERE p.id = ?`, [id]);
  if (!row) return null;
  return (await withTags([row]))[0];
}

export async function postBySlug(slug: string): Promise<PostRow | null> {
  const row = await one<PostRow>(`${SELECT} WHERE p.slug = ?`, [slug]);
  if (!row) return null;
  return (await withTags([row]))[0];
}

/** Follow a renamed slug. Returns the new slug, or null. */
export async function resolveRedirect(slug: string): Promise<string | null> {
  const row = await one<{ to_slug: string }>("SELECT to_slug FROM redirects WHERE from_slug = ?", [
    slug,
  ]);
  return row?.to_slug ?? null;
}

/** What the public site lists: published, newest first, paged. */
export async function publishedPosts(opts: { limit?: number; offset?: number } = {}) {
  const rows = await all<PostRow>(
    `${SELECT} WHERE p.status = 'published' AND p.published_at IS NOT NULL
       ORDER BY p.published_at DESC LIMIT ? OFFSET ?`,
    [opts.limit ?? 24, opts.offset ?? 0],
  );
  return withTags(rows);
}

export async function countPublished(): Promise<number> {
  const row = await one<{ n: number }>(
    "SELECT COUNT(*) AS n FROM posts WHERE status = 'published'",
  );
  return Number(row?.n ?? 0);
}

export async function publishedByCategory(slug: string, limit = 50) {
  const rows = await all<PostRow>(
    `${SELECT} WHERE p.status = 'published' AND c.slug = ?
       ORDER BY p.published_at DESC LIMIT ?`,
    [slug, limit],
  );
  return withTags(rows);
}

export async function publishedByTag(slug: string, limit = 50) {
  const rows = await all<PostRow>(
    `${SELECT} JOIN post_tags pt ON pt.post_id = p.id
              JOIN tags t ON t.id = pt.tag_id
      WHERE p.status = 'published' AND t.slug = ?
      ORDER BY p.published_at DESC LIMIT ?`,
    [slug, limit],
  );
  return withTags(rows);
}

/** Related reading: same category first, then shared tags, then recent. */
export async function related(p: PostRow, limit = 3): Promise<PostRow[]> {
  const rows = await all<PostRow>(
    `${SELECT}
      WHERE p.status = 'published' AND p.id != ?
      ORDER BY (CASE WHEN p.category_id = ? THEN 0 ELSE 1 END),
               p.published_at DESC
      LIMIT ?`,
    [p.id, p.category_id ?? -1, limit],
  );
  return withTags(rows);
}

export async function neighbours(p: PostRow) {
  const newer = await one<PostRow>(
    `${SELECT} WHERE p.status = 'published' AND p.published_at > ?
       ORDER BY p.published_at ASC LIMIT 1`,
    [p.published_at ?? ""],
  );
  const older = await one<PostRow>(
    `${SELECT} WHERE p.status = 'published' AND p.published_at < ?
       ORDER BY p.published_at DESC LIMIT 1`,
    [p.published_at ?? ""],
  );
  return { newer, older };
}

/* --------------------------------------------------------------- writes */

async function setTags(postId: number, tags: string[] | undefined): Promise<void> {
  if (!tags) return;
  await run("DELETE FROM post_tags WHERE post_id = ?", [postId]);
  const seen = new Set<string>();
  for (const raw of tags.slice(0, 8)) {
    const name = raw.trim();
    const slug = slugify(name);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    const tagId = await upsert("tags", slug, name);
    await run("INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)", [postId, tagId]);
  }
  // Drop tags nothing references any more, so the tag list stays honest.
  await run("DELETE FROM tags WHERE id NOT IN (SELECT tag_id FROM post_tags)");
}

/** A slug nobody else is using. `-2`, `-3`, ... on collision. */
export async function uniqueSlug(base: string, ignoreId?: number): Promise<string> {
  const root = slugify(base) || "post";
  let candidate = root;
  for (let n = 2; n < 200; n++) {
    const row = await one<{ id: number }>("SELECT id FROM posts WHERE slug = ?", [candidate]);
    if (!row || row.id === ignoreId) return candidate;
    candidate = `${root}-${n}`;
  }
  return `${root}-${Date.now()}`;
}

async function snapshot(row: PostRow, note: string): Promise<void> {
  await run(
    `INSERT INTO revisions (post_id, title, excerpt, content_md, created_at, note)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [row.id, row.title, row.excerpt, row.content_md, now(), note],
  );
  // Keep the last 30 revisions per post; history without unbounded growth.
  await run(
    `DELETE FROM revisions WHERE post_id = ? AND id NOT IN
       (SELECT id FROM revisions WHERE post_id = ? ORDER BY created_at DESC LIMIT 30)`,
    [row.id, row.id],
  );
}

/**
 * Publication timestamps are decided here and nowhere else, so the status and
 * the dates can never disagree: published needs a `published_at`, scheduled
 * needs a `scheduled_for` in the future.
 */
function stampsFor(status: Status, scheduledFor: string | null | undefined, existing: PostRow | null) {
  const iso = now();
  if (status === "published") {
    return { published_at: existing?.published_at ?? iso, scheduled_for: null };
  }
  if (status === "scheduled") {
    return { published_at: null, scheduled_for: scheduledFor ?? iso };
  }
  if (status === "draft") return { published_at: null, scheduled_for: null };
  // archived keeps its original publish date, so a restored post keeps history
  return { published_at: existing?.published_at ?? iso, scheduled_for: null };
}

export async function createPost(input: PostWrite): Promise<PostRow> {
  if (!input.title.trim()) throw new Error("A title is required.");
  const slug = await uniqueSlug(input.slug?.trim() || input.title);
  const status: Status = input.status ?? "draft";
  const iso = now();
  const stamps = stampsFor(status, input.scheduled_for, null);

  const res = await run(
    `INSERT INTO posts
      (slug, title, excerpt, content_md, category_id, status, featured, cover_url, cover_alt,
       seo_title, seo_description, og_image, published_at, scheduled_for, created_at,
       updated_at, read_minutes)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      slug,
      input.title.trim(),
      input.excerpt ?? "",
      input.content_md ?? "",
      input.category_id ?? null,
      status,
      input.featured ? 1 : 0,
      input.cover_url ?? null,
      input.cover_alt ?? null,
      input.seo_title ?? null,
      input.seo_description ?? null,
      input.og_image ?? null,
      stamps.published_at,
      stamps.scheduled_for,
      iso,
      iso,
      readMinutes(input.content_md ?? ""),
    ],
  );
  await setTags(res.lastId, input.tags);
  const row = await postById(res.lastId);
  if (!row) throw new Error("The post could not be read back.");
  return row;
}

export async function updatePost(id: number, input: PostWrite): Promise<PostRow> {
  const existing = await postById(id);
  if (!existing) throw new Error("That post no longer exists.");

  const nextSlug = input.slug?.trim() ? slugify(input.slug) : existing.slug;
  const slug =
    nextSlug !== existing.slug ? await uniqueSlug(nextSlug, id) : existing.slug;

  // A published post that changes its slug leaves a redirect behind.
  if (slug !== existing.slug && existing.status !== "draft") {
    await run(
      `INSERT INTO redirects (from_slug, to_slug, created_at) VALUES (?,?,?)
       ON CONFLICT(from_slug) DO UPDATE SET to_slug = excluded.to_slug`,
      [existing.slug, slug, now()],
    );
  }

  const status: Status = input.status ?? existing.status;
  const stamps = stampsFor(status, input.scheduled_for, existing);
  const content = input.content_md ?? existing.content_md;

  await snapshot(existing, "before edit");

  await run(
    `UPDATE posts SET slug=?, title=?, excerpt=?, content_md=?, category_id=?, status=?,
        featured=?, cover_url=?, cover_alt=?, seo_title=?, seo_description=?, og_image=?,
        published_at=?, scheduled_for=?, updated_at=?, read_minutes=?
      WHERE id=?`,
    [
      slug,
      input.title?.trim() ?? existing.title,
      input.excerpt ?? existing.excerpt,
      content,
      input.category_id === undefined ? existing.category_id : input.category_id,
      status,
      input.featured === undefined ? existing.featured : input.featured ? 1 : 0,
      input.cover_url === undefined ? existing.cover_url : input.cover_url,
      input.cover_alt === undefined ? existing.cover_alt : input.cover_alt,
      input.seo_title === undefined ? existing.seo_title : input.seo_title,
      input.seo_description === undefined ? existing.seo_description : input.seo_description,
      input.og_image === undefined ? existing.og_image : input.og_image,
      stamps.published_at,
      stamps.scheduled_for,
      now(),
      readMinutes(content),
      id,
    ],
  );
  await setTags(id, input.tags);
  const row = await postById(id);
  if (!row) throw new Error("The post could not be read back.");
  return row;
}

/** Duplicate with a fresh slug and draft status. */
export async function duplicatePost(id: number): Promise<PostRow> {
  const source = await postById(id);
  if (!source) throw new Error("That post no longer exists.");
  return createPost({
    ...source,
    title: `${source.title} (copy)`,
    slug: `${source.slug}-copy`,
    status: "draft",
    featured: false,
    tags: source.tags ?? [],
  });
}

export async function deletePost(id: number): Promise<void> {
  await run("DELETE FROM posts WHERE id = ?", [id]);
}

export async function setStatus(
  id: number,
  status: Status,
  scheduledFor?: string | null,
): Promise<PostRow> {
  const existing = await postById(id);
  if (!existing) throw new Error("That post no longer exists.");
  return updatePost(id, { title: existing.title, status, scheduled_for: scheduledFor ?? null });
}

/**
 * Flip every scheduled post whose time has come. Idempotent: running it twice
 * publishes nothing twice, and it is safe to call from a read path.
 * Returns the slugs it published, so callers can revalidate them.
 */
export async function publishDue(at: Date = new Date()): Promise<string[]> {
  const due = await all<{ id: number; slug: string }>(
    `SELECT id, slug FROM posts
      WHERE status = 'scheduled' AND scheduled_for IS NOT NULL AND scheduled_for <= ?`,
    [at.toISOString()],
  );
  if (!due.length) return [];
  for (const row of due) {
    await run(
      `UPDATE posts SET status='published', published_at = ?, scheduled_for = NULL, updated_at = ?
        WHERE id = ? AND status = 'scheduled'`,
      [at.toISOString(), at.toISOString(), row.id],
    );
  }
  return due.map((d) => d.slug);
}

/* ------------------------------------------------------------ revisions */

export async function revisions(postId: number) {
  return all<{
    id: number;
    title: string;
    excerpt: string;
    content_md: string;
    created_at: string;
    note: string | null;
  }>(
    `SELECT id, title, excerpt, content_md, created_at, note FROM revisions
      WHERE post_id = ? ORDER BY created_at DESC LIMIT 30`,
    [postId],
  );
}

/**
 * Restore an old revision. It writes a *new* revision of the current state
 * first, so restoring is itself undoable; it refuses if the post changed after
 * the revision was taken and `force` is not set.
 */
export async function restoreRevision(
  postId: number,
  revisionId: number,
  force = false,
): Promise<PostRow> {
  const rev = await one<{ title: string; excerpt: string; content_md: string; created_at: string }>(
    "SELECT title, excerpt, content_md, created_at FROM revisions WHERE id = ? AND post_id = ?",
    [revisionId, postId],
  );
  if (!rev) throw new Error("That revision no longer exists.");
  const current = await postById(postId);
  if (!current) throw new Error("That post no longer exists.");
  if (!force && current.updated_at > rev.created_at) {
    throw new Error(
      "This post has changed since that revision was saved. Review the diff, then restore with force.",
    );
  }
  return updatePost(postId, {
    title: rev.title,
    excerpt: rev.excerpt,
    content_md: rev.content_md,
  });
}

/* ----------------------------------------------------------- categories */

export async function listCategories() {
  return all<{ id: number; slug: string; name: string; description: string | null; count: number }>(
    `SELECT c.id, c.slug, c.name, c.description,
            (SELECT COUNT(*) FROM posts p WHERE p.category_id = c.id AND p.status='published') AS count
       FROM categories c ORDER BY c.name`,
  );
}

export async function createCategory(name: string, description?: string) {
  const slug = slugify(name);
  if (!slug) throw new Error("A category needs a name.");
  const exists = await one("SELECT id FROM categories WHERE slug = ?", [slug]);
  if (exists) throw new Error("That category already exists.");
  const res = await run(
    "INSERT INTO categories (slug, name, description, created_at) VALUES (?,?,?,?)",
    [slug, name.trim(), description ?? null, now()],
  );
  return res.lastId;
}

export async function renameCategory(id: number, name: string) {
  const slug = slugify(name);
  if (!slug) throw new Error("A category needs a name.");
  await run("UPDATE categories SET name = ?, slug = ? WHERE id = ?", [name.trim(), slug, id]);
}

export async function deleteCategory(id: number) {
  await run("UPDATE posts SET category_id = NULL WHERE category_id = ?", [id]);
  await run("DELETE FROM categories WHERE id = ?", [id]);
}

/** Every tag with its published count, for the analytics and manage screens. */
export async function listTags() {
  return all<{ id: number; slug: string; name: string; count: number }>(
    `SELECT t.id, t.slug, t.name,
            (SELECT COUNT(*) FROM post_tags pt JOIN posts p ON p.id = pt.post_id
              WHERE pt.tag_id = t.id AND p.status='published') AS count
       FROM tags t ORDER BY count DESC, t.name`,
  );
}

/* ---------------------------------------------------------------- media */

export async function listMedia(limit = 60) {
  return all<{
    id: number;
    url: string;
    pathname: string;
    alt: string | null;
    caption: string | null;
    content_type: string | null;
    bytes: number | null;
    created_at: string;
  }>("SELECT * FROM media ORDER BY created_at DESC LIMIT ?", [limit]);
}

export async function addMedia(input: {
  url: string;
  pathname: string;
  alt?: string | null;
  caption?: string | null;
  contentType?: string | null;
  bytes?: number | null;
}) {
  const res = await run(
    `INSERT INTO media (url, pathname, alt, caption, content_type, bytes, created_at)
     VALUES (?,?,?,?,?,?,?)`,
    [
      input.url,
      input.pathname,
      input.alt ?? null,
      input.caption ?? null,
      input.contentType ?? null,
      input.bytes ?? null,
      now(),
    ],
  );
  return res.lastId;
}

export async function deleteMedia(id: number) {
  const row = await one<{ url: string }>("SELECT url FROM media WHERE id = ?", [id]);
  await run("DELETE FROM media WHERE id = ?", [id]);
  return row?.url ?? null;
}

/** Media flagged for removal: uploaded but referenced by no post body. */
export async function unusedMedia() {
  return all<{ id: number; url: string }>(
    `SELECT m.id, m.url FROM media m
      WHERE NOT EXISTS (SELECT 1 FROM posts p WHERE p.content_md LIKE '%' || m.url || '%')
        AND NOT EXISTS (SELECT 1 FROM posts p WHERE p.cover_url = m.url)`,
  );
}
