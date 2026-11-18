import { guard, handle, json } from "../../../../../lib/admin-api";
import { postAnalytics, type Range } from "../../../../../lib/server/analytics";
import { postById } from "../../../../../lib/server/cms";

type Ctx = { params: Promise<{ id: string }> };
const RANGES: Range[] = ["24h", "7d", "30d", "90d", "all", "custom"];

/** GET /api/admin/analytics/:postId?range=30d, one article's numbers. */
export async function GET(req: Request, { params }: Ctx) {
  const g = await guard(req);
  if (!g.ok) return g.res;
  const { id } = await params;
  return handle(async () => {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) throw new Error("That post id is not valid.");
    const post = await postById(numId);
    if (!post) throw new Error("That post does not exist.");
    const raw = (new URL(req.url).searchParams.get("range") ?? "30d") as Range;
    const range: Range = RANGES.includes(raw) ? raw : "30d";
    const from = new URL(req.url).searchParams.get("from") ?? undefined;
    const to = new URL(req.url).searchParams.get("to") ?? undefined;
    return json({
      post: { id: post.id, slug: post.slug, title: post.title },
      range,
      ...(await postAnalytics(numId, range, from, to)),
    });
  });
}
