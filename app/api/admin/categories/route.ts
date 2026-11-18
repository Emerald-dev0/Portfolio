import { body, guard, handle, json } from "../../../../lib/admin-api";
import { createCategory, listCategories } from "../../../../lib/server/cms";

/** GET /api/admin/categories */
export async function GET(req: Request) {
  const g = await guard(req);
  if (!g.ok) return g.res;
  return handle(async () => json({ categories: await listCategories() }));
}

/** POST /api/admin/categories, { name, description? } */
export async function POST(req: Request) {
  const g = await guard(req, { write: true });
  if (!g.ok) return g.res;
  const raw = await body(req);
  return handle(async () => {
    const name = typeof raw.name === "string" ? raw.name.trim() : "";
    if (!name) throw new Error("A category needs a name.");
    const description = typeof raw.description === "string" ? raw.description.trim() : undefined;
    return json({ category: await createCategory(name, description) }, 201);
  });
}
