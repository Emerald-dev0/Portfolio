import { body, guard, handle, json } from "../../../../../lib/admin-api";
import { deleteMedia } from "../../../../../lib/server/cms";
import { removeImage } from "../../../../../lib/server/media";
import { run } from "../../../../../lib/server/db";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/admin/media/:id, alt text and caption. */
export async function PATCH(req: Request, { params }: Ctx) {
  const g = await guard(req, { write: true });
  if (!g.ok) return g.res;
  const { id } = await params;
  const raw = await body(req);
  return handle(async () => {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) throw new Error("That media id is not valid.");
    const alt = typeof raw.alt === "string" ? raw.alt.trim() || null : undefined;
    const caption = typeof raw.caption === "string" ? raw.caption.trim() || null : undefined;
    if (alt !== undefined) await run("UPDATE media SET alt = ? WHERE id = ?", [alt, numId]);
    if (caption !== undefined) await run("UPDATE media SET caption = ? WHERE id = ?", [caption, numId]);
    return json({ ok: true });
  });
}

/** DELETE /api/admin/media/:id, row and blob. */
export async function DELETE(req: Request, { params }: Ctx) {
  const g = await guard(req, { write: true });
  if (!g.ok) return g.res;
  const { id } = await params;
  return handle(async () => {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) throw new Error("That media id is not valid.");
    const url = await deleteMedia(numId);
    if (!url) throw new Error("That image does not exist.");
    await removeImage(url, "");
    return json({ ok: true });
  });
}
