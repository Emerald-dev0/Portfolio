/**
 * ============================================================================
 * ADMIN API HELPERS, server-only.
 * ============================================================================
 * One shape for every admin response, and one function that does the boring
 * safety work: authorize, check same-origin, parse JSON without throwing, and
 * turn thrown errors into a clean 4xx/5xx instead of a stack trace.
 * ============================================================================
 */

import "server-only";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin, sameOrigin } from "./server/admin-auth";
import type { PostWrite, Status } from "./server/cms";

export const json = <T>(data: T, status = 200) => NextResponse.json(data, { status });

export const fail = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

/** Validate a request, or hand back the response to return. */
export async function guard(
  req: Request,
  opts: { write?: boolean } = {},
): Promise<{ ok: true } | { ok: false; res: NextResponse }> {
  if (!(await requireAdmin())) {
    return { ok: false, res: fail("Not signed in.", 401) };
  }
  if (opts.write && !sameOrigin(req)) {
    return { ok: false, res: fail("Cross-origin write rejected.", 403) };
  }
  return { ok: true };
}

export async function body(req: Request): Promise<Record<string, unknown>> {
  try {
    const data = await req.json();
    return typeof data === "object" && data ? (data as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** Revalidate every public surface an article can appear on. */
export function revalidatePost(slug?: string, previousSlug?: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/feed.xml");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  if (slug) {
    revalidatePath(`/blog/${slug}`);
    revalidatePath(`/admin/posts/${slug}`);
  }
  if (previousSlug && previousSlug !== slug) revalidatePath(`/blog/${previousSlug}`);
}

/** Wrap a handler so a thrown error becomes a readable failure, not a 500 dump. */
export function handle<T>(fn: () => Promise<T>) {
  return fn().catch((err: unknown) => {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    const status = /not (found|signed in|exist)/i.test(message) ? 404 : 400;
    return fail(message, status);
  });
}

const STATUSES: Status[] = ["draft", "published", "scheduled", "archived"];

/** Turn untrusted JSON into a PostWrite, or explain what is wrong. */
export function readPostInput(raw: Record<string, unknown>, partial = false): PostWrite {
  const out: PostWrite = { title: "" };
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : undefined);

  const title = str(raw.title);
  if (title !== undefined) out.title = title;
  else if (!partial) return out; // createPost throws with the right message

  if ("slug" in raw) out.slug = str(raw.slug);
  if ("excerpt" in raw) out.excerpt = str(raw.excerpt) ?? "";
  if ("content_md" in raw) out.content_md = typeof raw.content_md === "string" ? raw.content_md : "";
  if ("category_id" in raw) {
    const v = raw.category_id;
    out.category_id = typeof v === "number" ? v : v === null || v === "" ? null : Number(v) || null;
  }
  if ("featured" in raw) out.featured = raw.featured === true || raw.featured === 1;
  if ("cover_url" in raw) out.cover_url = str(raw.cover_url) || null;
  if ("cover_alt" in raw) out.cover_alt = str(raw.cover_alt) || null;
  if ("seo_title" in raw) out.seo_title = str(raw.seo_title) || null;
  if ("seo_description" in raw) out.seo_description = str(raw.seo_description) || null;
  if ("og_image" in raw) out.og_image = str(raw.og_image) || null;
  if ("scheduled_for" in raw) out.scheduled_for = str(raw.scheduled_for) || null;
  if ("tags" in raw) {
    out.tags = Array.isArray(raw.tags)
      ? raw.tags.map((t) => String(t).trim()).filter(Boolean)
      : typeof raw.tags === "string"
        ? raw.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
  }
  if ("status" in raw) {
    const s = String(raw.status) as Status;
    if (!STATUSES.includes(s)) throw new Error(`Unknown status "${s}".`);
    out.status = s;
  }
  return out;
}
