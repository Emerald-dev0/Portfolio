import { ImageResponse } from "next/og";
import { getPublicPost } from "../../../lib/server/blog-source";
import { site } from "../../../lib/config";

/**
 * A generated Open Graph card for each article, drawn from the article's own
 * title and tags. No stock artwork, no logo soup: the title, set large, on the
 * site's paper colour, with the leaf rule underneath.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Article cover";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublicPost(slug);

  const title = post?.title ?? "Daniel Oluwadare";
  const tags = (post?.tags ?? []).slice(0, 3).join(" · ");
  const minutes = post ? `${post.readMinutes} min read` : site.role;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F4EFE4",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#2F6B4F",
              color: "#F4EFE4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            E
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: "#12140F" }}>{site.name}</span>
            <span style={{ fontSize: 18, color: "#12140F", opacity: 0.6 }}>{minutes}</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: title.length > 60 ? 58 : 72,
              lineHeight: 1.06,
              fontWeight: 800,
              letterSpacing: -2,
              color: "#12140F",
              maxWidth: 1000,
            }}
          >
            {title.length > 140 ? `${title.slice(0, 137)}…` : title}
          </div>
          <div style={{ width: 220, height: 10, background: "#2F6B4F", borderRadius: 999 }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#12140F", opacity: 0.7 }}>
          <span>{tags || site.persona}</span>
          <span>{site.url.replace(/^https?:\/\//, "")}</span>
        </div>
      </div>
    ),
    size,
  );
}
