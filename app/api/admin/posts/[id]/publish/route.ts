import { body, guard, handle, json, revalidatePost } from "../../../../../../lib/admin-api";
import { postById, setStatus, type Status } from "../../../../../../lib/server/cms";
import { publishDue } from "../../../../../../lib/server/cms";

type Ctx = { params: Promise<{ id: string }> };
const ALLOWED: Status[] = ["published", "draft", "scheduled", "archived"];

/**
 * POST /api/admin/posts/:id/publish
 * Body: { status, scheduled_for? }. One endpoint for publish, unpublish,
 * schedule, archive and back to draft, because they are the same transition
 * with a different destination and the same validation.
 */
export async function POST(req: Request, { params }: Ctx) {
  const g = await guard(req, { write: true });
  if (!g.ok) return g.res;
  const { id } = await params;
  const raw = await body(req);
  return handle(async () => {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) throw new Error("That post id is not valid.");
    const existing = await postById(numId);
    if (!existing) throw new Error("That post does not exist.");

    const status = String(raw.status ?? "") as Status;
    if (!ALLOWED.includes(status)) throw new Error("Pick a valid status.");

    let scheduledFor: string | null = null;
    if (status === "scheduled") {
      const when = typeof raw.scheduled_for === "string" ? raw.scheduled_for : "";
      const date = new Date(when);
      if (!when || Number.isNaN(date.getTime())) {
        throw new Error("A scheduled post needs a valid date and time.");
      }
      if (date.getTime() <= Date.now()) {
        throw new Error("Pick a time in the future, or publish now.");
      }
      scheduledFor = date.toISOString();
    }

    const row = await setStatus(numId, status, scheduledFor);
    // A schedule that is somehow already due publishes on the spot.
    await publishDue();
    revalidatePost(row.slug, existing.slug);
    return json({ post: row });
  });
}
