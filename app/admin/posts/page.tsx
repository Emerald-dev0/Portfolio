import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { AdminShell } from "../../../components/admin/AdminShell";
import { PostsTable } from "../../../components/admin/PostsTable";
import { Icon } from "../../../components/ui/Icon";
import { isAuthed } from "../../../lib/server/admin-auth";
import { listCategories, listPosts } from "../../../lib/server/cms";
import { seedOnce } from "../../../lib/server/seed";

export const dynamic = "force-dynamic";

const PAGE_LIMIT = 200;

/**
 * The post library. Server rendered, so the list is always the database, and
 * every action through the client table re-fetches it with router.refresh().
 */
export default async function AdminPostsPage() {
  if (!(await isAuthed())) redirect("/admin/login");
  await seedOnce();

  const [posts, categories] = await Promise.all([
    listPosts({ status: "all", limit: PAGE_LIMIT }),
    listCategories(),
  ]);

  return (
    <AdminShell
      title="Posts"
      description={`${posts.length} in the library. Drafts and scheduled posts are private until you publish them.`}
      actions={
        <Link href="/admin/posts/new" className="btn btn-leaf px-4 py-2 text-sm">
          <Icon icon={PlusSignIcon} size={15} />
          New post
        </Link>
      }
    >
      <PostsTable
        posts={posts.map((p) => ({ ...p }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </AdminShell>
  );
}
