# The blog, writing, publishing and the numbers

The blog is a small publishing platform, not a page of Markdown files. Posts
live in a database, are written in a rich editor at `/admin`, and are served to
the public site from the same rows the dashboard edits. There is one copy of
every article and one renderer, so what you see while writing is what readers
get.

---

## 1. Setup

Everything below is optional for local development. With no environment at all
the blog runs on a SQLite file and writes uploads to `public/uploads`.

The database is a single SQLite file, read through `node:sqlite`, which ships
inside Node itself. That means there is no native module and no compile step, so
installing on a fresh host cannot fail for want of a compiler or a prebuilt
binary. There is no hosted service, no account and
no connection string: the file is created on first request and the schema
builds itself.

| Variable | What it does | Needed for |
| --- | --- | --- |
| `STUDIO_PASSWORD` | The one admin password | Signing in to `/admin` |
| `CMS_DB_FILE` | Absolute path to the SQLite file | Only to override the default |
| `ANALYTICS_SALT` | Salt for the daily visitor hash | Meaningful unique reader counts |
| `CRON_SECRET` | Shared secret the cron sends | Scheduled publishing |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob | Images in production |

Copy `.env.example` to `.env.local` and fill in what you have.

**Local development** uses `./.data/cms.db`, created on first request, and
`content/blog/*.md` is imported once so the blog starts with its five real
articles. Delete `.data/` to start from an empty database.

### Where the file lives, and why it matters

A SQLite file needs a disk that can be written to. That is the one real
deployment question, and the answer depends on where the site runs.

| Hosting | Database file | What survives a deploy |
| --- | --- | --- |
| Your machine | `./.data/cms.db` | Everything |
| Docker, VPS, Railway, Fly | `CMS_DB_FILE=/data/cms.db` on a mounted volume | Everything, indefinitely |
| Vercel | `/tmp/.data/cms.db`, chosen automatically | Everything until that instance goes cold, then it resets to the five seed articles |

**Vercel's filesystem is read only apart from `/tmp`**, and `/tmp` is per
instance and temporary. So on Vercel the whole site works, drafts and all, but
a post written in the dashboard can disappear when the function restarts. That
is fine for drafting and testing, and it is not fine for a blog you intend to
keep.

Two honest options, both simple:

1. **Keep the blog on a host with a disk.** A small VPS, Railway or Fly with a
   volume at `/data` and `CMS_DB_FILE=/data/cms.db` set. Nothing else changes:
   the same code, the same file, and posts persist.
2. **Stay on Vercel and commit your posts.** Write locally or on a host with a
   disk, then copy `content/blog/*.md` from your posts and commit. They become
   part of the seed set.

If the disk is read only and no writable location exists at all, the site still
serves every page: reads keep working and writes are skipped rather than thrown,
so a reader never sees a 500 because the database could not record a view.

---

## 2. Writing

Open `/admin`, sign in, then **New post**.

- The editor is TipTap over Markdown. Headings, bold and italic, underline,
  strikethrough, lists, quotes, tables, code blocks and images all edit the way
  you expect, and the stored format is still plain Markdown.
- Autosave runs about two seconds after you stop typing. The badge in the
  editor is honest: **Saving**, **Saved**, **Unsaved changes**, **Save failed**.
- `Ctrl` or `Cmd` + `S` saves immediately.
- Drag an image anywhere into the editor to upload and insert it.
- Leaving with unsaved changes asks first, and so does closing the tab.

The sidebar holds the things that decide where the post appears: category,
tags, the URL, whether it is featured, the SEO title and description, and the
publishing controls.

---

## 3. The four states

| State | Public URL | In the index | In RSS and sitemap | Search engines |
| --- | --- | --- | --- | --- |
| Draft | 404 | No | No | Not indexed |
| Scheduled | 404 until its time | No | No | Not indexed |
| Published | 200 | Yes | Yes | Indexed |
| Archived | 200 | No | No | `noindex` |

Publishing, unpublishing, archiving and deleting all confirm first, because all
of them are visible to the world.

**Scheduling** is handled on the server. Vercel calls `/api/cron/publish` every
ten minutes, and public reads also call the same function, so a scheduled post
goes live even if the cron is late. That makes the cron an optimisation, not a
single point of failure.

**Renaming a URL** leaves a permanent redirect from the old address, so
existing links, search results and shared URLs keep working.

---

## 4. Revisions

Every save snapshots the previous version. The editor lists the last six with a
**Restore** button, and the API keeps thirty per post.

Restoring is safe in both directions: it writes a revision of the current state
first, so a restore is itself undoable. If the article changed after the
revision you picked was taken, restore refuses and offers to force it, rather
than silently throwing work away.

---

## 5. Preview

**Open preview** renders your current draft with the same parser and the same
block components the public article uses, at desktop and mobile widths. It is
private: the preview route sits behind the admin cookie, and nothing in it is
ever written to the database or exposed publicly.

---

## 6. Media

Images go to Vercel Blob. The database stores a URL, an alt text, a caption and
the file size, never the file itself.

Uploads are validated on the server: PNG, JPEG, WebP, GIF or AVIF, up to 8 MB,
and the stored name is rewritten from the alt text plus a random suffix, so a
filename cannot carry a path or collide.

Without `BLOB_READ_WRITE_TOKEN`, uploads are written to `public/uploads`
instead, which works locally and will not survive a deploy.

---

## 7. How the numbers are counted

The analytics screen explains this too, but here is the reference.

| Term | Definition |
| --- | --- |
| **View** | One per reader, per article, per day. A reload or a return visit the same day does not add one. Enforced by a unique index, not by hope. |
| **Read** | Sent once when a reader passes three quarters of the article. |
| **Completion** | Reads divided by sessions. It measures reaching the end, not opening. |
| **Unique reader** | A SHA-256 hash of IP and user agent with a salt that rotates daily. Not reversible, and yesterday's hash is not today's. |
| **Session** | A random id in `sessionStorage`. One tab, one visit, no cookie. |
| **Excluded** | Bots, requests with no user agent, and any browser holding a valid admin session. |

Ranges are 24 hours, 7, 30 or 90 days, all time, or a custom pair of dates, and
all windows are UTC days.

---

## 8. Tests

```bash
npm run test        # one run
npm run test:watch  # while working
```

There is no headless browser available in this environment, so the suite covers
the layers that can be wrong in ways that matter: the CMS queries and the status
lifecycle, scheduling, revisions, slug redirects, the analytics rules,
the Markdown to TipTap conversion in both directions, and request validation
including its failure paths. Every test runs against an in-memory database, so
it never touches development data.

```bash
npm run typecheck
npm run lint
npm run build
```

---

## 9. Routes

| Route | What it is |
| --- | --- |
| `/blog` | Index with featured story, search, category rail, load more |
| `/blog/[slug]` | Article with table of contents, reading progress, share, prev and next, related |
| `/blog/category/[slug]` | One category |
| `/blog/tag/[slug]` | One tag |
| `/blog/page/[n]` | Paged index |
| `/blog/[slug]/opengraph-image` | Generated share card for an article |
| `/feed.xml` | RSS 2.0, published posts only |
| `/sitemap.xml` | Home, blog, categories, tags, published posts |
| `/admin` | Dashboard |
| `/admin/posts` | The library |
| `/admin/posts/[id]` | The editor |
| `/admin/categories` | Categories and the tags in use |
| `/admin/media` | Media library |
| `/admin/analytics` | Traffic, with per article detail |

`/studio` now forwards to `/admin`.
