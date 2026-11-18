import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { AdminShell } from "../../../../components/admin/AdminShell";
import { PostEditor } from "../../../../components/admin/PostEditor";
import { Icon } from "../../../../components/ui/Icon";
import { isAuthed } from "../../../../lib/server/admin-auth";
import { listCategories, postById, revisions } from "../../../../lib/server/cms";

export const dynamic = "force-dynamic";

/**
 * The editor for one post. Loads the row, its revisions and the category list
 * on the server, then hands the whole thing to the client editor.
 */
export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) redirect("/admin/login");

  const { id } = await params;
  const numeric = Number(id);
  if (!Number.isInteger(numeric) || numeric <= 0) notFound();

  const post = await postById(numeric);
  if (!post) notFound();

  const [categories, revisionsList] = await Promise.all([listCategories(), revisions(post.id)]);

  return (
    <AdminShell
      title={post.title.length > 70 ? `${post.title.slice(0, 67)}...` : post.title}
      description={
        post.status === "published"
          ? `Live at /blog/${post.slug}. Edits save as you type.`
          : post.status === "scheduled"
            ? "Scheduled. It goes live on its own, and you can still edit it until then."
            : "Draft. Only you can see this until you publish it."
      }
      actions={
        <Link
          href="/admin/posts"
          className="btn btn-paper px-3 py-2 text-sm"
        >
          <Icon icon={ArrowLeft01Icon} size={14} />
          Library
        </Link>
      }
    >
      <PostEditor
        post={{ ...post }}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        revisions={revisionsList.map((r) => ({ ...r }))}
        isNew={false}
      />
    </AdminShell>
  );
}
