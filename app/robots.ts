import type { MetadataRoute } from "next";
import { site } from "../lib/config";

/**
 * Everything private is disallowed here as well as protected on the server.
 * The dashboard, the API and the old studio are not for crawlers.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/studio", "/studio/"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
