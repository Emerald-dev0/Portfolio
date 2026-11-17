import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft01Icon, ArrowRight01Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { BlockRenderer } from "../../../components/blog/BlockRenderer";
import { RichText } from "../../../components/blog/RichText";
import { Doodle } from "../../../components/ui/Doodle";
import { Icon } from "../../../components/ui/Icon";
import { ReadingProgress } from "../../../components/ui/ReadingProgress";
import { site } from "../../../lib/config";
import { adjacent, formatDate, tocOf } from "../../../lib/blog";
import { findPost, publishedPosts } from "../../../lib/server/blog-store";

/**
 * POST VIEW, cover, title, byline, sticky table of contents with reading
 * progress, the rendered Markdown blocks, share links, and prev/next.
 * Posts come from Markdown files or the studio, so the page is rendered per
 * request and revalidated on publish rather than baked at build time.
 */

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await publishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await findPost(slug);
  if (!post) return { title: "Post not found" };
  const image = post.cover
    ? [{ url: post.cover, width: 1200, height: 800, alt: post.title }]
    : undefined;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `${site.url}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      tags: post.tags,
      url: `${site.url}/blog/${post.slug}`,
      images: image,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      images: image?.map((i) => i.url),
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await findPost(slug);
  if (!post) notFound();

  const posts = await publishedPosts();
  const entries = tocOf(post.content);
  const { prev, next } = adjacent(posts, slug);
  const shareUrl = `${site.url}/blog/${post.slug}`;

  // Related: same tag, most recent, excluding this post.
  const related = posts
    .filter((p) => p.slug !== post.slug && p.tags.some((t) => post.tags.includes(t)))
    .slice(0, 2);

  return (
    <>
      <ReadingProgress />

      <article className="mx-auto max-w-7xl px-5 pb-8 pt-32 sm:px-8 lg:pt-40">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.14em] transition hover:opacity-60"
        >
          <Icon icon={ArrowLeft01Icon} size={15} />
          All posts
        </Link>

        <header className="mt-8 max-w-4xl">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`} className="chip transition hover:-translate-y-0.5">
                {t}
              </Link>
            ))}
          </div>
          <h1 className="display-section mt-5">
            <RichText text={post.title} />
          </h1>
          <p className="mt-5 max-w-3xl text-xl leading-relaxed opacity-80">
            <RichText text={post.excerpt} />
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <span className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full border-2 border-ink bg-leaf font-display text-lg font-extrabold text-bone">
                E
              </span>
              <span className="leading-tight">
                <span className="block font-display text-base font-extrabold">{site.name}</span>
                <span className="block font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] opacity-60">
                  {formatDate(post.date)}
                  {post.updated && post.updated !== post.date
                    ? ` · updated ${formatDate(post.updated)}`
                    : ""}
                </span>
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.12em]">
              <Icon icon={Clock01Icon} size={13} />
              {post.readMinutes} min read
            </span>
          </div>
        </header>

        {post.cover ? (
          <div className="sticker relative mt-10 aspect-[16/8] overflow-hidden">
            <Image
              src={post.cover}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="object-cover"
            />
          </div>
        ) : null}
      </article>

      <div className="mx-auto max-w-7xl px-5 pb-28 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Sticky TOC (desktop) */}
          <aside className="hidden lg:col-span-3 lg:block">
            <nav aria-label="On this page" className="sticky top-28">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] opacity-50">
                On this page
              </p>
              {entries.length ? (
                <ul className="mt-4 flex flex-col gap-2.5 border-l-2 border-ink/15 pl-4">
                  {entries.map((e) => (
                    <li key={e.id}>
                      <a
                        href={`#${e.id}`}
                        className={`block text-sm font-semibold leading-snug transition hover:text-leaf ${
                          e.level === 3 ? "pl-4 opacity-80" : ""
                        } ${e.level === 4 ? "pl-8 text-xs opacity-70" : ""}`}
                      >
                        {e.text}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm opacity-60">A short one.</p>
              )}

              <div className="sticker-flat mt-10 p-4">
                <p className="font-hand text-2xl font-bold leading-tight">
                  Written by hand, shipped from the studio.
                </p>
                <p className="mt-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em] opacity-60">
                  {site.githubHandle}
                </p>
              </div>
            </nav>
          </aside>

          <div className="lg:col-span-8 lg:col-start-5">
            {/* Collapsible TOC (mobile) */}
            {entries.length ? (
              <details className="sticker-flat mb-10 p-5 lg:hidden">
                <summary className="cursor-pointer font-mono text-xs font-bold uppercase tracking-[0.16em]">
                  On this page · {entries.length} sections
                </summary>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {entries.map((e) => (
                    <li key={e.id}>
                      <a
                        href={`#${e.id}`}
                        className={`block text-sm font-semibold ${e.level > 2 ? "pl-4" : ""}`}
                      >
                        {e.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}

            <div className="flex flex-col gap-6">
              {post.content.map((b, i) => (
                <BlockRenderer key={i} block={b} />
              ))}
            </div>

            {/* Share */}
            <div className="sticker mt-14 flex flex-wrap items-center gap-3 p-5">
              <p className="font-hand text-2xl font-bold">Did this help?</p>
              <p className="text-sm opacity-70">Send it to someone who&apos;s fighting the same bug.</p>
              <div className="ml-auto flex flex-wrap gap-2">
                <a
                  className="btn btn-ink px-4 py-2 text-sm"
                  href={`https://x.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Share on X
                </a>
                <a
                  className="btn btn-paper px-4 py-2 text-sm"
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title}, ${shareUrl}`)}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  WhatsApp
                </a>
                <a
                  className="btn btn-lagoon px-4 py-2 text-sm"
                  href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(shareUrl)}`}
                >
                  Email
                </a>
              </div>
            </div>

            {/* Author card */}
            <div className="sticker mt-6 flex flex-col gap-4 bg-paper p-6 sm:flex-row sm:items-center">
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl border-[2.5px] border-ink bg-tang font-display text-2xl font-extrabold text-night shadow-[4px_4px_0_var(--color-ink)]">
                DO
              </span>
              <div>
                <p className="font-display text-xl font-extrabold">
                  {site.name} <span className="opacity-50">· {site.persona}</span>
                </p>
                <p className="mt-1 text-sm leading-relaxed opacity-80">
                  Computer Science student, backend developer on TestFlow, and the person writing
                  everything here. I build in public and post what I learn.
                </p>
              </div>
              <Link href="/#contact" className="btn btn-leaf shrink-0 px-4 py-2 text-sm sm:ml-auto">
                Say hello
              </Link>
            </div>

            {/* Prev / next */}
            <nav aria-label="More posts" className="mt-8 grid gap-5 sm:grid-cols-2">
              {prev ? (
                <Link
                  href={`/blog/${prev.slug}`}
                  className="sticker-flat group p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--color-ink)]"
                >
                  <span className="inline-flex items-center gap-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] opacity-60">
                    <Icon icon={ArrowLeft01Icon} size={13} />
                    Older post
                  </span>
                  <span className="mt-2 block font-display text-lg font-extrabold leading-snug">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={`/blog/${next.slug}`}
                  className="sticker-flat group p-5 text-right transition duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--color-ink)]"
                >
                  <span className="inline-flex items-center gap-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] opacity-60">
                    Newer post
                    <Icon icon={ArrowRight01Icon} size={13} />
                  </span>
                  <span className="mt-2 block font-display text-lg font-extrabold leading-snug">
                    {next.title}
                  </span>
                </Link>
              ) : null}
            </nav>
          </div>
        </div>

        {related.length ? (
          <section className="mt-20">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-extrabold">Keep reading</h2>
              <Doodle name="squiggle" className="w-16 text-tang" strokeWidth={5} />
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="sticker-flat group p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--color-ink)]"
                >
                  <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] opacity-60">
                    {formatDate(p.date)} · {p.readMinutes} min
                  </p>
                  <p className="mt-2 font-display text-xl font-extrabold leading-snug">{p.title}</p>
                  <p className="mt-2 line-clamp-2 text-sm opacity-75">{p.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
