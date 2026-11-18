/**
 * Request validation, the layer between untrusted JSON and the database.
 * Every test here is a failure path first, because that is what a content API
 * gets wrong in production.
 */
import { describe, expect, it, vi } from "vitest";

// The admin helpers import next/cache for revalidation, which does nothing in
// a node test but must resolve.
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

import { readPostInput } from "../lib/admin-api";
import { readMinutes } from "../lib/server/cms";

describe("readPostInput", () => {
  it("keeps a title and trims it", () => {
    expect(readPostInput({ title: "  Spaced Out  " }).title).toBe("Spaced Out");
  });

  it("only touches the fields that were sent", () => {
    const partial = readPostInput({ content_md: "body" }, true);
    expect(partial.content_md).toBe("body");
    expect(partial.title).toBe("");
    expect("slug" in partial).toBe(false);
    expect("status" in partial).toBe(false);
  });

  it("splits a comma separated tag string", () => {
    expect(readPostInput({ title: "x", tags: "one, two ,, three" }).tags).toEqual([
      "one",
      "two",
      "three",
    ]);
  });

  it("accepts an array of tags and drops empties", () => {
    expect(readPostInput({ title: "x", tags: ["a", " ", "b"] }).tags).toEqual(["a", "b"]);
  });

  it("rejects an unknown status instead of storing it", () => {
    expect(() => readPostInput({ title: "x", status: "deleted" })).toThrow(/unknown status/i);
  });

  it("coerces a numeric string category and treats empty as null", () => {
    expect(readPostInput({ title: "x", category_id: "3" }).category_id).toBe(3);
    expect(readPostInput({ title: "x", category_id: "" }).category_id).toBeNull();
    expect(readPostInput({ title: "x", category_id: null }).category_id).toBeNull();
  });

  it("normalises featured to a boolean", () => {
    expect(readPostInput({ title: "x", featured: true }).featured).toBe(true);
    expect(readPostInput({ title: "x", featured: 1 }).featured).toBe(true);
    expect(readPostInput({ title: "x", featured: "yes" }).featured).toBe(false);
  });

  it("turns empty SEO fields into null rather than empty strings", () => {
    const parsed = readPostInput({ title: "x", seo_title: "  ", og_image: "" });
    expect(parsed.seo_title).toBeNull();
    expect(parsed.og_image).toBeNull();
  });

  it("never trusts a non-string body", () => {
    expect(readPostInput({ title: "x", content_md: { evil: true } }).content_md).toBe("");
  });
});

describe("readMinutes", () => {
  it("never returns zero, even for an empty post", () => {
    expect(readMinutes("")).toBe(1);
  });

  it("scales with words and ignores code fences", () => {
    const short = "a few words here";
    const long = Array.from({ length: 600 }, () => "word").join(" ");
    expect(readMinutes(short)).toBe(1);
    expect(readMinutes(long)).toBe(3);
    const code = ["```", ...Array.from({ length: 600 }, () => "x"), "```"].join("\n");
    expect(readMinutes(code)).toBe(1);
  });
});
