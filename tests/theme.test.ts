import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { globSync } from "node:fs";
import { join } from "node:path";

/**
 * THEME TOKEN TEST.
 *
 * The "what I do" cards shipped for weeks with `bg-sage`, `bg-butter`,
 * `bg-lilac` and `bg-mist` while none of those colours existed in the theme.
 * Tailwind emits nothing for an unknown utility, so those cards had no
 * background at all and nothing anywhere reported a problem: not the build,
 * not lint, not the type checker, because a class name is just a string.
 *
 * These tests close that hole by reading the source and asserting every colour
 * token a component actually uses is defined in @theme, and that the colours
 * which must flip between light and dark are redefined in the dark block.
 */

const root = process.cwd();
const css = readFileSync(join(root, "app/globals.css"), "utf8");

/** The @theme block, which is the source of truth for colour tokens. */
const themeBlock = css.slice(css.indexOf("@theme"), css.indexOf("@keyframes"));
const darkBlock = css.slice(
  css.indexOf('[data-theme="dark"]'),
  css.indexOf("}", css.indexOf('[data-theme="dark"]')) + 1,
);

const defined = new Set(
  [...themeBlock.matchAll(/--color-([a-z-]+):/g)].map((m) => m[1]),
);

/** Colour names in the project. Kids of these are the tokens we support. */
function usedColorUtilities(files: string[]): Map<string, string[]> {
  const used = new Map<string, string[]>();
  // Only real class tokens: preceded by a word boundary that is whitespace, a
  // quote, or a backtick, and followed by a space or the end of the class.
  // This keeps `text-xs`, `text-[0.9rem]`, `border-b-2` and `bg-gradient` out
  // of the results, since none of them ask for a theme colour.
  const UTIL = /(?<=[\s"'`])(?:bg|text|border)-([a-z]+)(?=[\s"'`]|$)/g;

  for (const file of files) {
    const src = readFileSync(join(root, file), "utf8");
    for (const str of src.matchAll(/(?:className=(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})|"([^"]*)")/g)) {
      const cls = str[1] ?? str[2] ?? str[3] ?? str[4] ?? "";
      for (const m of cls.matchAll(UTIL)) {
        const token = m[1];
        // Size steps, alignment, and layout words share the prefix shape but
        // are not colours. Nothing here can be a theme colour token.
        if (NOT_A_COLOR.has(token)) continue;
        const list = used.get(token) ?? [];
        if (!list.includes(file)) list.push(file);
        used.set(token, list);
      }
    }
  }
  return used;
}

const componentFiles = globSync("components/**/*.tsx", { cwd: root });
/** Words that follow bg-, text- or border- but name no colour. */
const NOT_A_COLOR = new Set([
  "xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "center", "left",
  "right", "justify", "start", "end", "current", "transparent", "inherit",
  "none", "wrap", "nowrap", "balance", "pretty", "clip", "collapse",
  "dashed", "dotted", "solid", "t", "b", "l", "r", "x", "y", "e",
  "hidden", "font", "ellipsis", "clamp", "opacity", "gradient",
]);

const used = usedColorUtilities(componentFiles);

describe("theme colour tokens", () => {
  it("defines every colour a component asks for", () => {
    // Tokens that are intentionally not theme colours: Tailwind palette
    // entries and the on/off primitives.
    const exempt = new Set([
      "black", "white", "gray", "slate", "zinc", "neutral", "stone",
      "red", "orange", "amber", "yellow", "lime", "green", "emerald",
      "teal", "cyan", "sky", "blue", "indigo", "violet", "purple",
      "fuchsia", "pink", "rose",
    ]);

    const missing: string[] = [];
    for (const [token, files] of used) {
      if (exempt.has(token)) continue;
      if (defined.has(token)) continue;
      missing.push(`${token} (used in ${files.slice(0, 3).join(", ")})`);
    }

    // A missing token renders as no style at all: the card or label just has
    // no colour. Name the offenders so the failure is actionable.
    expect(missing.join("\n")).toBe("");
  });

  it("still defines the four pastel card faces that went missing", () => {
    for (const face of ["sage", "butter", "lilac", "mist"]) {
      expect(defined.has(face)).toBe(true);
    }
  });

  it("flips the surfaces that would be illegible in dark mode", () => {
    for (const token of ["ink", "paper", "cream", "night", "ink-faint"]) {
      expect(darkBlock).toContain(`--color-${token}:`);
    }
  });

  it("keeps the pastels dark in dark mode, not light", () => {
    // A pastel left light becomes a glowing panel on a dark page, and ink text
    // on it flips to near-black-on-pastel. Both are wrong.
    for (const face of ["sage", "butter", "lilac", "mist"]) {
      expect(darkBlock).toContain(`--color-${face}:`);
    }
  });

  it("no longer ships opacity utilities as a text colour", () => {
    // Secondary copy is a token now. An opacity utility on text cannot know
    // what it is sitting on, which is how dark mode went unreadable.
    const offenders: string[] = [];
    for (const file of componentFiles) {
      const src = readFileSync(join(root, file), "utf8");
      if (/className="[^"]*(?<!hover:|disabled:|group-hover:)text-(ink|bone|paper|night)\b([^"]*?)(?<!hover:|disabled:|group-hover:)\bopacity-\d/.test(src)) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("defines the muted ramp it tells components to use", () => {
    for (const cls of ["muted", "muted-soft", "muted-on-dark", "muted-on-dark-soft"]) {
      expect(css).toContain(`.${cls} {`);
    }
  });
});
