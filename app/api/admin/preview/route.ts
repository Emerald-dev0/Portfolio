import { body, fail, guard, handle, json } from "../../../../lib/admin-api";
import { buildPost } from "../../../../lib/markdown";
import { postById } from "../../../../lib/server/cms";

/**
 * POST /api/admin/preview
 * Renders the editor's current Markdown with the same `buildPost` +
 * `BlockRenderer` pipeline the public article uses, so what the operator sees
 * in preview is literally the public output, only behind auth.
 */
export async function POST(req: Request) {
  const g = await guard(req, { write: true });
  if (!g.ok) return g.res;
  const raw = await body(req);
  if (typeof raw.content_md !== "string") return fail("There is nothing to preview yet.");
  const markdown = raw.content_md;

  return handle(async () => {
    const id = typeof raw.id === "number" ? raw.id : null;
    const existing = id ? await postById(id) : null;
    const title = typeof raw.title === "string" && raw.title.trim() ? raw.title : existing?.title ?? "Untitled";
    const post = buildPost(
      existing?.slug ?? "preview",
      {
        title,
        excerpt: typeof raw.excerpt === "string" ? raw.excerpt : "",
        date: existing?.published_at ?? new Date().toISOString(),
        tags: existing?.tags ?? [],
        featured: false,
      },
      markdown,
    );
    return json({ post, readMinutes: post?.readMinutes ?? 1, words: wordCount(markdown) });
  });
}

function wordCount(md: string): number {
  const text = md.replace(/```[\s\S]*?```/g, " ").replace(/[#>*_`|]/g, " ");
  return text.split(/\s+/).filter(Boolean).length;
}
