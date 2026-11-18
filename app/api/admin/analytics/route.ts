import { guard, handle, json } from "../../../../lib/admin-api";
import { breakdowns, overview, timeseries, topPosts, type Range } from "../../../../lib/server/analytics";

const RANGES: Range[] = ["24h", "7d", "30d", "90d", "all", "custom"];

/**
 * GET /api/admin/analytics?range=30d&from=&to=
 * Everything on the analytics screen comes from this one call, so the numbers
 * on screen can never disagree with each other.
 */
export async function GET(req: Request) {
  const g = await guard(req);
  if (!g.ok) return g.res;
  return handle(async () => {
    const url = new URL(req.url);
    const raw = (url.searchParams.get("range") ?? "30d") as Range;
    const range: Range = RANGES.includes(raw) ? raw : "30d";
    const from = url.searchParams.get("from") ?? undefined;
    const to = url.searchParams.get("to") ?? undefined;

    if (range === "custom" && (!from || !to)) {
      throw new Error("A custom range needs both a start and an end date.");
    }

    const [summary, series, posts, splits] = await Promise.all([
      overview(range, from, to),
      timeseries(range, from, to),
      topPosts(range, 10, from, to),
      breakdowns(range, from, to),
    ]);

    return json({ range, summary, series, posts, ...splits });
  });
}
