import { guard, handle, json, revalidatePost } from "../../../../../../lib/admin-api";
import { duplicatePost, postById } from "../../../../../../lib/server/cms";

type Ctx = { params: Promise<{ id: string }> };

/** POST /api/admin/posts/:id/duplicate, a fresh draft copy, never published. */
export async function POST(req: Request, { params }: Ctx) {
  const g = await guard(req, { write: true });
  if (!g.ok) return g.res;
  const { id } = await params;
  return handle(async () => {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) throw new Error("That post id is not valid.");
    if (!(await postById(numId))) throw new Error("That post does not exist.");
    const row = await duplicatePost(numId);
    revalidatePost(row.slug);
    return json({ post: row }, 201);
  });
}
