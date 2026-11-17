import type { Metadata } from "next";
import { BlogIndex } from "../../components/sections/BlogIndex";
import { publishedPosts } from "../../lib/server/blog-store";

export const revalidate = 300;

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

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const [{ tag }, posts] = await Promise.all([searchParams, publishedPosts()]);
  return <BlogIndex posts={posts} initialTag={tag} />;
}
