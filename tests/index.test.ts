/**
 * The public index read. It is the one place where tags, categories, search,
 * filtering and paging all meet, so it gets its own suite.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "../lib/server/db";
import { createCategory, createPost, setStatus } from "../lib/server/cms";
import { listPublic, readIndex } from "../lib/server/blog-source";

beforeEach(async () => {
  await resetDb();
});

async function seedOne() {
  const catId = await createCategory("Backend Engineering");
  const post = await createPost({
    title: "Queues in Production",
    excerpt: "What broke and why",
    content_md: "## Delivery\n\nAt least once delivery.",
    tags: ["SQLite", "Testing"],
    category_id: catId,
  });
  await setStatus(post.id, "published");
  return post;
}

describe("readIndex", () => {
  it("returns tags and the category for a post", async () => {
    await seedOne();
    const index = await readIndex({ limit: 10 });
    expect(index.total).toBe(1);
    expect(index.posts[0].tags.sort()).toEqual(["SQLite", "Testing"]);
    expect(index.posts[0].category).toBe("Backend Engineering");
  });

  it("builds tag and category facets with counts", async () => {
    await seedOne();
    const index = await readIndex({ limit: 10 });
    expect(index.tags.find((t) => t.name === "SQLite")?.count).toBe(1);
    expect(index.tags.find((t) => t.name === "SQLite")?.slug).toBe("sqlite");
    expect(index.categories[0]).toMatchObject({ name: "Backend Engineering", count: 1 });
  });

  it("filters by tag, case insensitively", async () => {
    await seedOne();
    expect((await readIndex({ tag: "sqlite" })).total).toBe(1);
    expect((await readIndex({ tag: "SQLITE" })).total).toBe(1);
    expect((await readIndex({ tag: "python" })).total).toBe(0);
  });

  it("filters by category name", async () => {
    await seedOne();
    expect((await readIndex({ category: "backend engineering" })).total).toBe(1);
    expect((await readIndex({ category: "design" })).total).toBe(0);
  });

  it("searches titles, excerpts, tags and body text", async () => {
    await seedOne();
    expect((await readIndex({ q: "queues" })).total).toBe(1);
    expect((await readIndex({ q: "broke" })).total).toBe(1);
    expect((await readIndex({ q: "sqlite" })).total).toBe(1);
    expect((await readIndex({ q: "delivery" })).total).toBe(1);
    expect((await readIndex({ q: "kubernetes" })).total).toBe(0);
  });

  it("never returns a draft", async () => {
    await createPost({ title: "Hidden", tags: ["secret"] });
    const index = await readIndex({ limit: 10 });
    expect(index.total).toBe(0);
    expect(index.tags).toHaveLength(0);
  });

  it("pages without losing the total", async () => {
    for (let i = 0; i < 5; i++) {
      const p = await createPost({ title: `Post ${i}` });
      await setStatus(p.id, "published");
    }
    const first = await readIndex({ limit: 2 });
    const second = await readIndex({ limit: 2, offset: 2 });
    expect(first.total).toBe(5);
    expect(first.posts).toHaveLength(2);
    expect(second.posts).toHaveLength(2);
    const slugs = new Set([...first.posts, ...second.posts].map((p) => p.slug));
    expect(slugs.size).toBe(4);
  });
});

describe("listPublic", () => {
  it("returns newest first and skips drafts", async () => {
    const a = await createPost({ title: "Older" });
    await setStatus(a.id, "published");
    const b = await createPost({ title: "Newer" });
    await setStatus(b.id, "published");
    await createPost({ title: "Draft" });

    const posts = await listPublic({ limit: 10 });
    expect(posts).toHaveLength(2);
    expect(posts[0].date >= posts[1].date).toBe(true);
  });
});
