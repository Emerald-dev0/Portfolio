import { NextResponse } from "next/server";
import { publishDue } from "../../../../lib/server/cms";
import { revalidatePath } from "next/cache";

/**
 * GET /api/cron/publish
 * Server-side scheduling. Vercel Cron calls this, authenticated with a shared
 * secret in the Authorization header, so a scheduled post goes live even when
 * nobody is looking at the site. Public reads also call `publishDue()` on every
 * render, which makes the cron an optimisation, not a single point of failure:
 * a post is published on its first view after its time, cron or no cron.
 *
 * The schedule in vercel.json is daily because the Hobby plan refuses to deploy
 * with anything more frequent, and refuses before a build even starts. That is
 * the whole reason this endpoint is a backstop rather than the mechanism.
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
