import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { guard } from "../../../../lib/server/studio-auth";
import { configured, savePost, type PostInput } from "../../../../lib/server/blog-writes";
import { rawPost } from "../../../../lib/server/blog-store";
import { slugify } from "../../../../lib/blog";

/**
 * POST /api/studio/posts, publish, update, or save a draft.
 * The whole site is static, so a successful write revalidates the pages a
 * post can appear on: the home page, the index, the post itself, and the feed.
 */

function revalidateAll(slug: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/feed.xml");
  revalidatePath("/sitemap.xml");
  revalidatePath("/studio");
}

function toInput(body: Record<string, unknown>): { input?: PostInput; error?: string } {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const markdown = typeof body.markdown === "string" ? body.markdown : "";
  if (!title) return { error: "A title is required." };
  if (!markdown.trim()) return { error: "The post is empty." };

  const slug = slugify(
    typeof body.slug === "string" && body.slug.trim() ? body.slug : title,
  );
  if (!slug) return { error: "Could not build a URL from that title." };

  const date =
    typeof body.date === "string" && body.date.trim()
      ? body.date.slice(0, 10)
      : new Date().toISOString().slice(0, 10);

  const tags = (
    Array.isArray(body.tags)
      ? body.tags
      : typeof body.tags === "string"
        ? body.tags.split(",")
        : []
  )
    .map(String)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 6);

  return {
    input: {
      slug,
      title,
      excerpt: typeof body.excerpt === "string" ? body.excerpt.trim() : "",
      date,
      tags,
      draft: body.draft === true,
      featured: body.featured === true,
      cover: typeof body.cover === "string" && body.cover.trim() ? body.cover.trim() : undefined,
      markdown,
    },
  };
}

export async function POST(request: Request) {
  if (!(await guard())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!configured()) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN isn't set, so nothing can be saved yet." },
      { status: 500 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { input, error } = toInput(body);
  if (!input) return NextResponse.json({ error }, { status: 400 });

  try {
    const url = await savePost(input);
    revalidateAll(input.slug);
    return NextResponse.json({
      ok: true,
      slug: input.slug,
      url,
      href: input.draft ? "/studio" : `/blog/${input.slug}`,
      draft: input.draft,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Saving failed." },
      { status: 500 },
    );
  }
}

/** GET /api/studio/posts?slug=x, the raw Markdown for the editor. */
export async function GET(request: Request) {
  if (!(await guard())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "A slug is required." }, { status: 400 });
  const post = await rawPost(slug);
  if (!post) return NextResponse.json({ error: "No post with that slug." }, { status: 404 });
  return NextResponse.json(post);
}
