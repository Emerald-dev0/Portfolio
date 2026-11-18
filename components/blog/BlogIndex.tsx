"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Clock01Icon,
  Search01Icon,
  Cancel01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { formatDate, type Post } from "../../lib/blog";
import { Reveal } from "../motion/Reveal";
import { BlogCard, PostRow } from "../ui/BlogCard";
import { Doodle } from "../ui/Doodle";
import { Icon } from "../ui/Icon";
import { Section } from "../ui/Section";

export type IndexPost = Post & { category: string | null };

type Facet = { name: string; slug: string; count: number };

type Props = {
  posts: IndexPost[];
  total: number;
  categories: Facet[];
  tags: Facet[];
  query: string;
  activeCategory: string | null;
  activeTag: string | null;
  page: number;
  perPage: number;
  allPosts: IndexPost[];
};

/**
 * BLOG INDEX. A publication front page, not a card grid:
 *
 *   masthead and counts
 *   featured story
 *   sticky search and filter rail, with real URLs for every filter
 *   post grid, load more, and a sidebar
 *
 * Search is a client interaction, but it writes to the URL, so a filtered view
 * is shareable, survives a reload, and the server does the actual filtering.
 * Every post here comes from the database, so publishing in the dashboard
 * changes this page on the next request.
 */
export function BlogIndex({
  posts,
  total,
  categories,
  tags,
  query,
  activeCategory,
  activeTag,
  page,
  perPage,
  allPosts,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [text, setText] = useState(query);
  const [pending, start] = useTransition();
  const [extra, setExtra] = useState<IndexPost[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinel = useRef<HTMLDivElement | null>(null);

  useEffect(() => setText(query), [query]);
  useEffect(() => {
    setExtra([]);
  }, [query, activeCategory, activeTag]);

  const filtering = Boolean(query || activeCategory || activeTag);
  const featured = !filtering ? (posts.find((p) => p.featured) ?? posts[0]) : null;
  const gridInitial = featured ? posts.filter((p) => p.slug !== featured.slug) : posts;
  const grid = [...gridInitial, ...extra];
  const hasMore = !filtering && page * perPage < total;
  const totalMinutes = allPosts.reduce((sum, p) => sum + p.readMinutes, 0);

  function go(next: { q?: string; category?: string | null; tag?: string | null }) {
    const search = new URLSearchParams(params.toString());
    const setOrDelete = (key: string, value: string | null | undefined) => {
      if (value === undefined) return;
      if (value) search.set(key, value);
      else search.delete(key);
    };
    setOrDelete("q", next.q);
    setOrDelete("category", next.category);
    setOrDelete("tag", next.tag);
    search.delete("page");
    const qs = search.toString();
    start(() => router.push(qs ? `/blog?${qs}` : "/blog", { scroll: false }));
  }

  // Load more fetches the next server page and appends it, so the URL and the
  // rendered list never drift apart.
  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasMore || loadingMore) return;
    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0].isIntersecting) return;
        setLoadingMore(true);
        try {
          const res = await fetch(`/api/blog/page?page=${page + 1}`, { cache: "no-store" });
          if (res.ok) {
            const data = (await res.json()) as { posts: IndexPost[] };
            setExtra((prev) => [...prev, ...data.posts]);
          }
        } finally {
          setLoadingMore(false);
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page]);

  return (
    <Section overlap={false} className="bg-paper">
      <div className="pattern-dots relative overflow-hidden border-b-[2.5px] border-ink">
        <Doodle
          name="asterisk"
          className="pointer-events-none absolute -right-10 top-16 w-48 animate-spin-slow text-ink/8"
          strokeWidth={4}
        />
        <Doodle
          name="squiggle"
          className="pointer-events-none absolute bottom-10 left-6 w-28 text-tang"
          strokeWidth={5}
        />

        <div className="mx-auto max-w-7xl px-5 pb-12 pt-24 sm:px-8 sm:pb-16 sm:pt-32 lg:pt-40">
          <Reveal>
            <span className="label-pill">
              <span className="size-2 rounded-full bg-leaf" />
              Blog
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="display-hero mt-6 max-w-4xl text-[clamp(2.4rem,7vw,5rem)]">
              Notes from things
              <br />
              <span className="relative inline-block">
                I&rsquo;ve built
                <Doodle
                  name="squiggle"
                  className="absolute -bottom-3 left-0 w-full text-leaf"
                  strokeWidth={6}
                />
              </span>{" "}
              and learned.
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed opacity-85">
              I write about projects, technical decisions, interesting problems and lessons from
              working through them. Not perfect technical papers, just what I learned, in case it is
              useful to someone else.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <dl className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              {[
                [String(allPosts.length).padStart(2, "0"), "posts"],
                [String(tags.length).padStart(2, "0"), "topics"],
                [String(totalMinutes), "minutes of reading"],
              ].map(([n, label]) => (
                <div key={label} className="flex items-baseline gap-2">
                  <dt className="font-display text-3xl font-extrabold leading-none">{n}</dt>
                  <dd className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] opacity-60">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Featured story */}
        {featured ? (
          <Reveal className="relative z-10 -mt-10">
            <Link
              href={`/blog/${featured.slug}`}
              className="sticker group grid overflow-hidden transition duration-200 hover:-translate-y-1.5 lg:grid-cols-2"
            >
              <div className="relative aspect-[16/11] overflow-hidden border-b-[2.5px] border-ink bg-ink/5 lg:aspect-auto lg:min-h-[420px] lg:border-b-0 lg:border-r-[2.5px]">
                {featured.cover ? (
                  <Image
                    src={featured.cover}
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 640px"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="pattern-dots grid h-full place-items-center bg-lagoon">
                    <Doodle name="star" className="w-24 text-ink/30" strokeWidth={4} />
                  </div>
                )}
                <span className="absolute left-4 top-4 rotate-[-4deg] rounded-full border-2 border-ink bg-leaf px-3 py-1 font-hand text-xl font-bold text-bone shadow-[3px_3px_0_var(--color-ink)]">
                  featured
                </span>
              </div>

              <div className="flex flex-col justify-center p-7 sm:p-10">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] opacity-60">
                  <span>{formatDate(featured.date)}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Icon icon={Clock01Icon} size={12} />
                    {featured.readMinutes} min read
                  </span>
                  {featured.category ? <span>{featured.category}</span> : null}
                </div>
                <h2 className="display-section mt-4 text-[clamp(1.9rem,4vw,3.1rem)] transition group-hover:translate-x-1">
                  {featured.title}
                </h2>
                <p className="mt-4 line-clamp-3 text-lg leading-relaxed opacity-80">
                  {featured.excerpt}
                </p>
                <span className="mt-7 inline-flex w-fit items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider">
                  Read the post
                  <Icon
                    icon={ArrowUpRight01Icon}
                    size={16}
                    className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
              </div>
            </Link>
          </Reveal>
        ) : null}

        {/* Filter rail */}
        <div className="sticky top-20 z-30 -mx-1 mt-10 py-2">
          <div className="sticker-sm flex flex-col gap-3 rounded-3xl p-3 sm:flex-row sm:items-center">
            <form
              className="flex flex-1 items-center gap-2 rounded-full border-2 border-ink bg-paper px-4 py-2"
              onSubmit={(e) => {
                e.preventDefault();
                go({ q: text.trim() });
              }}
            >
              <Icon icon={Search01Icon} size={16} className="shrink-0 opacity-60" />
              <label className="sr-only" htmlFor="blog-search">
                Search posts
              </label>
              <input
                id="blog-search"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Search posts, topics, tags"
                className="w-full bg-transparent text-sm font-medium outline-none placeholder:opacity-50"
              />
              {pending ? (
                <Icon icon={Loading03Icon} size={15} className="shrink-0 animate-spin opacity-60" />
              ) : null}
              {text ? (
                <button
                  type="button"
                  onClick={() => {
                    setText("");
                    go({ q: "" });
                  }}
                  aria-label="Clear search"
                  className="shrink-0 opacity-60 transition hover:opacity-100"
                >
                  <Icon icon={Cancel01Icon} size={15} />
                </button>
              ) : null}
            </form>

            <div
              className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:max-w-[56%] sm:flex-wrap sm:overflow-visible sm:pb-0"
              role="group"
              aria-label="Filter by category"
            >
              <Link
                href="/blog"
                scroll={false}
                aria-current={!activeCategory && !activeTag ? "page" : undefined}
                className={`chip shrink-0 transition hover:-translate-y-0.5 ${!activeCategory && !activeTag ? "bg-ink text-paper" : ""}`}
              >
                All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/blog/category/${c.slug}`}
                  scroll={false}
                  aria-current={activeCategory === c.name.toLowerCase() ? "page" : undefined}
                  className={`chip shrink-0 transition hover:-translate-y-0.5 ${activeCategory === c.name.toLowerCase() ? "bg-ink text-paper" : ""}`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-10 pb-28 pt-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="font-display text-2xl font-extrabold">
                {filtering ? "Results" : "All posts"}
              </h2>
              <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] opacity-50">
                {total} {total === 1 ? "post" : "posts"}
              </p>
            </div>

            {grid.length ? (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  {grid.map((p) => (
                    <Reveal key={p.slug}>
                      <BlogCard post={p} category={activeCategory ? undefined : (p.category ?? undefined)} />
                    </Reveal>
                  ))}
                </div>

                {hasMore ? (
                  <div ref={sentinel} className="mt-12 flex flex-col items-center gap-3">
                    {loadingMore ? (
                      <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] opacity-60">
                        Loading more posts
                      </p>
                    ) : (
                      <Link
                        href={`/blog/page/${page + 1}`}
                        className="btn btn-ink px-5 py-2.5 text-sm"
                      >
                        Load more posts
                        <Icon icon={ArrowRight01Icon} size={15} />
                      </Link>
                    )}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="sticker-flat flex flex-col items-center p-12 text-center">
                <Doodle name="spiral" className="w-16 text-tang" strokeWidth={4} />
                <p className="mt-4 font-hand text-3xl font-bold">
                  {filtering ? "Nothing matches that." : "No posts yet."}
                </p>
                <p className="mt-1 max-w-sm text-sm opacity-70">
                  {filtering
                    ? `No posts match ${query ? `"${query}"` : (activeTag ?? activeCategory ?? "")}. Try a different word, or clear the filter to see everything.`
                    : "The first one is being written. Check back soon."}
                </p>
                {filtering ? (
                  <Link href="/blog" className="btn btn-ink mt-6 px-4 py-2 text-sm">
                    Clear filters
                  </Link>
                ) : null}
              </div>
            )}
          </div>

          <aside className="lg:col-span-4">
            <div className="flex flex-col gap-6 lg:sticky lg:top-40">
              <div className="sticker bg-leaf p-6 text-bone">
                <div className="flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-2xl border-2 border-night bg-cream font-display text-xl font-extrabold text-night">
                    DO
                  </span>
                  <div>
                    <p className="font-display text-lg font-extrabold leading-tight">
                      Daniel Oluwadare
                    </p>
                    <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] opacity-80">
                      Computer Science student
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed opacity-95">
                  I build in public: backend systems, developer tools, and interfaces with a pulse.
                  This is where the lessons land first.
                </p>
                <Link href="/#contact" className="btn btn-paper mt-5 w-full px-4 py-2 text-sm">
                  Work with me
                  <Icon icon={ArrowRight01Icon} size={15} />
                </Link>
              </div>

              <div className="sticker-flat p-5">
                <h3 className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.16em] opacity-50">
                  Latest
                </h3>
                <div className="mt-3">
                  {allPosts.slice(0, 4).map((p, i) => (
                    <PostRow key={p.slug} post={p} index={i} />
                  ))}
                </div>
              </div>

              <div className="sticker-flat p-5">
                <h3 className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.16em] opacity-50">
                  Topics
                </h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <Link
                      key={t.slug}
                      href={`/blog/tag/${t.slug}`}
                      scroll={false}
                      className={`chip text-[0.65rem] transition hover:-translate-y-0.5 ${activeTag === t.name ? "bg-ink text-paper" : ""}`}
                    >
                      {t.name}
                      <span className="ml-1 opacity-50">{t.count}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="sticker-flat bg-tang p-5 text-night">
                <p className="font-hand text-2xl font-bold leading-tight">
                  Got a bug I should write about?
                </p>
                <a
                  href="mailto:oluwadare458@gmail.com?subject=Blog%20idea"
                  className="mt-3 inline-flex items-center gap-1.5 font-mono text-[0.65rem] font-bold uppercase tracking-[0.12em] underline decoration-2 underline-offset-4"
                >
                  Send it over
                  <Icon icon={ArrowUpRight01Icon} size={13} />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Section>
  );
}
