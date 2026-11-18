import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogIndex } from "../../../../components/blog/BlogIndex";
import { readIndex } from "../../../../lib/server/blog-source";
import { PER_PAGE } from "../../../../lib/blog-paging";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Paged index. The load more control on /blog appends the same posts this page
 * shows, so both routes agree, and this one exists for crawlers and for anyone
 * who wants a plain link.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ n: string }>;
}): Promise<Metadata> {
  const { n } = await params;
  return {
    title: `Blog, page ${n}`,
    alternates: { canonical: `/blog/page/${n}` },
    robots: { index: false, follow: true },
  };
}

export default async function PagedBlogPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const page = Number(n);
  if (!Number.isInteger(page) || page < 2 || page > 200) notFound();

  const index = await readIndex({ limit: PER_PAGE, offset: (page - 1) * PER_PAGE });
  if (!index.posts.length) notFound();

  return (
    <BlogIndex
      posts={index.posts}
      allPosts={index.posts}
      total={index.total}
      categories={index.categories}
      tags={index.tags}
      query=""
      activeCategory={null}
      activeTag={null}
      page={page}
      perPage={PER_PAGE}
    />
  );
}
