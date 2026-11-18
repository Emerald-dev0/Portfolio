import { guard, handle, json } from "../../../../lib/admin-api";
import { countPublished, listPosts } from "../../../../lib/server/cms";
import { overview, topPosts } from "../../../../lib/server/analytics";
import { seedOnce } from "../../../../lib/server/seed";

/** GET /api/admin/stats, the dashboard numbers, all from real rows. */
export async function GET(req: Request) {
  const g = await guard(req);
  if (!g.ok) return g.res;
  return handle(async () => {
    await seedOnce();
    const [published, all, draft, scheduled, archived, o7, o30, top] = await Promise.all([
      countPublished(),
      listPosts({ status: "all", limit: 500 }),
      listPosts({ status: "draft", limit: 500 }),
      listPosts({ status: "scheduled", limit: 500 }),
      listPosts({ status: "archived", limit: 500 }),
      overview("7d"),
      overview("30d"),
      topPosts("30d", 5),
    ]);
    return json({
      totals: {
        all: all.length,
        published,
        draft: draft.length,
        scheduled: scheduled.length,
        archived: archived.length,
      },
      views: { d7: o7.views, d30: o30.views, allTime: o30.views, unique30: o30.uniqueVisitors },
      completion: o30.completionRate,
      top,
      recent: all.slice(0, 6),
    });
  });
}
