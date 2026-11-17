"use client";

import Image from "next/image";
import { headingId, type Block } from "../../lib/blog";
import { CodeBlock } from "../ui/CodeBlock";
import { Doodle } from "../ui/Doodle";
import { RichText } from "./RichText";

/**
 * BLOCK RENDERER, one visual language for every block type. Used by the post
 * page and by the studio preview, so what you see while writing is exactly
 * what publishes.
 */

const CALLOUT_STYLE = {
  note: "bg-lagoon text-night",
  tip: "bg-leaf text-bone",
  warning: "bg-tang text-night",
} as const;

const CALLOUT_LABEL = { note: "Note", tip: "Tip", warning: "Heads up" } as const;

const CALLOUT_DOODLE = { note: "asterisk", tip: "spark", warning: "bolt" } as const;

export function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "heading": {
      const id = headingId(block.text);
      if (block.level === 2) {
        return (
          <h2 id={id} className="display-card mt-12 scroll-mt-32 first:mt-0">
            <RichText text={block.text} />
          </h2>
        );
      }
      if (block.level === 3) {
        return (
          <h3 id={id} className="mt-9 scroll-mt-32 font-display text-2xl font-extrabold leading-tight">
            <RichText text={block.text} />
          </h3>
        );
      }
      return (
        <h4
          id={id}
          className="mt-8 scroll-mt-32 font-mono text-sm font-bold uppercase tracking-[0.16em]"
        >
          <RichText text={block.text} />
        </h4>
      );
    }

    case "paragraph":
      return (
        <p className="text-[1.0625rem] leading-[1.75] opacity-90 sm:text-lg">
          <RichText text={block.text} />
        </p>
      );

    case "code":
      return <CodeBlock lang={block.lang} code={block.code} />;

    case "callout":
      return (
        <div className={`sticker-flat flex gap-4 p-5 ${CALLOUT_STYLE[block.kind]}`}>
          <Doodle
            name={CALLOUT_DOODLE[block.kind]}
            className="mt-0.5 w-7 shrink-0"
            strokeWidth={5}
          />
          <div>
            <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.16em]">
              {CALLOUT_LABEL[block.kind]}
            </p>
            <p className="mt-1 leading-relaxed">
              <RichText text={block.text} />
            </p>
          </div>
        </div>
      );

    case "list":
      return block.ordered ? (
        <ol className="flex flex-col gap-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3.5 text-[1.0625rem] leading-relaxed opacity-90">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 border-ink bg-tang font-mono text-xs font-bold text-night">
                {i + 1}
              </span>
              <RichText text={item} />
            </li>
          ))}
        </ol>
      ) : (
        <ul className="flex flex-col gap-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[1.0625rem] leading-relaxed opacity-90">
              <Doodle name="check" className="mt-1 w-5 shrink-0 text-leaf" strokeWidth={7} />
              <RichText text={item} />
            </li>
          ))}
        </ul>
      );

    case "quote":
      return (
        <blockquote className="border-l-4 border-leaf pl-5 font-hand text-3xl leading-snug">
          <RichText text={block.text} />
        </blockquote>
      );

    case "image":
      return (
        <figure className="my-2">
          <div className="sticker relative aspect-[16/10] overflow-hidden">
            <Image
              src={block.src}
              alt={block.alt}
              fill
              sizes="(max-width: 768px) 100vw, 720px"
              className="object-cover"
            />
          </div>
          {block.caption ? (
            <figcaption className="mt-3 text-center font-mono text-xs opacity-60">
              <RichText text={block.caption} />
            </figcaption>
          ) : null}
        </figure>
      );

    case "table":
      return (
        <div className="sticker-flat overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b-[2.5px] border-ink">
                {block.head.map((h, i) => (
                  <th key={i} className="px-4 py-3 font-mono text-[0.7rem] font-bold uppercase tracking-[0.12em]">
                    <RichText text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className="border-b border-ink/15 last:border-0">
                  {row.map((cell, c) => (
                    <td key={c} className="px-4 py-3 align-top opacity-90">
                      <RichText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "hr":
      return (
        <div className="flex justify-center py-4" aria-hidden="true">
          <Doodle name="asterisk" className="w-7 text-ink/25" strokeWidth={6} />
        </div>
      );
  }
}
