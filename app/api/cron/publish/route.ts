import { NextResponse } from "next/server";
import { publishDue } from "../../../../lib/server/cms";
import { revalidatePath } from "next/cache";

/**
 * GET /api/cron/publish
 * Server-side scheduling. Vercel Cron calls this, authenticated with a shared
 * secret in the Authorization header, so a scheduled post goes live even when
 * nobody is looking at the site. Public reads also call `publishDue()` as a
 * belt-and-braces fallback, which makes the cron an optimisation, not a single
 * point of failure.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.get("authorization") ?? "";
  if (secret && header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const slugs = await publishDue();
  for (const slug of slugs) {
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/feed.xml");
    revalidatePath("/sitemap.xml");
  }
  return NextResponse.json({ published: slugs, at: new Date().toISOString() });
}
