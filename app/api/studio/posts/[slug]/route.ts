import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { guard } from "../../../../../lib/server/studio-auth";
import { configured, deletePost } from "../../../../../lib/server/blog-writes";

/** DELETE /api/studio/posts/[slug], remove a studio-published post. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await guard())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!configured()) {
    return NextResponse.json({ error: "Blob storage is not configured." }, { status: 500 });
  }
  const { slug } = await params;
  try {
    await deletePost(slug);
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/studio");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Delete failed." },
      { status: 500 },
    );
  }
}
