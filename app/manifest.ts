import type { MetadataRoute } from "next";

/**
 * Web app manifest. Minimal on purpose: this is a website, not an app, so it
 * declares a name, the two icons, and the two theme colours the site actually
 * uses. Chrome uses these for install prompts and for the app-style tab on
 * Android, and search results occasionally pick the icon up too.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Daniel Oluwadare, Emerald",
    short_name: "Emerald",
    description:
      "Computer Science student and backend developer building developer tools, and writing about it in public.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF9EF",
    theme_color: "#0E7C5B",
    icons: [
      { src: "/icon.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
