<div align="center">

# Daniel Oluwadare, Portfolio & Studio

**Computer Science student. Backend developer. Building in public.**

`Next.js 15` · `React 19` · `TypeScript` · `Tailwind CSS v4` · `Framer Motion` · `SQLite` · `TipTap` · `Vercel Blob` · `GitHub API` · `Spotify API`

</div>

---

## What this is

A portfolio built as a **sticker wall**: thick ink outlines, hard offset shadows,
risograph project posters, hand-drawn doodles, and one thing you can actually
grab and throw around. Behind the loud surface it does three boring things very
well:

1. **The work section is real.** Every project description is written from that
   project's own README or live site, with a role, an honest status, and a
   footnote about what isn't shipped yet. No invented URLs.
2. **The GitHub panel reads itself.** Live GraphQL read → committed snapshot →
   curated fallback, so it never shows a stale claim without saying so.
3. **The blog is a real publishing platform.** A private dashboard at `/admin`
   with a rich editor, autosave, revisions, scheduling, a media library and
   analytics that only counts real events. Posts live in a database, and the
   public blog, RSS and sitemap read the same rows. See [BLOG.md](./BLOG.md).

---

## Routes

| Route | What it is |
| --- | --- |
| `/` | The wall: hero, services, poster strip, work, GitHub, about, process, content, blog teaser, contact, terminal footer |
| `/blog` | Publication front page, featured story, search, category rail, load more |
| `/blog/[slug]` | Post with TOC, reading progress, share, prev/next, related, JSON-LD |
| `/blog/category/[slug]`, `/blog/tag/[slug]`, `/blog/page/[n]` | Filtered and paged views |
| `/admin` | The private CMS: dashboard, posts, editor, categories, media, analytics |
| `/feed.xml` | RSS 2.0, published posts only |
| `/sitemap.xml` | Home, blog, categories, tags, every published post |
| `/api/spotify/now-playing` | Now-playing proxy; hides itself when unconfigured |

---

## Writing posts

Posts live in a single SQLite file and are written in the dashboard at
**`/admin`**, protected by `STUDIO_PASSWORD`. Nothing to sign up for: cloning
the repo and running `npm run dev` gives you a working blog. The five articles
in `content/blog/*.md` are imported once, on first boot, so the blog starts with
its real archive.

```bash
npm run test        # the CMS, analytics and editor suite
npm run typecheck
npm run build
```

Setup, the four post states, scheduling, revisions, media and exactly how the
analytics are counted are all in **[BLOG.md](./BLOG.md)**.

---

## The GitHub section reads itself

Four layers, so it can't break:

| # | Layer | When |
| --- | --- | --- |
| 1 | **Live**, GraphQL: profile, pins, contributions | `GITHUB_TOKEN` set |
| 2 | **Snapshot**, `lib/github.snapshot.json` | no token / API down |
| 3 | **Merged**, live fields over the snapshot | always |
| 4 | **Curated**, project copy in `lib/content.ts` | everything else |

```bash
# .env.local (optional, the committed snapshot works out of the box)
GITHUB_TOKEN=ghp_...        # read-only is enough
GITHUB_LOGIN=Emerald-dev0
npm run sync:github         # refresh the committed snapshot
```

---

## Spotify

A live "now playing" sticker in the hero and above Process, with a progress
bar. Set `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` and
`SPOTIFY_REFRESH_TOKEN`; the one-time token exchange is in
**[SPOTIFY.md](./SPOTIFY.md)**. Unconfigured, it renders nothing rather than an
empty box.

---

## Design system

Everything is in `app/globals.css` under `@theme` and `@layer components`:

- **Ink / paper / cream / night** adapt to light and dark; **leaf, tang, grape,
  lagoon** stay fixed so text on vivid panels keeps its contrast. `bone` is a
  fixed light for text on dark panels in both themes.
- **Materials**: `.sticker`, `.sticker-sm`, `.sticker-flat`, `.btn`, `.chip`,
  `.label-pill`, `.tape`, `.marker`, `.ink-gradient`, `.halftone`,
  `.pattern-dots`, `.pattern-grid`.
- **Type**: Bricolage Grotesque (display) · Inter (body) · JetBrains Mono
  (labels, terminal) · Caveat (handwriting).
- **Motion** (`components/motion/Loud.tsx`): `Parallax`, `TiltCard`,
  `Magnetic`, all three degrade to static under `prefers-reduced-motion`.
- **Icons**: Hugeicons. Swap them in one place per component; no inline SVG
  icon soup.

### Copy and links live in two files

- `lib/content.ts`, every word: hero, services, projects, about, process,
  contact, footer.
- `lib/config.ts`, every URL: socials, email, GitHub. A social with
  `href: null` is a placeholder and renders nowhere.

---

## Scripts

```bash
npm run dev         # local dev
npm run build       # production build (also type-checks + lints)
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run sync:github # refresh the GitHub snapshot
npm run sync:blog   # refresh the blog snapshot from content/blog
```

## Project art

The 8 posters in `public/projects/` are original risograph-style artwork
generated for this site, matched to each project's actual subject. Swap any
file for a real screenshot and nothing else changes, the cards just read the
path.
