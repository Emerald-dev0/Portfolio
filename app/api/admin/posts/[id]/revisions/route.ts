import { guard, handle, json } from "../../../../../../lib/admin-api";
import { postById, revisions } from "../../../../../../lib/server/cms";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/admin/posts/:id/revisions, newest first, last 30. */
export async function GET(req: Request, { params }: Ctx) {
  const g = await guard(req);
  if (!g.ok) return g.res;
  const { id } = await params;
  return handle(async () => {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) throw new Error("That post id is not valid.");
    if (!(await postById(numId))) throw new Error("That post does not exist.");
    return json({ revisions: await revisions(numId) });
  });
}
