import { NextResponse } from "next/server";
import { readIndex } from "../../../../lib/server/blog-source";
import { PER_PAGE } from "../../../../lib/blog-paging";

/**
 * GET /api/blog/page?page=2
 * The load-more endpoint. Public and read only: it returns published posts
 * exactly as `readIndex` produces them, so there is no second shape of post
 * in the app.
 */
export async function GET(req: Request) {
  const page = Math.max(1, Number(new URL(req.url).searchParams.get("page") ?? "1") || 1);
  const index = await readIndex({ limit: PER_PAGE, offset: (page - 1) * PER_PAGE });
  return NextResponse.json(
    { posts: index.posts, page, total: index.total, hasMore: page * PER_PAGE < index.total },
    { headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
