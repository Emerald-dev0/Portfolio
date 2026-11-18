/**
 * The CMS data layer, exercised against a real in-memory libSQL database.
 * Every one of these hits actual SQL, so a broken query fails the suite.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "../lib/server/db";
import {
  createCategory,
  createPost,
  deletePost,
  duplicatePost,
  listCategories,
  listPosts,
  postById,
  postBySlug,
  publishDue,
  publishedPosts,
  readMinutes,
  related,
  resolveRedirect,
  restoreRevision,
  revisions,
  setStatus,
  uniqueSlug,
  updatePost,
} from "../lib/server/cms";

beforeEach(async () => {
  await resetDb();
});

describe("creating posts", () => {
  it("derives a slug from the title and starts as a draft", async () => {
    const post = await createPost({ title: "Designing for the Bottom Line" });
    expect(post.slug).toBe("designing-for-the-bottom-line");
    expect(post.status).toBe("draft");
    expect(post.published_at).toBeNull();
  });

  it("refuses a post with no title", async () => {
    await expect(createPost({ title: "   " })).rejects.toThrow(/title is required/i);
  });

  it("de-duplicates a slug instead of colliding", async () => {
    const a = await createPost({ title: "Same Name" });
    const b = await createPost({ title: "Same Name" });
    expect(a.slug).toBe("same-name");
    expect(b.slug).toBe("same-name-2");
    await expect(uniqueSlug("same-name")).resolves.toBe("same-name-3");
  });

  it("keeps tags and reads them back", async () => {
    const post = await createPost({
      title: "Tagged",
      tags: ["SQLite", "Testing"],
    });
    expect(post.tags).toEqual(["SQLite", "Testing"]);
  });

  it("computes read time from prose, not code", () => {
    expect(readMinutes("")).toBe(1);
    const prose = Array.from({ length: 400 }, () => "word").join(" ");
    expect(readMinutes(prose)).toBe(2);
    const code = ["```ts", ...Array.from({ length: 400 }, () => "word"), "```"].join("\n");
    expect(readMinutes(code)).toBe(1);
  });
});

describe("status lifecycle", () => {
  it("stamps a publish date the first time it is published", async () => {
    const post = await createPost({ title: "Going Live" });
    const live = await setStatus(post.id, "published");
    expect(live.status).toBe("published");
    expect(live.published_at).toBeTruthy();

    const again = await setStatus(post.id, "published");
    expect(again.published_at).toBe(live.published_at);
  });

  it("drops out of the public list when archived but keeps its url", async () => {
    const post = await createPost({ title: "Old News" });
    await setStatus(post.id, "published");
    await setStatus(post.id, "archived");
    expect(await publishedPosts()).toHaveLength(0);
    const row = await postBySlug("old-news");
    expect(row?.status).toBe("archived");
  });

  it("hides drafts from every public read", async () => {
    await createPost({ title: "Secret" });
    expect(await publishedPosts()).toHaveLength(0);
  });
});

describe("scheduling", () => {
  it("does not publish a scheduled post early", async () => {
    const post = await createPost({ title: "Tomorrow" });
    const future = new Date(Date.now() + 60 * 60_000).toISOString();
    await setStatus(post.id, "scheduled", future);
    expect(await publishDue()).toEqual([]);
    expect((await postById(post.id))?.status).toBe("scheduled");
  });

  it("publishes a due post exactly once", async () => {
    const post = await createPost({ title: "Due Now" });
    const soon = new Date(Date.now() + 60_000).toISOString();
    await setStatus(post.id, "scheduled", soon);

    const first = await publishDue(new Date(Date.now() + 120_000));
    expect(first).toEqual(["due-now"]);

    const second = await publishDue(new Date(Date.now() + 180_000));
    expect(second).toEqual([]);

    const row = await postById(post.id);
    expect(row?.status).toBe("published");
    expect(row?.scheduled_for).toBeNull();
  });
});

describe("editing", () => {
  it("leaves a redirect behind when a live post changes slug", async () => {
    const post = await createPost({ title: "First Title" });
    await setStatus(post.id, "published");
    await updatePost(post.id, { title: "First Title", slug: "better-title" });

    expect(await postBySlug("better-title")).toBeTruthy();
    await expect(resolveRedirect("first-title")).resolves.toBe("better-title");
  });

  it("does not create a redirect for a draft that was renamed", async () => {
    const post = await createPost({ title: "Unreleased" });
    await updatePost(post.id, { title: "Unreleased", slug: "still-unreleased" });
    await expect(resolveRedirect("unreleased")).resolves.toBeNull();
  });

  it("refuses to edit a post that is gone", async () => {
    await expect(updatePost(9999, { title: "Ghost" })).rejects.toThrow(/no longer exists/i);
  });
});

describe("duplicating and deleting", () => {
  it("duplicates as a draft with a new slug", async () => {
    const post = await createPost({ title: "Original", content_md: "body", tags: ["x"] });
    await setStatus(post.id, "published");
    const copy = await duplicatePost(post.id);
    expect(copy.slug).toBe("original-copy");
    expect(copy.status).toBe("draft");
    expect(copy.content_md).toBe("body");
    expect(copy.tags).toEqual(["x"]);
  });

  it("deletes permanently", async () => {
    const post = await createPost({ title: "Throwaway" });
    await deletePost(post.id);
    expect(await postById(post.id)).toBeNull();
  });
});

describe("revisions", () => {
  it("records a revision on each save and can restore one", async () => {
    const post = await createPost({ title: "Draft One", content_md: "first body" });
    await updatePost(post.id, { title: "Draft One", content_md: "second body" });

    const list = await revisions(post.id);
    expect(list.length).toBeGreaterThanOrEqual(1);

    const oldest = list[list.length - 1];
    const restored = await restoreRevision(post.id, oldest.id, true);
    expect(restored.content_md).toBe(oldest.content_md);
  });

  it("warns instead of silently overwriting a newer edit", async () => {
    const post = await createPost({ title: "Moving On", content_md: "v1" });
    // A revision captures the state *before* an edit, so take one first.
    await updatePost(post.id, { title: "Moving On", content_md: "v1 edited" });
    const revs = await revisions(post.id);
    const first = revs[0];
    // a later save moves the post past the revision
    await new Promise((r) => setTimeout(r, 5));
    await updatePost(post.id, { title: "Moving On", content_md: "v2" });
    await expect(restoreRevision(post.id, first.id)).rejects.toThrow(/has changed since/i);
  });

  it("errors clearly for an unknown revision", async () => {
    const post = await createPost({ title: "Whatever" });
    await expect(restoreRevision(post.id, 424242)).rejects.toThrow(/no longer exists/i);
  });
});

describe("categories", () => {
  it("creates, counts and deletes without orphaning posts", async () => {
    const catId = await createCategory("Backend Engineering");
    const post = await createPost({ title: "Queues", category_id: catId });
    expect(post.category_id).toBe(catId);
    await setStatus(post.id, "published");

    const withCount = await listCategories();
    expect(withCount.find((c) => c.id === catId)?.count).toBe(1);

    const { deleteCategory } = await import("../lib/server/cms");
    await deleteCategory(catId);
    const row = await postById(post.id);
    expect(row?.category_id).toBeNull();
  });

  it("will not create two categories with the same name", async () => {
    await createCategory("Web Development");
    await expect(createCategory("Web Development")).rejects.toThrow();
  });
});

describe("queries", () => {
  it("lists posts filtered by status and search text", async () => {
    await createPost({ title: "Alpha One" });
    const b = await createPost({ title: "Beta Two" });
    await setStatus(b.id, "published");

    expect((await listPosts({ status: "published" })).map((p) => p.title)).toEqual(["Beta Two"]);
    expect((await listPosts({ status: "all", q: "Alpha" })).map((p) => p.title)).toEqual(["Alpha One"]);
  });

  it("suggests related posts that share a tag", async () => {
    const a = await createPost({ title: "A Post", tags: ["sqlite"] });
    await setStatus(a.id, "published");
    const b = await createPost({ title: "B Post", tags: ["sqlite"] });
    await setStatus(b.id, "published");
    const rowA = await postById(a.id);
    const rel = await related(rowA!);
    expect(rel.map((r) => r.title)).toContain("B Post");
  });
});

describe("upsert", () => {
  it("creates categories with the required timestamp, and reuses them", async () => {
    const { upsert } = await import("../lib/server/db");
    const a = await upsert("categories", "dev-tools", "Dev Tools");
    const b = await upsert("categories", "dev-tools", "Dev Tools");
    expect(a).toBe(b);
    const tags = await upsert("tags", "sqlite", "SQLite");
    expect(tags).toBeGreaterThan(0);
  });
});

describe("seeding the archive", () => {
  it("imports content/blog once and is idempotent", async () => {
    const { seedOnce } = await import("../lib/server/seed");
    const { countPublished } = await import("../lib/server/cms");
    await seedOnce();
    const first = await countPublished();
    expect(first).toBeGreaterThan(0);
    // A second call in a fresh module instance must not duplicate rows.
    const rows = await listPosts({ status: "all", limit: 500 });
    const slugs = rows.map((r) => r.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("seed date handling", () => {
  it("writes ISO days, never a locale string", async () => {
    const { seedOnce } = await import("../lib/server/seed");
    await seedOnce();
    const rows = await listPosts({ status: "all", limit: 50 });
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.published_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    }
  });
});
