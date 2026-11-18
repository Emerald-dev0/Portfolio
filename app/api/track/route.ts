import { NextResponse } from "next/server";
import { track, type Kind } from "../../../lib/server/analytics";
import { clientIp } from "../../../lib/server/admin-auth";
import { postBySlug } from "../../../lib/server/cms";
import { isAuthed } from "../../../lib/server/admin-auth";

/**
 * POST /api/track
 * A deliberately tiny, unauthenticated beacon. It stores a row only when the
 * hit survives the filters in `track()` (bots, your own signed-in traffic, and
 * repeat views in the same session are all dropped), and it always answers
 * 204 so a failure can never break an article for a reader.
 */
export async function POST(req: Request) {
  try {
    if (await isAuthed()) return new NextResponse(null, { status: 204 });

    const raw = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!raw) return new NextResponse(null, { status: 204 });

    const slug = typeof raw.slug === "string" ? raw.slug : "";
    const kind = raw.kind === "read" ? "read" : "view";
    const session = typeof raw.session === "string" ? raw.session.slice(0, 64) : "";
    const progress = typeof raw.progress === "number" ? Math.round(raw.progress) : 0;

    if (!slug || !/^[a-z0-9-]{1,120}$/.test(slug) || !session) {
      return new NextResponse(null, { status: 204 });
    }

    const post = await postBySlug(slug);
    if (!post) return new NextResponse(null, { status: 204 });
    if (post.status !== "published") return new NextResponse(null, { status: 204 });

    await track({
      slug,
      kind: kind satisfies Kind,
      session,
      progress: Math.max(0, Math.min(100, progress)),
      ip: clientIp(req),
      ua: req.headers.get("user-agent") ?? "",
      referrer: req.headers.get("referer") ?? "",
      path: `/blog/${slug}`,
    });
  } catch {
    // Never surface analytics failures to a reader.
  }
  return new NextResponse(null, { status: 204 });
}

/** Nothing to read here. */
export async function GET() {
  return new NextResponse(null, { status: 405 });
}
