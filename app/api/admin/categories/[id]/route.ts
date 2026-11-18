import { body, guard, handle, json } from "../../../../../lib/admin-api";
import { deleteCategory, listCategories, renameCategory } from "../../../../../lib/server/cms";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/admin/categories/:id, rename. */
export async function PATCH(req: Request, { params }: Ctx) {
  const g = await guard(req, { write: true });
  if (!g.ok) return g.res;
  const { id } = await params;
  const raw = await body(req);
  return handle(async () => {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) throw new Error("That category id is not valid.");
    const name = typeof raw.name === "string" ? raw.name.trim() : "";
    if (!name) throw new Error("A category needs a name.");
    await renameCategory(numId, name);
    return json({ categories: await listCategories() });
  });
}

/** DELETE /api/admin/categories/:id, posts fall back to uncategorised. */
export async function DELETE(req: Request, { params }: Ctx) {
  const g = await guard(req, { write: true });
  if (!g.ok) return g.res;
  const { id } = await params;
  return handle(async () => {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) throw new Error("That category id is not valid.");
    await deleteCategory(numId);
    return json({ categories: await listCategories() });
  });
}
