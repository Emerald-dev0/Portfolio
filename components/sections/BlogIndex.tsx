"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Clock01Icon,
  Search01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { formatDate, tagsOf, type Post } from "../../lib/blog";
import { Reveal } from "../motion/Reveal";
import { BlogCard, PostRow } from "../ui/BlogCard";
import { Doodle } from "../ui/Doodle";
import { Icon } from "../ui/Icon";
import { Section } from "../ui/Section";

/**
 * BLOG INDEX, a real publication front page, not a card grid:
 *
 *   masthead + stats bar
 *   → big featured story with its cover
 *   → sticky search + tag rail
 *   → post grid, with a sidebar (author, latest, tags, elsewhere)
 *
 * Search and tag filtering are client state over the server-rendered post
 * list, so they're instant and need no requests. `?tag=` from a post page
 * seeds the filter.
 */
export function BlogIndex({ posts, initialTag }: { posts: Post[]; initialTag?: string }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | null>(initialTag ?? null);

  const tags = useMemo(() => tagsOf(posts), [posts]);
  const featured = posts.find((p) => p.featured) ?? posts[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (active && !p.tags.includes(active)) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [posts, query, active]);

  const grid = active || query ? filtered : filtered.filter((p) => p.slug !== featured?.slug);
  const totalMinutes = posts.reduce((sum, p) => sum + p.readMinutes, 0);
  const filtering = Boolean(active || query.trim());

  return (
    <Section overlap={false} className="bg-paper">
      {/* ---------------------------------------------------------------- */}
      {/* Masthead                                                          */}
      {/* ---------------------------------------------------------------- */}
      <div className="pattern-dots relative overflow-hidden border-b-[2.5px] border-ink">
        <Doodle
          name="asterisk"
          className="pointer-events-none absolute -right-10 top-16 w-48 text-ink/8 animate-spin-slow"
          strokeWidth={4}
        />
        <Doodle
          name="squiggle"
          className="pointer-events-none absolute bottom-10 left-6 w-28 text-tang"
          strokeWidth={5}
        />

        <div className="mx-auto max-w-7xl px-5 pb-16 pt-32 sm:px-8 lg:pt-40">
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
                [String(posts.length).padStart(2, "0"), "posts"],
                [String(tags.length).padStart(2, "0"), "topics"],
                [`${totalMinutes}`, "minutes of reading"],
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
        {/* -------------------------------------------------------------- */}
        {/* Featured story                                                  */}
        {/* -------------------------------------------------------------- */}
        {featured && !filtering ? (
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
                ) : null}
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

        {/* -------------------------------------------------------------- */}
        {/* Filter rail                                                     */}
        {/* -------------------------------------------------------------- */}
        <div className="sticky top-20 z-30 -mx-1 mt-10 py-2">
          <div className="sticker-sm flex flex-col gap-3 rounded-3xl p-3 sm:flex-row sm:items-center">
            <label className="flex flex-1 items-center gap-2 rounded-full border-2 border-ink bg-paper px-4 py-2">
              <Icon icon={Search01Icon} size={16} className="shrink-0 opacity-60" />
              <span className="sr-only">Search posts</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts, topics, tags…"
                className="w-full bg-transparent text-sm font-medium outline-none placeholder:opacity-50"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="shrink-0 opacity-60 transition hover:opacity-100"
                >
                  <Icon icon={Cancel01Icon} size={15} />
                </button>
              ) : null}
            </label>

            <div
              className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:max-w-[52%] sm:flex-wrap sm:overflow-visible sm:pb-0"
              role="group"
              aria-label="Filter by tag"
            >
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-pressed={active === null}
                className={`chip shrink-0 transition hover:-translate-y-0.5 ${active === null ? "bg-ink text-paper" : ""}`}
              >
                All
              </button>
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActive(active === t ? null : t)}
                  aria-pressed={active === t}
                  className={`chip shrink-0 transition hover:-translate-y-0.5 ${active === t ? "bg-ink text-paper" : ""}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Grid + sidebar                                                  */}
        {/* -------------------------------------------------------------- */}
        <div className="grid gap-10 pb-28 pt-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="font-display text-2xl font-extrabold">
                {filtering ? "Results" : "All posts"}
              </h2>
              <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] opacity-50">
                {grid.length} {grid.length === 1 ? "post" : "posts"}
              </p>
            </div>

            {grid.length ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {grid.map((p) => (
                  <Reveal key={p.slug}>
                    <BlogCard post={p} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="sticker-flat flex flex-col items-center p-12 text-center">
                <Doodle name="spiral" className="w-16 text-tang" strokeWidth={4} />
                <p className="mt-4 font-hand text-3xl font-bold">Nothing here yet.</p>
                <p className="mt-1 max-w-sm text-sm opacity-70">
                  No posts match “{query || active}”. Try a different word, or clear the filter to
                  see everything.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setActive(null);
                  }}
                  className="btn btn-ink mt-6 px-4 py-2 text-sm"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
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
                  {posts.slice(0, 4).map((p, i) => (
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
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setActive(t);
                        window.scrollTo({ top: 420, behavior: "smooth" });
                      }}
                      className={`chip text-[0.65rem] transition hover:-translate-y-0.5 ${active === t ? "bg-ink text-paper" : ""}`}
                    >
                      {t}
                    </button>
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
