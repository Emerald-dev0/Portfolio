"use client";

import { useState } from "react";
import { CheckIcon, Copy01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "./Icon";

/**
 * CODE BLOCK, a dark sticker panel with a tiny syntax highlighter and a
 * copy button. The highlighter is a small tokenizer (comments, strings,
 * numbers, keywords) that renders text nodes only, no HTML injection,
 * no dependency. Colors are tuned for the night background.
 */

const KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "await", "async", "import",
  "from", "export", "default", "new", "if", "else", "for", "of", "in",
  "type", "interface", "extends", "class", "try", "catch", "throw",
  "switch", "case", "break", "continue", "typeof", "instanceof", "as",
  "satisfies", "keyof", "void", "delete", "yield", "static", "this",
  "super", "true", "false", "null", "undefined",
]);

const TOKEN_RE =
  /(\/\/[^\n]*)|(\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(\d[\d_]*(?:\.\d+)?)\b|([A-Za-z_$][\w$]*)/g;

type Token = { text: string; cls?: string };

function tokenize(code: string): Token[] {
  const out: Token[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(code)) !== null) {
    if (m.index > last) out.push({ text: code.slice(last, m.index) });
    const [full, lineComment, blockComment, str, num, ident] = m;
    if (lineComment || blockComment) out.push({ text: full, cls: "text-bone/40 italic" });
    else if (str) out.push({ text: full, cls: "text-lagoon" });
    else if (num) out.push({ text: full, cls: "text-[#C4B5FD]" });
    else if (ident) out.push({ text: full, cls: KEYWORDS.has(ident) ? "text-tang" : undefined });
    last = m.index + full.length;
  }
  if (last < code.length) out.push({ text: code.slice(last) });
  return out;
}

export function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const tokens = tokenize(code);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable, the code is still readable */
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-ink bg-night text-bone shadow-[5px_5px_0_var(--color-ink)]">
      <div className="flex items-center justify-between border-b-2 border-bone/15 px-4 py-2">
        <span className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] text-bone/60">
          {lang}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code to clipboard"
          className="inline-flex items-center gap-1.5 rounded-full border border-bone/25 px-2.5 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-wider transition hover:bg-bone/10"
        >
          <Icon icon={copied ? CheckIcon : Copy01Icon} size={13} />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 sm:p-5">
        <code className="font-mono text-[0.82rem] leading-relaxed">
          {tokens.map((t, i) =>
            t.cls ? (
              <span key={i} className={t.cls}>
                {t.text}
              </span>
            ) : (
              <span key={i}>{t.text}</span>
            ),
          )}
        </code>
      </pre>
    </div>
  );
}
