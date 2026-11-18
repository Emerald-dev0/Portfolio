import { ImageResponse } from "next/og";
import { site } from "../lib/config";

/**
 * SITE SHARE CARD. Every URL that has no article-specific card of its own
 * falls back to this one: the home page, /blog, every category and tag page.
 *
 * Before this existed, only article pages had a card, so sharing the portfolio
 * itself, which is the one link that actually gets shared, produced a blank
 * grey rectangle on X, LinkedIn and Slack.
 *
 * Drawn in the same paper, ink and leaf palette as the site, using the asterisk
 * from the doodle set. No stock art, no logo soup.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name}, ${site.role} and backend developer`;

/** The asterisk, the same path the site's Doodle component uses. */
function Asterisk({ size: s, color }: { size: number; color: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
      <path
        d="M50 8v84M14 29l72 42M86 29L14 71"
        stroke={color}
        strokeWidth={7}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FFF9EF",
          padding: 76,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Asterisk size={54} color="#0E7C5B" />
          <div
            style={{
              fontSize: 26,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#6F6A5C",
            }}
          >
            {site.location}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 92,
              lineHeight: 1.02,
              fontWeight: 800,
              color: "#16130F",
              letterSpacing: -3,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>{site.name}</span>
          </div>
          <div
            style={{
              marginTop: 26,
              fontSize: 34,
              color: "#0E7C5B",
              fontWeight: 600,
            }}
          >
            Backend developer. Builds tools, writes in public.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "3px solid #16130F",
            paddingTop: 26,
          }}
        >
          <div style={{ fontSize: 28, color: "#16130F" }}>{site.url.replace(/^https?:\/\//, "")}</div>
          <div style={{ fontSize: 28, color: "#6F6A5C" }}>{site.githubHandle}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
