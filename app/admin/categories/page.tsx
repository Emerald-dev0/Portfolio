import { redirect } from "next/navigation";
import { AdminShell } from "../../../components/admin/AdminShell";
import { CategoryManager } from "../../../components/admin/CategoryManager";
import { isAuthed } from "../../../lib/server/admin-auth";
import { listCategories, listTags } from "../../../lib/server/cms";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  if (!(await isAuthed())) redirect("/admin/login");

  const [categories, tags] = await Promise.all([listCategories(), listTags()]);

  return (
    <AdminShell
      title="Categories and tags"
      description="Categories are curated and get their own page. Tags are free form and come from the editor."
    >
      <CategoryManager categories={categories.map((c) => ({ ...c }))} />

      <section className="mt-10">
        <h2 className="font-display text-xl font-extrabold">Tags in use</h2>
        <p className="mt-1 text-sm opacity-70">
          Tags are created by typing them into a post. A tag with no posts disappears on its own.
        </p>
        {tags.length ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {tags.map((t) => (
              <li key={t.id} className="chip">
                {t.name}
                <span className="opacity-50">{t.count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm opacity-60">No tags yet.</p>
        )}
      </section>
    </AdminShell>
  );
}
