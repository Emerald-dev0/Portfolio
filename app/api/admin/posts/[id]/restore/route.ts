import { body, guard, handle, json, revalidatePost } from "../../../../../../lib/admin-api";
import { postById, restoreRevision } from "../../../../../../lib/server/cms";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/admin/posts/:id/restore
 * Body: { revisionId, force? }. The current state is snapshotted first, so a
 * restore is itself reversible. Without force it refuses when the article has
 * moved on since the revision was taken.
 */
export async function POST(req: Request, { params }: Ctx) {
  const g = await guard(req, { write: true });
  if (!g.ok) return g.res;
  const { id } = await params;
  const raw = await body(req);
  return handle(async () => {
    const numId = Number(id);
    const revisionId = Number(raw.revisionId);
    if (!Number.isInteger(numId) || numId <= 0) throw new Error("That post id is not valid.");
    if (!Number.isInteger(revisionId) || revisionId <= 0) throw new Error("Pick a revision to restore.");
    const existing = await postById(numId);
    if (!existing) throw new Error("That post does not exist.");

    let warning: string | null = null;
    let row;
    try {
      row = await restoreRevision(numId, revisionId, raw.force === true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "The revision could not be restored.";
      if (/has changed since/i.test(message) && raw.force !== true) {
        return json({ needsConfirmation: true, message, current: existing }, 409);
      }
      throw err;
    }
    revalidatePost(row.slug, existing.slug);
    warning = null;
    return json({ post: row, warning });
  });
}
