/**
 * Editor conversion, round trip and edge cases.
 * These are pure functions, so the whole file runs in node with no DOM.
 */
import { describe, expect, it } from "vitest";
import { countWords, docToMd, mdToDoc, nodesToInline } from "../lib/editor/md-doc";

describe("mdToDoc", () => {
  it("reads headings and clamps levels into the renderer's range", () => {
    const doc = mdToDoc("# One\n\n### Three\n\n##### Five");
    const levels = (doc.content ?? []).map((n) => n.attrs?.level);
    expect(levels).toEqual([2, 3, 4]);
  });

  it("keeps fenced code intact, including blank lines and fences inside", () => {
    const md = ["```ts", "const a = 1;", "", "const b = 2;", "```"].join("\n");
    const doc = mdToDoc(md);
    expect(doc.content?.[0].type).toBe("codeBlock");
    expect(doc.content?.[0].attrs?.language).toBe("ts");
    expect(doc.content?.[0].content?.[0].text).toBe("const a = 1;\n\nconst b = 2;");
  });

  it("recognises callouts and keeps their kind", () => {
    const doc = mdToDoc("> [!WARNING]\n> Do not do this.");
    expect(doc.content?.[0].type).toBe("blockquote");
    expect(doc.content?.[0].attrs?.callout).toBe("warning");
  });

  it("turns a plain blockquote into a quote, not a callout", () => {
    const doc = mdToDoc("> just some words");
    expect(doc.content?.[0].attrs?.callout).toBeUndefined();
  });

  it("splits lists and keeps ordered versus bullet", () => {
    const doc = mdToDoc("- a\n- b\n\n1. one\n2. two");
    expect(doc.content?.map((n) => n.type)).toEqual(["bulletList", "orderedList"]);
    expect(doc.content?.[1].content).toHaveLength(2);
  });

  it("captures an image caption written as the italic line after it", () => {
    const doc = mdToDoc("![alt text](/uploads/x.png)\n_a caption_");
    expect(doc.content?.[0].attrs).toMatchObject({ src: "/uploads/x.png", alt: "alt text", caption: "a caption" });
  });

  it("parses a table with a header row", () => {
    const doc = mdToDoc("| a | b |\n| --- | --- |\n| 1 | 2 |");
    const table = doc.content?.[0];
    expect(table?.type).toBe("table");
    expect(table?.content).toHaveLength(2);
    expect(table?.content?.[0].content?.[0].type).toBe("tableHeader");
  });

  it("gathers multi-line paragraphs into one block", () => {
    const doc = mdToDoc("first line\nsecond line");
    expect(doc.content).toHaveLength(1);
    expect(doc.content?.[0].content?.[0].text).toBe("first line\nsecond line");
  });

  it("returns an editable empty document for empty input", () => {
    expect(mdToDoc("").content?.[0].type).toBe("paragraph");
  });
});

describe("inline marks", () => {
  it("maps bold, italic, code, strike and links to marks", () => {
    const nodes = nodesToInline(mdToDoc("**b** and *i* and `c` and ~~s~~ and [l](/x)").content?.[0].content);
    expect(nodes).toBe("**b** and *i* and `c` and ~~s~~ and [l](/x)");
  });
});

describe("docToMd", () => {
  it("round trips headings, lists, code, quote and rule", () => {
    const md = [
      "## Heading",
      "",
      "A paragraph with **bold** and `code`.",
      "",
      "- one",
      "- two",
      "",
      "```js",
      "let x = 1;",
      "```",
      "",
      "> quoted",
      "",
      "---",
    ].join("\n");
    const out = docToMd(mdToDoc(md));
    expect(out).toContain("## Heading");
    expect(out).toContain("**bold**");
    expect(out).toContain("- one\n- two");
    expect(out).toContain("```js\nlet x = 1;\n```");
    expect(out).toContain("> quoted");
    expect(out.trim().endsWith("---")).toBe(true);
  });

  it("re-emits a callout in the syntax the parser understands", () => {
    const out = docToMd(mdToDoc("> [!TIP]\n> Prefer the smaller tool."));
    expect(out.startsWith("> [!TIP]")).toBe(true);
    // and the parser agrees on the way back in
    expect(mdToDoc(out).content?.[0].attrs?.callout).toBe("tip");
  });

  it("rebuilds an image with its caption", () => {
    const out = docToMd(mdToDoc("![diagram](/uploads/d.png)\n_the flow_"));
    expect(out.trim()).toBe("![diagram](/uploads/d.png)\n_the flow_");
  });

  it("never loses text from an unknown node", () => {
    const out = docToMd({
      type: "doc",
      content: [
        {
          type: "mysteryBlock",
          content: [{ type: "text", text: "keep me" }],
        },
      ],
    });
    expect(out.trim()).toBe("keep me");
  });

  it("handles a null document without throwing", () => {
    expect(docToMd(null)).toBe("");
    expect(docToMd(undefined)).toBe("");
  });
});

describe("countWords", () => {
  it("counts prose and ignores code", () => {
    expect(countWords("one two three")).toBe(3);
    expect(countWords("word\n```js\nconst a = 1\n```\nmore")).toBe(2);
  });

  it("is zero for empty input", () => {
    expect(countWords("")).toBe(0);
  });
});
