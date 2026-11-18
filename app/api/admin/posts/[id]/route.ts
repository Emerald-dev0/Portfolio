import {
  body,
  fail,
  guard,
  handle,
  json,
  readPostInput,
  revalidatePost,
} from "../../../../../lib/admin-api";
import {
  deletePost,
  postById,
  revisions,
  updatePost,
  type Status,
} from "../../../../../lib/server/cms";

type Ctx = { params: Promise<{ id: string }> };

const idOf = (raw: string) => {
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) throw new Error("That post id is not valid.");
  return n;
};

/** GET /api/admin/posts/:id, one post plus its revision list. */
export async function GET(req: Request, { params }: Ctx) {
  const g = await guard(req);
  if (!g.ok) return g.res;
  const { id } = await params;
  return handle(async () => {
    const row = await postById(idOf(id));
    if (!row) throw new Error("That post does not exist.");
    return json({ post: row, revisions: await revisions(row.id) });
  });
}

/** PATCH /api/admin/posts/:id, autosave and every metadata edit. */
export async function PATCH(req: Request, { params }: Ctx) {
  const g = await guard(req, { write: true });
  if (!g.ok) return g.res;
  const { id } = await params;
  const raw = await body(req);
  return handle(async () => {
    const numId = idOf(id);
    const existing = await postById(numId);
    if (!existing) throw new Error("That post does not exist.");

    const input = readPostInput(raw, true);
    // A title is always required, so a partial edit reuses the stored one.
    if (!input.title) input.title = existing.title;

    // Status transitions go through updatePost, which owns the timestamps.
    if (raw.status !== undefined) {
      const s = String(raw.status) as Status;
      input.status = s;
    }

    const before = existing.slug;
    const row = await updatePost(numId, input);
    revalidatePost(row.slug, before);
    return json({ post: row, savedAt: new Date().toISOString() });
  });
}

/** DELETE /api/admin/posts/:id, permanent. */
export async function DELETE(req: Request, { params }: Ctx) {
  const g = await guard(req, { write: true });
  if (!g.ok) return g.res;
  const { id } = await params;
  return handle(async () => {
    const numId = idOf(id);
    const existing = await postById(numId);
    if (!existing) throw new Error("That post does not exist.");
    await deletePost(numId);
    revalidatePost(existing.slug);
    return json({ ok: true });
  });
}

/** POST /api/admin/posts/:id is not a thing, but keep the shape explicit. */
export async function POST() {
  return fail("Use PATCH to update a post.", 405);
}
