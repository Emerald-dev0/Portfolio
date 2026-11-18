import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowLeft01Icon, ArrowRight01Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { BlockRenderer } from "../../../components/blog/BlockRenderer";
import { ShareRow } from "../../../components/blog/ShareRow";
import { AnalyticsBeacon } from "../../../components/blog/Analytics";
import { RichText } from "../../../components/blog/RichText";
import { Doodle } from "../../../components/ui/Doodle";
import { Icon } from "../../../components/ui/Icon";
import { ReadingProgress } from "../../../components/ui/ReadingProgress";
import { site } from "../../../lib/config";
import { breadcrumbSchema, graph, safeJsonLd, WEBSITE_ID } from "../../../lib/seo";
import { formatDate, tocOf } from "../../../lib/blog";
import {
  categoryNameFor,
  getNeighbours,
  getPublicPost,
  getPublicPostWithRow,
  getRelated,
} from "../../../lib/server/blog-source";
import { resolveRedirect } from "../../../lib/server/cms";

/**
 * POST VIEW. Cover, title, byline, sticky table of contents with reading
 * progress, the rendered blocks, share links, prev and next, related posts.
 *
 * Rendered per request from the database: a draft 404s, a scheduled post 404s
 * until its time, and an archived post still resolves but is excluded from
 * every feed and marked noindex.
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const found = await getPublicPostWithRow(slug);
  if (!found) return { title: "Post not found", robots: { index: false, follow: false } };

  const { post, row } = found;
  const title = row.seo_title ?? post.title;
  const description = row.seo_description ?? post.excerpt;
  const image = row.og_image ?? post.cover ?? undefined;
  const url = `${site.url}/blog/${post.slug}`;
  const archived = row.status === "archived";

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: archived ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: row.published_at ?? undefined,
      modifiedTime: row.updated_at,
      tags: post.tags,
      url,
      images: image ? [{ url: image, width: 1200, height: 630, alt: post.title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublicPost(slug);

  // A renamed article keeps working: follow the redirect the CMS left behind.
  if (!post) {
    const target = await resolveRedirect(slug);
    if (target && target !== slug && (await getPublicPost(target))) {
      permanentRedirect(`/blog/${target}`);
    }
    notFound();
  }

  const [entries, { newer, older }, related, category] = await Promise.all([
    Promise.resolve(tocOf(post.content)),
    getNeighbours(post.slug),
    getRelated(post.slug, 3),
    categoryNameFor(post.slug),
  ]);

  const shareUrl = `${site.url}/blog/${post.slug}`;

  /**
   * Article structured data, plus the breadcrumb trail that lets Google print
   * "portfolio > blog > article" instead of a bare URL in the result. The
   * publisher points at the Person node declared in the root layout, so the
   * byline resolves to one entity across the whole site.
   */
  const article = {
    "@type": "BlogPosting",
    "@id": `${shareUrl}#article`,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    wordCount: post.content.reduce((total, block) => {
      const text =
        "text" in block ? block.text
        : block.type === "code" ? block.code
        : block.type === "list" ? block.items.join(" ")
        : block.type === "table" ? [...block.head, ...block.rows.flat()].join(" ")
        : "";
      return total + text.trim().split(/\s+/).filter(Boolean).length;
    }, 0),
    timeRequired: `PT${post.readMinutes}M`,
    inLanguage: "en",
    author: { "@id": `${site.url}/#person` },
    publisher: { "@id": `${site.url}/#person` },
    isPartOf: { "@id": WEBSITE_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": shareUrl },
    url: shareUrl,
    keywords: post.tags.join(", "),
    articleSection: category ?? undefined,
    image: post.cover
      ? [`${site.url}${post.cover}`]
      : [`${shareUrl}/opengraph-image`],
  };

  const jsonLd = graph(
    article,
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
    // The Person node itself is declared once in app/layout.tsx. Repeating it
    // here would be a second declaration of the same @id, so the article only
    // references it.
  );

  return (
    <>
      <ReadingProgress />
      <AnalyticsBeacon slug={post.slug} />
      <script
        type="application/ld+json"
        // Structured data built from our own fields. Escaping "<" means a title
        // can never close the script tag, which is the one real risk here.
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

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
            {category ? (
              <Link
                href={`/blog/category/${slugifyCategory(category)}`}
                className="chip bg-ink text-paper transition hover:-translate-y-0.5"
              >
                {category}
              </Link>
            ) : null}
            {post.tags.map((t) => (
              <Link
                key={t}
                href={`/blog/tag/${slugifyCategory(t)}`}
                className="chip transition hover:-translate-y-0.5"
              >
                {t}
              </Link>
            ))}
          </div>

          <h1 className="display-section mt-5">
            <RichText text={post.title} />
          </h1>

          <p className="mt-5 max-w-3xl text-xl leading-relaxed muted">
            <RichText text={post.excerpt} />
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <span className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full border-2 border-ink bg-leaf font-display text-lg font-extrabold text-bone">
                E
              </span>
              <span className="leading-tight">
                <span className="block font-display text-base font-extrabold">{site.name}</span>
                <span className="block font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] muted-soft">
                  {formatDate(post.date)}
                  {post.updated && post.updated.slice(0, 10) !== post.date
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
          <aside className="hidden lg:col-span-3 lg:block">
            <nav aria-label="On this page" className="sticky top-28">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] muted-soft">
                On this page
              </p>
              {entries.length ? (
                <ul className="mt-4 flex flex-col gap-2.5 border-l-2 border-ink/15 pl-4">
                  {entries.map((e) => (
                    <li key={e.id}>
                      <a
                        href={`#${e.id}`}
                        className={`block text-sm font-semibold leading-snug transition hover:text-leaf ${
                          e.level === 3 ? "pl-4 muted" : ""
                        } ${e.level === 4 ? "pl-8 text-xs muted" : ""}`}
                      >
                        {e.text}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm muted-soft">A short one.</p>
              )}

              <div className="sticker-flat mt-10 p-4">
                <p className="font-hand text-2xl font-bold leading-tight">
                  Written by hand, shipped from the studio.
                </p>
                <p className="mt-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em] muted-soft">
                  {site.githubHandle}
                </p>
              </div>
            </nav>
          </aside>

          <div className="lg:col-span-8 lg:col-start-5">
            {entries.length ? (
              <details className="sticker-flat mb-10 p-5 lg:hidden">
                <summary className="cursor-pointer font-mono text-xs font-bold uppercase tracking-[0.16em]">
                  On this page · {entries.length} sections
                </summary>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {entries.map((e) => (
                    <li key={e.id}>
                      <a href={`#${e.id}`} className={`block text-sm font-semibold ${e.level > 2 ? "pl-4" : ""}`}>
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

            <ShareRow url={shareUrl} title={post.title} />

            <div className="sticker mt-6 flex flex-col gap-4 bg-paper p-6 sm:flex-row sm:items-center">
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl border-[2.5px] border-ink bg-tang font-display text-2xl font-extrabold text-night shadow-[4px_4px_0_var(--color-ink)]">
                DO
              </span>
              <div>
                <p className="font-display text-xl font-extrabold">
                  {site.name} <span className="muted-soft">· {site.persona}</span>
                </p>
                <p className="mt-1 text-sm leading-relaxed muted">
                  Software engineer on TestFlow, and the person writing
                  everything here. I build in public and post what I learn.
                </p>
              </div>
              <Link href="/#contact" className="btn btn-leaf shrink-0 px-4 py-2 text-sm sm:ml-auto">
                Say hello
              </Link>
            </div>

            <nav aria-label="More posts" className="mt-8 grid gap-5 sm:grid-cols-2">
              {older ? (
                <Link
                  href={`/blog/${older.slug}`}
                  className="sticker-flat group p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--color-ink)]"
                >
                  <span className="inline-flex items-center gap-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] muted-soft">
                    <Icon icon={ArrowLeft01Icon} size={13} />
                    Older post
                  </span>
                  <span className="mt-2 block font-display text-lg font-extrabold leading-snug">
                    {older.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {newer ? (
                <Link
                  href={`/blog/${newer.slug}`}
                  className="sticker-flat group p-5 text-right transition duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--color-ink)]"
                >
                  <span className="inline-flex items-center gap-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] muted-soft">
                    Newer post
                    <Icon icon={ArrowRight01Icon} size={13} />
                  </span>
                  <span className="mt-2 block font-display text-lg font-extrabold leading-snug">
                    {newer.title}
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
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="sticker-flat group p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--color-ink)]"
                >
                  <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] muted-soft">
                    {formatDate(p.date)} · {p.readMinutes} min
                  </p>
                  <p className="mt-2 font-display text-xl font-extrabold leading-snug">{p.title}</p>
                  <p className="mt-2 line-clamp-2 text-sm muted">{p.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}

/** Category and tag links share one slug shape. */
function slugifyCategory(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
