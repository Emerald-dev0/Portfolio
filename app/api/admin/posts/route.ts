import { body, fail, guard, handle, json, readPostInput, revalidatePost } from "../../../../lib/admin-api";
import { createPost, listPosts, type Status } from "../../../../lib/server/cms";
import { seedOnce } from "../../../../lib/server/seed";
import { slugify } from "../../../../lib/blog";

/** GET /api/admin/posts, the library, newest first. */
export async function GET(req: Request) {
  const g = await guard(req);
  if (!g.ok) return g.res;
  return handle(async () => {
    await seedOnce();
    const url = new URL(req.url);
    const status = (url.searchParams.get("status") ?? "all") as Status | "all";
    const q = url.searchParams.get("q") ?? undefined;
    const rows = await listPosts({ status, q, limit: 200 });
    return json({ posts: rows });
  });
}

/** POST /api/admin/posts, create. Slugs are derived, then de-duplicated. */
export async function POST(req: Request) {
  const g = await guard(req, { write: true });
  if (!g.ok) return g.res;
  const raw = await body(req);
  if (typeof raw.title !== "string" || !raw.title.trim()) return fail("A title is required.");
  return handle(async () => {
    const input = readPostInput(raw);
    if (input.slug) input.slug = slugify(input.slug);
    const row = await createPost(input);
    revalidatePost(row.slug);
    return json({ post: row }, 201);
  });
}
