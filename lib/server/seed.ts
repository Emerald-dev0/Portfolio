/**
 * ============================================================================
 * SEED, server-only. Bootstraps the database from the repo's Markdown posts.
 * ============================================================================
 * The archive in `content/blog/*.md` is the version-controlled history of the
 * blog. On first boot, any post in that folder that is not yet in the database
 * is imported, so the site starts with real articles instead of an empty
 * state, and nothing is lost when the storage layer changed.
 *
 * Runs once per process, is idempotent (existing slugs are skipped), and never
 * overwrites an edit made in the dashboard.
 * ============================================================================
 */

import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { one, run, upsert } from "./db";
import { readMinutes } from "./cms";
import { slugify } from "../blog";

const DIR = path.join(process.cwd(), "content", "blog");

const CATEGORY_FOR: Record<string, string> = {
  "building-calder-email-api": "Backend Engineering",
  "building-testflow-exam-backend": "Product Building",
  "telegram-bot-for-github": "Developer Experiences",
  "typescript-patterns-in-production": "JavaScript",
  "designing-interfaces-that-feel-alive": "Web Development",
};


/**
 * YAML turns an unquoted `date: 2026-11-10` into a Date object, so `String()`
 * would give "Tue Nov 10" and every date comparison downstream would break.
 * Normalise to a plain ISO day here, once, at the boundary.
 */
function isoDay(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const raw = String(value ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime())
    ? new Date().toISOString().slice(0, 10)
    : parsed.toISOString().slice(0, 10);
}

export async function seedOnce(): Promise<void> {
  // One indexed count per call. Cheap, and it stays correct if the table is
  // emptied (a reset in tests, or a fresh database mid-flight).
  const existing = await one<{ n: number }>("SELECT COUNT(*) AS n FROM posts");
  if (Number(existing?.n ?? 0) > 0) return;

  let files: string[] = [];
  try {
    files = fs.readdirSync(DIR).filter((f) => f.endsWith(".md"));
  } catch {
    return;
  }

  for (const file of files) {
    const raw = fs.readFileSync(path.join(DIR, file), "utf8");
    const { data, content } = matter(raw);
    const slug = file.replace(/\.md$/, "");
    const title = String(data.title ?? slug);
    const excerpt = String(data.excerpt ?? "");
    const tags = Array.isArray(data.tags) ? data.tags.map(String) : [];
    const date = isoDay(data.date);
    const catName = CATEGORY_FOR[slug] ?? "Software Engineering";
    const categoryId = await upsert("categories", slugify(catName), catName);

    const res = await run(
      `INSERT INTO posts
        (slug, title, excerpt, content_md, category_id, status, featured, cover_url,
         published_at, created_at, updated_at, read_minutes)
       VALUES (?,?,?,?,?,'published',?,?,?,?,?,?)`,
      [
        slug,
        title,
        excerpt,
        content.trim(),
        categoryId,
        data.featured ? 1 : 0,
        typeof data.cover === "string" ? data.cover : null,
        `${date}T09:00:00.000Z`,
        `${date}T09:00:00.000Z`,
        `${date}T09:00:00.000Z`,
        readMinutes(content),
      ],
    );

    for (const t of tags) {
      const tagId = await upsert("tags", slugify(t), t);
      await run("INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?,?)", [res.lastId, tagId]);
    }
  }
}
