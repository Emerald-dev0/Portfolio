import type { Metadata } from "next";
import { BlogIndex } from "../../../../components/blog/BlogIndex";
import { readIndex } from "../../../../lib/server/blog-source";
import { PER_PAGE } from "../../../../lib/blog-paging";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** A category front page. Same component, filtered on the server. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const index = await readIndex({ limit: 1 });
  const match = index.categories.find((c) => c.slug === slug);
  const name = match?.name ?? slug.replace(/-/g, " ");
  return {
    title: `${name}, Blog`,
    description: `Every post filed under ${name} by Daniel 'Emerald' Oluwadare.`,
    alternates: { canonical: `/blog/category/${slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const all = await readIndex({ limit: 1 });
  const match = all.categories.find((c) => c.slug === slug);
  const index = await readIndex({ category: match?.name ?? slug, limit: PER_PAGE });

  return (
    <BlogIndex
      posts={index.posts}
      allPosts={index.posts}
      total={index.total}
      categories={index.categories}
      tags={index.tags}
      query=""
      activeCategory={(match?.name ?? slug.replace(/-/g, " ")).toLowerCase()}
      activeTag={null}
      page={1}
      perPage={PER_PAGE}
    />
  );
}
