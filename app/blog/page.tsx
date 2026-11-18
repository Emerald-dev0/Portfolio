import type { Metadata } from "next";
import { BlogIndex } from "../../components/blog/BlogIndex";
import { readIndex } from "../../lib/server/blog-source";
import { PER_PAGE } from "../../lib/blog-paging";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Blog, Notes from things I have built and learned",
  description:
    "Build logs, architecture decisions and honest lessons from Daniel 'Emerald' Oluwadare, Computer Science student and backend developer building in public.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog, Notes from things I have built and learned",
    description:
      "Build logs, lessons, and honest tool reviews from Daniel 'Emerald' Oluwadare.",
    url: "/blog",
    type: "website",
  },
};

/**
 * The blog index. Rendered per request from the database, so anything you
 * publish in the dashboard is on this page immediately, with no rebuild.
 */
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { q, tag } = await searchParams;
  const index = await readIndex({ q, tag, category: undefined, limit: PER_PAGE });

  return (
    <BlogIndex
      posts={index.posts}
      allPosts={index.posts}
      total={index.total}
      categories={index.categories}
      tags={index.tags}
      query={(q ?? "").trim()}
      activeCategory={null}
      activeTag={(tag ?? "").trim().toLowerCase() || null}
      page={1}
      perPage={PER_PAGE}
    />
  );
}
