# The Studio, how to write and publish posts

The blog has two sources, merged at read time:

| Source | Where | Wins on conflict |
| --- | --- | --- |
| Markdown files in the repo | `content/blog/*.md` |, |
| Posts written in `/studio` | Vercel Blob, `posts/<slug>.md` | ✅ |

So the five seed posts keep working forever, and anything you publish from the
studio appears over the top of them within seconds, no redeploy needed.

---

## 1. Switch it on (one time, ~3 minutes)

In Vercel → your project → **Settings → Environment Variables**, add:

| Variable | What it is |
| --- | --- |
| `STUDIO_PASSWORD` | Any password you'll remember. This is the only login. |
| `BLOB_READ_WRITE_TOKEN` | Vercel → **Storage → Create → Blob** → connect to the project → copy the token. |

Redeploy. Then open **`/studio`** and sign in.

Until both are set, `/studio` shows the login with a note explaining exactly
what's missing, and the site quietly runs on the Markdown files only.

## 2. Writing

The editor is at `/studio` after login. You get:

- **Title / URL / summary / date / tags / cover / featured / draft** controls
- A **Markdown body** with a formatting toolbar (`Cmd/Ctrl + B` bold, `I`
  italic, `K` link, `E` inline code, `S` save draft)
- **Live preview** below the editor, rendered with the *same* components as the
  published page, so what you see is what ships
- **Autosave to your browser** every 600ms, so a refresh never eats a draft
- **Save draft** (only visible in `/studio`) and **Publish** (live in seconds)

### Markdown it understands

```md
## A heading            → becomes a table-of-contents entry
### A subheading

Normal paragraph with **bold**, *italic*, `code` and [links](https://x.com).

- a bullet list
1. or a numbered one

> a pull quote

> [!TIP]
> A tinted callout. Also `[!NOTE]` and `[!WARNING]`.

```ts
const code = "highlighted";
```

| Any | Table |
| --- | ----- |
| works | fine  |

![alt text](/projects/calder.webp)
_A caption, in italics, on the next line._
```

## 3. What happens on publish

1. The post is written to `posts/<slug>.md` in Blob storage.
2. `/`, `/blog`, the post itself, `/feed.xml`, and `/sitemap.xml` are
   revalidated, so it's live immediately, not on the next deploy.
3. It appears in the RSS feed and the sitemap without you doing anything.

## 4. Adding a post without the studio

Drop a file in `content/blog/`:

```md
---
title: "What I learned shipping X"
excerpt: "One line for cards and search."
date: "2026-11-20"
tags: ["Building", "APIs"]
featured: false
draft: false
cover: "/projects/calder.webp"
---

Body in Markdown…
```

Reading time, the table of contents, previous/next links, tags and the feed all
derive from the file, nothing else to keep in sync.
