<div align="center">

# Daniel Oluwadare — Portfolio

**Software engineer. Building AI developer infrastructure and production web
applications.**

`Next.js 15` · `React 19` · `TypeScript` · `Tailwind CSS v4` · `Framer Motion` · `GitHub API`

</div>

---

## What this is

A personal portfolio that reads its own project data from GitHub, so the work
section can't go stale. It's styled as a paper notebook: aged newsprint, ruled
lines, ink borders, hand-drawn doodles, and a few small illustrations in the
margins.

The project grid is driven by the repositories pinned on
[github.com/Emerald-dev0](https://github.com/Emerald-dev0). Pin a repository and
it appears; unpin it and it leaves. Star counts, commit counts, languages and
last-push dates come from the API, not from hard-coded copy.

---

## The work section reads itself from GitHub

The projects grid is generated at render time from the pinned repositories on
the profile, in pin order. Each card shows the repository's real language, star
count, commit count and last-push date, and the page revalidates every 3 hours.

### Four layers, so it can't break

| # | Layer | When it's used |
| --- | --- | --- |
| 1 | **Live** — one GraphQL call reads the profile, the pins and the contribution calendar | when `GITHUB_TOKEN` is set |
| 2 | **Snapshot** — `lib/github.snapshot.json`, committed to the repo | no token, or the API is unavailable |
| 3 | **Merged** — live fields are merged over the snapshot, so nothing the snapshot knows is lost | always |
| 4 | **Curated** — `curatedProjects` in `lib/content.ts` | work that isn't pinned at all |

If GitHub is down, rate-limited, or the token is missing, the page renders from
the committed snapshot and labels the source honestly instead of showing an
empty grid. A repository with no description and no README still renders, with
real numbers and an honest placeholder rather than invented copy.

### Setup

Nothing is required. The committed snapshot works out of the box, and a
scheduled workflow keeps it current.

To enable the live read (no redeploy needed):

```bash
# .env.local
GITHUB_TOKEN=ghp_...        # read-only is enough, pins are public data
GITHUB_LOGIN=Emerald-dev0   # optional, this is the default
```

Add the same variables in **Vercel → Settings → Environment Variables**.

To refresh the committed snapshot manually:

```bash
GITHUB_TOKEN=$(gh auth token) npm run sync:github

# without a token it falls back to your most recently pushed public repos,
# and records that in the snapshot so the UI can say so
npm run sync:github
```

`.github/workflows/sync-github.yml` runs the same script twice a week and
commits the result, so even a deployment with no token stays up to date.

### What gets synced

- the pinned repositories, in pin order, with stars, forks, commits and language
- each repository's language breakdown and the first paragraph of its README
- the contribution calendar for the last year, with streaks and totals
- account totals: public repositories, stars, followers, language distribution

### Where the words come from

GitHub can tell you what a repository is called. It can't tell you why it
matters, so that copy lives in `githubOverlay` in
[`lib/content.ts`](lib/content.ts), keyed by `"owner/name"` or just `"name"`,
case-insensitively:

```ts
export const githubOverlay: Record<string, ProjectOverlay> = {
  "Emerald-dev0/Commitgraph": {
    name: "Commitgraph",
    oneLiner: "Git forensics for the file everyone's afraid to touch.",
    note: "reads history, not vibes",
    crayon: "purple",
    // stars, language and commits still come from GitHub
  },
};
```

Remove a key and that card falls back to the repository's own description, then
to its README. Nothing is ever invented.

`showcase.order` controls how the grid is assembled:

```ts
order: "pins-first"   // pinned repos followed by curated work (default)
//     "pins-only"    // strictly the pins
//     "curated-only" // ignore GitHub entirely
```

To keep a pinned repository off the site: `{ hidden: true }`.

---

## The GitHub section

Below the work grid, `components/sections/GithubActivity.tsx` shows the numbers
behind the claims:

- **Contribution graph** — a year of daily commits drawn as ink squares, with
  total contributions, active days, longest and current streaks, and the
  busiest day. Only active days are stored in the snapshot; blank squares are
  generated at render time, which keeps the committed file small.
- **Totals** — public repositories, stars, commits in pinned work, followers.
- **Languages** — the primary language of every public repository, as a
  proportional bar and a ranked list.

Every figure is read from the API. Nothing in this section is typed in by hand.

---

## Tech stack

- **[Next.js 15](https://nextjs.org/)** (App Router, ISR) with **React 19**
- **TypeScript** (strict)
- **[Tailwind CSS v4](https://tailwindcss.com/)** (CSS-first `@theme` tokens)
- **[Framer Motion](https://www.framer.com/motion/)** for motion
- **GitHub GraphQL and REST** for project and activity data
- **Google Fonts** via `<link>`: Permanent Marker, Caveat, Inter, JetBrains Mono

## Project structure

```
app/
  layout.tsx            # fonts and metadata
  page.tsx              # server component: reads GitHub, sets ISR
  not-found.tsx
  globals.css           # design tokens, materials, keyframes
components/
  materials/            # PaperBackground, Tape, StickyNote, Sticker, TornEdge,
                        #   Doodle, Handwritten, BookCover
  motion/               # Reveal, Scribble, RotatingText, InkBleed, Parallax,
                        #   AmbientField, Chibi, ChibiWalker
  sections/             # Nav, Hero, About, Projects, GithubActivity,
                        #   LogoMarquee, WhatIDo, Journey, Connect, Footer
  ui/                   # ProjectPanel, ContributionGraph, SectionHeader,
                        #   Pill, SocialIcon
lib/
  content.ts            # all copy, curated work, the overlay, the palette
  github.ts             # GitHub reads and the four fallback layers (server only)
  github.snapshot.json  # committed pins and contributions
  projects.ts           # merges pins, overlay and curated work
  format.ts             # relative dates, compact numbers
scripts/
  sync-github.mjs       # refreshes the snapshot
.github/workflows/
  sync-github.yml       # keeps the snapshot fresh twice a week
```

## Getting started

```bash
npm install

npm run dev            # http://localhost:3000
npm run build && npm start

npm run typecheck
npm run lint
npm run sync:github    # refresh lib/github.snapshot.json
```

## Editing the content

All copy lives in [`lib/content.ts`](lib/content.ts).

- **Projects** — pin them on GitHub; write the words in `githubOverlay`. Work
  that isn't on GitHub goes in `curatedProjects`.
- **The palette** — eight muted inks defined once in `globals.css` as
  `--color-crayon-*`. Each one sets `--crayon` and `--crayon-on`, so a single
  `.crayon-*` class re-inks a whole card, including its sticker and its
  illustration.
- **Social links** — real destinations live in `socials`.
- **Timeline** — edit the `chapters` array; each renders as a notebook page.

## Design notes

Tokens are defined once in `globals.css` under `@theme`:

```css
--color-paper: #ece3d0;   /* paper        */
--color-ink:   #22201a;   /* ink          */
--color-rule:  #c8b99a;   /* hairlines    */

--color-crayon-oxblood: #a4432f;
--color-crayon-teal:    #3c6067;
--color-crayon-mustard: #d19a3f;
--color-crayon-blue:    #2f5d8c;
--color-crayon-green:   #4a7346;
--color-crayon-purple:  #6a4a80;
--color-crayon-orange:  #b95f28;
--color-crayon-pink:    #a84f6b;
```

Composable materials: `.panel` (with `__spine`, `__shade`, `__num`), `.bubble`,
`.sticker`, `.sticky-tab`, `.ink-edge`, `.dogear`, `.paper-stack`, `.halftone`,
`.ink-rule`, `.live-dot`. Hand-drawn paper parts (`Checkbox`, `FillLine`,
`BinderHole`, `FoldedCorner`) are in `components/materials/Handwritten.tsx`.

Motion is progressive and respects `prefers-reduced-motion`; everything
interactive is reachable by keyboard with a visible focus ring.

## Deployment

Built for **[Vercel](https://vercel.com/)**. Import the repository and it builds
with no configuration. Add `GITHUB_TOKEN` (and optionally `GITHUB_LOGIN`) to
enable the live read; without them the site runs on the committed snapshot.

`GITHUB_TOKEN` is deliberately optional. Every path through `lib/github.ts`
falls back to real data.

## Credits

- Design, engineering and copy — **Daniel Oluwadare**
- **TestFlow** was built with [Feranmi Oresajo](https://feranmi.appmd.dev)
  (frontend).

---

<div align="center">

*Keep building. Keep learning. Keep shipping.*

</div>
