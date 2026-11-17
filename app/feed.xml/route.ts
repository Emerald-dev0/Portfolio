import { site } from "../../lib/config";
import { publishedPosts } from "../../lib/server/blog-store";

export const revalidate = 300;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * RSS 2.0, generated from the same post store as the site, so anything
 * published in /studio appears in the feed on revalidate.
 */
export async function GET() {
  const posts = await publishedPosts();

  const items = posts
    .map((p) => {
      const url = `${site.url}/blog/${p.slug}`;
      const pub = new Date(`${p.date}T09:00:00Z`).toUTCString();
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(p.excerpt)}</description>
      <pubDate>${pub}</pubDate>
      ${p.tags.map((t) => `<category>${esc(t)}</category>`).join("")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(site.name)}, Notes from things I have built and learned</title>
    <link>${site.url}/blog</link>
    <description>Build logs, lessons, and honest tool reviews from ${esc(site.name)}.</description>
    <language>en-NG</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
