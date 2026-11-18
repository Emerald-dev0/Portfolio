import { redirect } from "next/navigation";
import { isAuthed } from "../../../../lib/server/admin-auth";
import { createPost } from "../../../../lib/server/cms";

export const dynamic = "force-dynamic";

/**
 * A new post is created as an empty draft the moment this route is opened, then
 * redirected to its editor. That means autosave, revisions and status all
 * behave exactly as they do for an existing article, with no first-save special
 * case anywhere in the editor.
 */
export default async function NewPostPage() {
  if (!(await isAuthed())) redirect("/admin/login");

  const post = await createPost({ title: "Untitled", content_md: "", status: "draft" });
  redirect(`/admin/posts/${post.id}`);
}
