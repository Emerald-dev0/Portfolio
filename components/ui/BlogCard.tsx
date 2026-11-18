import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight01Icon, Clock01Icon, Calendar01Icon } from "@hugeicons/core-free-icons";
import { formatDate, type Post } from "../../lib/blog";
import { Icon } from "./Icon";
import { Doodle } from "./Doodle";

/**
 * BLOG CARD, one post as a sticker: cover art on top, date and reading time in
 * mono, display size title, excerpt, tags, and an arrow that slides on hover.
 *
 * When a post has no cover, the plate is drawn rather than borrowed: a doodle
 * on a pastel fill, which keeps the collage vocabulary without faking artwork.
 */
export function BlogCard({
  post,
  priority = false,
  category,
}: {
  post: Post;
  priority?: boolean;
  category?: string | null;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="sticker group flex h-full flex-col overflow-hidden transition duration-200 hover:-translate-y-1.5"
    >
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden border-b-[2.5px] border-ink bg-ink/5">
        {post.cover ? (
          <Image
            src={post.cover}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 420px"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="pattern-dots grid h-full place-items-center bg-lagoon">
            <Doodle name="asterisk" className="w-16 animate-spin-slow text-ink/40" strokeWidth={5} />
          </div>
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-paper px-2.5 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em]">
          <Icon icon={Clock01Icon} size={11} />
          {post.readMinutes} min
        </span>
        {category ? (
          <span className="absolute right-3 top-3 rounded-full border-2 border-ink bg-leaf px-2.5 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] text-bone">
            {category}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-x-3 font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] opacity-60">
          <span className="inline-flex items-center gap-1.5">
            <Icon icon={Calendar01Icon} size={12} />
            {formatDate(post.date)}
          </span>
        </div>
        <h3 className="display-card mt-2.5 text-[1.4rem] transition group-hover:translate-x-1">
          {post.title}
        </h3>
        <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed opacity-80">{post.excerpt}</p>
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-5">
          {post.tags.slice(0, 2).map((t) => (
            <span key={t} className="chip px-2.5 py-0.5 text-[0.62rem]">
              {t}
            </span>
          ))}
          <span className="ml-auto inline-flex items-center gap-1 font-mono text-[0.65rem] font-bold uppercase tracking-wider">
            Read
            <Icon
              icon={ArrowUpRight01Icon}
              size={14}
              className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** A compact row for the sidebar's latest list. */
export function PostRow({ post, index }: { post: Post; index: number }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex gap-3 border-b-2 border-ink/10 py-3 last:border-0"
    >
      <span className="font-mono text-sm font-bold opacity-30">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span>
        <span className="block text-sm font-bold leading-snug transition group-hover:text-leaf">
          {post.title}
        </span>
        <span className="mt-0.5 block font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] opacity-50">
          {formatDate(post.date)} · {post.readMinutes} min
        </span>
      </span>
    </Link>
  );
}
