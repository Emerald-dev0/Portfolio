import type { MetadataRoute } from "next";
import { site } from "../lib/config";
import { readIndex } from "../lib/server/blog-source";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Sitemap. Only published posts appear: a draft, a scheduled post that is not
 * due, and an archived article are all excluded, so nothing unfinished leaks
 * into a crawler. Archived articles are also noindex on their own page.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const index = await readIndex({ limit: 500 });
  const now = new Date();

  // A date that cannot be parsed must not break the whole sitemap.
  const stamp = (iso: string) => {
    const d = new Date(`${iso.slice(0, 10)}T09:00:00Z`);
    return Number.isNaN(d.getTime()) ? now : d;
  };

  /**
   * The newest post's edit date, used as the freshness of /blog itself. A
   * lastModified that is always "now", which is what a per-request Date()
   * produces, is a signal crawlers learn to ignore. This one only moves when
   * something is actually published or edited.
   */
  const newest = index.posts.reduce(
    (latest, p) => {
      const d = stamp(p.updated?.slice(0, 10) ?? p.date);
      return d > latest ? d : latest;
    },
    new Date(0),
  );
  const blogModified = newest.getTime() === 0 ? now : newest;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: blogModified, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/blog`, lastModified: blogModified, changeFrequency: "daily", priority: 0.9 },
  ];

  const categories: MetadataRoute.Sitemap = index.categories.map((c) => ({
    url: `${site.url}/blog/category/${c.slug}`,
    lastModified: blogModified,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const tags: MetadataRoute.Sitemap = index.tags.map((t) => ({
    url: `${site.url}/blog/tag/${t.slug}`,
    lastModified: blogModified,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const posts: MetadataRoute.Sitemap = index.posts.map((p) => ({
    url: `${site.url}/blog/${p.slug}`,
    lastModified: stamp(p.updated?.slice(0, 10) ?? p.date),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categories, ...tags, ...posts];
}
