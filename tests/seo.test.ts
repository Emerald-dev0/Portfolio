import { describe, expect, it } from "vitest";
import {
  breadcrumbSchema,
  graph,
  personSchema,
  safeJsonLd,
  WEBSITE_ID,
  websiteSchema,
} from "../lib/seo";
import { site } from "../lib/config";

/**
 * Structured data is invisible when it works and invisible when it breaks, so
 * these tests pin the two things that actually go wrong: a script tag that can
 * be closed early by a title, and an absolute URL that has drifted off the
 * canonical origin.
 */
describe("safeJsonLd", () => {
  it("escapes < so a title cannot close the script tag", () => {
    const payload = { headline: "</script><img src=x onerror=alert(1)>" };
    const out = safeJsonLd(payload);
    expect(out).not.toContain("</script>");
    expect(out).toContain("\\u003c/script");
  });

  it("still parses back to the original value", () => {
    const payload = { headline: "</script>", body: "a < b & c > d" };
    expect(JSON.parse(safeJsonLd(payload))).toEqual(payload);
  });

  it("escapes every < in a deeply nested document", () => {
    const out = safeJsonLd(graph(personSchema(), websiteSchema()));
    expect(out).not.toContain("<");
  });
});

describe("person and website nodes", () => {
  it("anchors both entities to the canonical origin", () => {
    expect(personSchema()["@id"]).toBe(`${site.url}/#person`);
    expect(websiteSchema()["@id"]).toBe(WEBSITE_ID);
    expect(websiteSchema().publisher).toEqual({ "@id": `${site.url}/#person` });
  });

  it("exposes the real identity fields and no placeholders", () => {
    const person = personSchema();
    expect(person.name).toBe(site.name);
    expect(person.url).toBe(site.url);
    expect(person.email).toBe(`mailto:${site.email}`);
    expect(person.sameAs).toContain(site.github);
    expect(person.knowsAbout.length).toBeGreaterThan(3);
  });

  it("uses the configured origin rather than a hard coded host", () => {
    expect(JSON.stringify(personSchema())).not.toContain("vercel.app");
  });
});

describe("breadcrumbs", () => {
  it("numbers items from one, in order, as absolute URLs", () => {
    const crumbs = breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: "A post", path: "/blog/a-post" },
    ]);
    expect(crumbs["@type"]).toBe("BreadcrumbList");
    expect(crumbs.itemListElement.map((c) => c.position)).toEqual([1, 2, 3]);
    expect(crumbs.itemListElement[2].item).toBe(`${site.url}/blog/a-post`);
  });
});
