/**
 * ============================================================================
 * SEO, structured data in one place.
 * ============================================================================
 * Search engines read two different things from these pages: the HTML meta
 * tags that Next emits from `metadata`, and the JSON-LD blocks below, which
 * describe the entities (person, site, article, breadcrumb trail) rather than
 * the page.
 *
 * Two rules the rest of this file exists to enforce:
 *  1. Every absolute URL comes from `site.url`, never from a literal, so a
 *     domain move stays a one line change.
 *  2. A string that reaches a JSON-LD block is escaped for "<", so a post title
 *     containing "</script>" cannot end the tag early. That was the only real
 *     injection risk in the whole blog, and it is handled here once instead of
 *     in every page.
 * ============================================================================
 */

import { site } from "./config";

/** Serialise JSON-LD safely for inline use in a script tag. */
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/** The same @id for the author wherever it is referenced. */
export const PERSON_ID = `${site.url}/#person`;
export const WEBSITE_ID = `${site.url}/#website`;

/**
 * Person. Referenced by the article publisher and by the home page, so search
 * engines can connect the byline on a post to the site it lives on instead of
 * treating every page as an unrelated document.
 *
 * `knowsAbout` and `jobTitle` come from the same config the rest of the site
 * reads, so they cannot drift out of date in one place and stay current in
 * another.
 */
export function personSchema() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: site.name,
    alternateName: site.persona,
    url: site.url,
    jobTitle: "Software engineer",
    description: `${site.role} at TestFlow, building backend systems and developer tools.`,
    email: `mailto:${site.email}`,
    sameAs: [site.github],
    knowsAbout: [
      "Backend development",
      "PostgreSQL",
      "SQLite",
      "Next.js",
      "TypeScript",
      "API design",
      "Web development",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ile-Ife",
      addressCountry: "NG",
    },
  };
}

/** The blog itself, as a WebSite with a feed attached. */
export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: site.url,
    name: site.name,
    description: `${site.role} building developer tools and writing in public.`,
    inLanguage: "en",
    publisher: { "@id": PERSON_ID },
    mainEntityOfPage: `${site.url}/blog`,
  };
}

/** A breadcrumb trail. Google renders this in place of the raw URL. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${site.url}${crumb.path}`,
    })),
  };
}

/** Wrap several entities in one @graph, which is what Google prefers. */
export function graph(...nodes: unknown[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
