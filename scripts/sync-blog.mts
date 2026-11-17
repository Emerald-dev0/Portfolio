/**
 * Rebuilds lib/blog.snapshot.json from content/blog/*.md.
 *
 * The site reads Markdown straight from disk when it can. This snapshot is the
 * safety net for deployments where the content directory isn't bundled, and it
 * keeps post routes available at build time regardless.
 *
 * Run it after editing files by hand:  npm run sync:blog
 * (A scheduled workflow does it on a schedule too; studio posts don't need it.)
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { buildPost } from "../lib/markdown";
import type { Post } from "../lib/blog";

const DIR = path.join(process.cwd(), "content", "blog");

const posts = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith(".md"))
  .map((f) => {
    const { data, content } = matter(fs.readFileSync(path.join(DIR, f), "utf8"));
    return buildPost(f.replace(/\.md$/, ""), data as Record<string, unknown>, content);
  })
  .filter((p): p is Post => Boolean(p))
  .sort((a, b) => b.date.localeCompare(a.date));

const out = path.join(process.cwd(), "lib", "blog.snapshot.json");
fs.writeFileSync(out, JSON.stringify({ generated: new Date().toISOString(), posts }, null, 1));

console.log(`✓ ${posts.length} posts → ${path.relative(process.cwd(), out)}`);
