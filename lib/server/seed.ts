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
import { all, run, upsert } from "./db";
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

let seeded = false;

export async function seedOnce(): Promise<void> {
  if (seeded) return;
  seeded = true;

  const existing = await all<{ slug: string }>("SELECT slug FROM posts");
  if (existing.length) return;

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
    const date = String(data.date ?? new Date().toISOString()).slice(0, 10);
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
