import type { Social } from "@/lib/content";

/**
 * SocialIcon — simple monochrome glyphs (currentColor) for each platform,
 * consistent with the sketch line-icon style used elsewhere.
 */
export default function SocialIcon({
  icon,
  size = 20,
  className = "",
}: {
  icon: Social["icon"];
  size?: number;
  className?: string;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (icon) {
    case "email":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3.5 6.5 L12 12.5 L20.5 6.5" />
        </svg>
      );
    case "github":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.1.68-.22.68-.48v-1.7c-2.78.62-3.37-1.2-3.37-1.2-.46-1.17-1.11-1.48-1.11-1.48-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.13-4.56-5.04 0-1.11.39-2.02 1.03-2.73-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.04a9.4 9.4 0 0 1 5 0c1.91-1.31 2.75-1.04 2.75-1.04.55 1.41.2 2.45.1 2.71.64.71 1.03 1.62 1.03 2.73 0 3.92-2.34 4.78-4.57 5.03.36.32.68.94.68 1.9v2.82c0 .27.18.59.69.48A10.02 10.02 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M16.5 3c.3 2 1.5 3.5 3.5 3.9v2.5c-1.4.05-2.7-.35-3.9-1.1v5.9c0 3-2.2 5.4-5.2 5.4-2.9 0-5.1-2.2-5.1-5 0-2.9 2.4-5.1 5.4-4.9v2.6c-.3-.1-.6-.15-1-.15-1.4 0-2.4 1-2.4 2.4 0 1.4 1 2.4 2.3 2.4 1.4 0 2.4-1 2.4-2.6V3h3.5Z" />
        </svg>
      );
    case "x":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M17.7 3h3.3l-7.2 8.3L22 21h-6.6l-5.2-6.8L4.3 21H1l7.7-8.9L2 3h6.8l4.7 6.2L17.7 3Zm-1.2 16h1.8L7.6 4.9H5.7L16.5 19Z" />
        </svg>
      );
  }
}
