# Blog platform: architecture

## What already exists (and is reused)

| Layer | Today | Decision |
| --- | --- | --- |
| Framework | Next.js 15 App Router, React 19, TS | keep |
| Styling | Tailwind v4 + `app/globals.css` design system | keep, extend |
| Content | Markdown in `content/blog/*.md`, read through `lib/markdown.ts` into typed `Block[]` | **kept as the canonical format** |
| Publishing | one Markdown file per post in Vercel Blob, `/studio` editor | replaced by the database below, Blob demoted to media storage |
| Auth | `STUDIO_PASSWORD` + httpOnly cookie, timing-safe compare | kept, extended into `/admin` |
| Rendering | `components/blog/BlockRenderer.tsx` | reused by public pages, preview and the admin reader |

Markdown stays the storage format for article bodies. It keeps the existing renderer, RSS,
SEO and seed posts working, and makes import/export trivial. The rich editor is a TipTap
WYSIWYG that serialises **to and from** that Markdown, so there is still exactly one
content format on disk.

## New layers

```
lib/server/db.ts        SQLite (node:sqlite, built in) + idempotent schema
lib/server/cms.ts       every query: posts, categories, tags, media, revisions, redirects
lib/server/analytics.ts event ingestion, dedupe, bot filter, aggregation
lib/server/admin-auth.ts existing cookie auth + rate limiting
lib/editor/md-to-doc.ts Markdown -> TipTap JSON   (pure, unit tested)
lib/editor/doc-to-md.ts TipTap JSON -> Markdown   (pure, unit tested)
```

## Data model

```
categories   id, slug, name, description, created_at
posts        id, slug, title, excerpt, content_md, category_id, status, featured,
             cover_url, cover_alt, seo_title, seo_description, og_image,
             published_at, scheduled_for, created_at, updated_at, read_minutes
tags         id, slug, name
post_tags    post_id, tag_id                      (composite PK)
media        id, url, pathname, alt, content_type, bytes, width, height, created_at
revisions    id, post_id, title, excerpt, content_md, created_at, note
redirects    from_slug (PK), to_slug, created_at
analytics    id, post_id, kind, path, visitor, session, referrer_host,
             device, browser, country, created_at
             UNIQUE (session, post_id, kind, action_day)   <- dedupe key
```

Indexes: `posts(status, published_at)`, `posts(slug)` unique, `post_tags(tag_id)`,
`analytics(post_id, created_at)`, `analytics(created_at)`, `revisions(post_id, created_at)`.

## Status lifecycle

| status | public URL | listing | sitemap/RSS | who |
| --- | --- | --- | --- | --- |
| `draft` | 404 | no | no | admin + preview token |
| `scheduled` | 404 until `scheduled_for` | no | no | admin + preview |
| `published` | 200 | yes | yes | everyone |
| `archived` | 200 with noindex | no | no | everyone, intentionally |

Scheduling is server-side and idempotent: `publishDue()` flips scheduled rows whose
`scheduled_for <= now`, called from a Vercel cron (`GET /api/cron/publish`, secret
protected) and lazily on every blog read, so a missed cron never leaves a stale draft.

## Analytics

Views are posted from the article page to `POST /api/track` (sendBeacon), but the server
does not trust the payload: it derives device/browser from the user agent, drops obvious
bots, ignores requests carrying the admin cookie, and dedupes with a unique
`(session, post, kind, day)` constraint. `visitor` is a salted SHA-256 of IP + UA, rotated
daily, so no raw IP is ever stored and the hash cannot be walked back to a person. Read
depth is posted as `read` events at 25/50/75/100%, which is how completion is estimated.
Raw events are never exposed through the API; only aggregates.

## Security

* every `/api/admin/*` route calls `requireAdmin()` first and answers 401 otherwise;
  the admin UI is convenience, not the boundary
* write routes reject cross-origin POSTs (CSRF), and are rate limited per IP
* article bodies are parsed to a typed `Block[]` and rendered as React elements: there is
  no `dangerouslySetInnerHTML` anywhere in the content path, so raw HTML and script tags
  in a post are inert
* uploads are validated on MIME type, extension and size, and served from Blob, never the DB

## Routes

Public: `/blog`, `/blog/[slug]`, `/blog/category/[slug]`, `/blog/tag/[slug]`,
`/blog/page/[n]`, `/feed.xml`, `/sitemap.xml`, `/robots.txt`, `/blog/rss-category/[slug]`.

Admin (`/admin`, cookie protected): dashboard, posts list, editor (`/admin/posts/[id]`),
new post, categories, media, analytics overview, per-post analytics, revisions.

API: `/api/admin/posts`, `/api/admin/posts/[id]` (+ `/publish`, `/duplicate`, `/revisions`),
`/api/admin/categories`, `/api/admin/media`, `/api/admin/analytics`, `/api/admin/preview`,
`/api/admin/login`, `/api/admin/logout`, `/api/track`, `/api/cron/publish`.

## Testing

Vitest with node environment for the pure and data layers (slug collisions, redirects,
md<->doc round trips, scheduling, analytics dedupe, RSS/sitemap output, auth), because the
sandbox has no browser. The build and typecheck gate everything else.
