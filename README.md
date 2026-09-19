<div align="center">

# The Engineer's Journal

### Daniel Oluwadare — *also known as Emerald*

A portfolio that behaves less like a landing page and more like a spiral-bound
engineering notebook someone left open on a desk. Aged newsprint, hand-drawn
ink, comic panels, a small cast of characters who never quite sit still — and a
work section that reads itself off GitHub.

**Building AI developer infrastructure, production web applications, and tools developers actually enjoy using.**

`Next.js 15` · `React 19` · `TypeScript` · `Tailwind CSS v4` · `Framer Motion` · `GitHub GraphQL`

</div>

---

## The idea

Most developer portfolios are a template with a different coat of paint. This
one is built around a single, committed metaphor: **paper**.

Every element maps to one of five physical materials — so as the site grows it
stays coherent instead of turning into a pile of unrelated UI.

| Material | What it is |
| --- | --- |
| **Paper** | Warm newsprint base, faint ruled lines, a subtle grain overlay |
| **Ink** | Headlines, hand-drawn doodles, self-drawing scribble lines — always `#22201a`, never pure black |
| **Crayon** | A small box of muted colours for comic panels, stickers and characters |
| **Tape / paperclip / dog-ear** | Small graphics that signal something is physically stuck (or folded) down |
| **Comic panel / sticker / speech bubble** | How work and characters are framed and quoted |

The visuals are loud and textured on purpose; the writing is the opposite —
quiet, dry, specific. Roughly 80% engineer, 20% personality.

---

## The work section reads itself off GitHub

**This is the part that changed.** The projects section is no longer a
hand-maintained list. It is driven by the repos pinned on
[github.com/Emerald-dev0](https://github.com/Emerald-dev0).

**Pin a repo → it appears here, in pin order, with its real numbers. Unpin it →
it leaves.** No code change, no redeploy, no copy-paste. The panel shows the
repo's own primary language, star count, commit count and last-push date, and
the whole page re-renders itself every three hours.

### Four layers, so it can never break

| # | Layer | When it's used |
| --- | --- | --- |
| 1 | **Live** — one GraphQL call reads the profile + pinned items | whenever `GITHUB_TOKEN` is set |
| 2 | **Snapshot** — `lib/github.snapshot.json`, committed | no token, or the API is unhappy |
| 3 | **Merged** — live fields (stars, pushes, topics, commits) are merged *over* the snapshot, so nothing the snapshot knows (language breakdowns, README ledes) is ever lost | always |
| 4 | **Curated** — `curatedProjects` in `lib/content.ts` | for work that isn't pinned at all |

If GitHub is down, rate-limited, or the token is wrong, the page renders from
the committed snapshot and labels itself honestly instead of showing an empty
grid or a spinner. A repo with no description and no README still renders —
with an honest placeholder, never invented copy.

### Setting it up

Nothing is required — the committed snapshot works out of the box and the
scheduled Action keeps it current.

To turn layer 1 on (fully live, no redeploy):

```bash
# .env.local
GITHUB_TOKEN=ghp_…        # read-only is enough; pins are public data
GITHUB_LOGIN=Emerald-dev0 # optional, this is the default
```

Add the same two variables in **Vercel → Settings → Environment Variables** and
the site will read your pins at render time, freshly cached every 3 hours.

To refresh the committed snapshot by hand:

```bash
GITHUB_TOKEN=$(gh auth token) npm run sync:github
# no token? it falls back to your most recently pushed public repos and says so
npm run sync:github
```

`.github/workflows/sync-github.yml` runs the same script twice a week, commits
the new snapshot, and lets Vercel redeploy — so even a completely token-less
deployment stays up to date.

### Where the words come from

GitHub can tell you *what* a repo is called. It cannot tell you *why it
matters*. So copy lives in `githubOverlay` in [`lib/content.ts`](lib/content.ts),
keyed by `"owner/name"` or just `"name"` (case-insensitive):

```ts
export const githubOverlay: Record<string, ProjectOverlay> = {
  "Emerald-dev0/Commitgraph": {
    name: "Commitgraph",
    oneLiner: "Git forensics for the file everyone's afraid to touch.",
    note: "reads history, not vibes",
    crayon: "purple",
    character: "pip",
    // everything else — stars, language, commits — comes from GitHub
  },
};
```

Delete a key and that panel falls back to the repo's own description, then to
the first real paragraph of its README. Add one and the panel sounds like you.

`showcase.order` decides how the grid is assembled:

```ts
order: "pins-first"   // pinned repos, then curated work  ← default
//     "pins-only"    // strictly what's pinned
//     "curated-only" // ignore GitHub entirely
```

### Hiding a pin from the site

```ts
"github-owner/repo": { hidden: true },   // pinned on GitHub, not on the page
```

---

## The cast

Five characters live in the margins, drawn as SVG, animated with CSS, coloured
by the crayon box. They have names and opinions in `lib/content.ts → cast`, and
they show up where they're useful: peeking over the top of the work section,
standing on the corner of each comic panel, loitering beside the receipts,
pacing along the footer tear.

| | Who | Job |
| --- | --- | --- |
| **Dash** | the one who ships | says "one more commit" at 2am, means it |
| **Pip** | headphones on | plays music, runs the tests, stares at the wall |
| **Nova** | reads the actual error message | wild concept, works every time |
| **Biscuit** | the dog on the keyboard | still counts as pair programming |
| **Moss** | asks why | has never accepted "because it works" |

Adding a pose adds it to every character at once (poses are descriptor data,
not hand-written JSX per pose) and `accessory` stacks a hat, headphones,
glasses or a ponytail onto any of them.

---

## What makes it feel alive

The brief was simple: *it should never feel static.* Motion runs on several
layers that keep going long after the page loads.

- **Live numbers** — the language bar, star counts, commit counts and "updated
  3 weeks ago" labels are read from the GitHub API, not typed by hand.
- **Re-triggering reveals** — sections ink-bleed back in every time they
  re-enter the viewport, not just on first load.
- **Self-drawing scribbles** — SVG underlines and arrows draw themselves with
  `pathLength` as you scroll to them.
- **Rotating typewriter copy** — the hero continuously rewrites its "Building
  ___" line and cycles personality asides.
- **Ambient doodles** — stars, sparks, lightbulbs and coffee cups drift on
  independent loops with light scroll parallax, so nothing moves in lockstep.
- **Comic-panel filtering** — the work grid filters by technology with layout
  animation; panels reflow instead of jumping.
- **A scroll-scrubbed timeline** — the journey "notebook spine" inks itself in
  as you read down the chapters.
- **Tactile hovers** — panels lift, characters hop, paper corners peel, the
  nav's ink highlight glides between links.

All of it respects `prefers-reduced-motion`, and everything interactive is
reachable by keyboard with a visible focus ring.

## Tech stack

- **[Next.js 15](https://nextjs.org/)** (App Router, ISR) + **React 19**
- **TypeScript** (strict)
- **[Tailwind CSS v4](https://tailwindcss.com/)** (CSS-first `@theme` tokens)
- **[Framer Motion](https://www.framer.com/motion/)** for all motion
- **GitHub GraphQL / REST** for the pinned work and the receipts
- **Google Fonts** loaded at runtime via `<link>` — Permanent Marker (marker),
  Caveat (pen), Inter (body), JetBrains Mono (labels)

## Project structure

```
app/
  layout.tsx            # fonts + metadata
  page.tsx              # server component: reads GitHub, sets ISR, scroll order
  not-found.tsx         # a page that fell out of the notebook
  globals.css           # design tokens, materials, crayons, keyframes
components/
  materials/            # PaperBackground, Tape, StickyNote, Sticker, TornEdge, Doodle
  motion/               # Reveal, Scribble, RotatingText, InkBleed, Parallax,
                        #   AmbientField, Chibi (the whole cast), ChibiWalker
  sections/             # Nav, Hero, About, Projects, Receipts, LogoMarquee,
                        #   WhatIDo, Journey, Connect, Footer
  ui/                   # ProjectPanel, SectionHeader, Pill, SocialIcon
lib/
  content.ts            # ← all copy, the cast, curated work, the overlay
  github.ts             # GitHub read + the four layers         [server only]
  github.snapshot.json  # committed pins — what the site falls back to
  projects.ts           # merges pins + overlay + curated work
  format.ts             # relative time / compact numbers
scripts/
  sync-github.mjs       # refreshes the snapshot (npm run sync:github)
.github/workflows/
  sync-github.yml       # keeps the snapshot fresh, twice a week
```

## Getting started

```bash
npm install

npm run dev            # http://localhost:3000
npm run build && npm start

npm run typecheck      # tsc --noEmit
npm run lint
npm run sync:github    # refresh lib/github.snapshot.json
```

## Editing the content

**Everything you'd want to change lives in [`lib/content.ts`](lib/content.ts)** —
copy, projects, the cast, the overlay, stats, timeline chapters and social
links. No component edits needed for day-to-day updates.

- **Projects** — pin them on GitHub; write the words in `githubOverlay`. Work
  that isn't on GitHub goes in `curatedProjects`.
- **Cast** — `cast` holds the names, roles and lines; the drawings live in
  `components/motion/Chibi.tsx`.
- **Social links** — real destinations live in `socials`.
- **Timeline** — edit the `chapters` array; each renders as a notebook page
  with its own crayon and cast member.
- **Logos** — the marquee renders monogram chips by default. Drop real SVGs in
  `public/logos/` to upgrade them later.

## Design system at a glance

Tokens are defined once in `globals.css` under `@theme`:

```css
/* paper + ink */
--color-paper:  #ece3d0;   /* aged newsprint            */
--color-ink:    #22201a;   /* warm near-black           */

/* the crayon box — every coloured element reads --crayon / --crayon-on,
   set by a .crayon-* class, so one class re-inks a whole panel */
--color-crayon-oxblood: #a4432f;
--color-crayon-teal:    #3c6067;
--color-crayon-mustard: #d19a3f;
--color-crayon-blue:    #2f5d8c;
--color-crayon-green:   #4a7346;
--color-crayon-purple:  #6a4a80;
--color-crayon-orange:  #b95f28;
--color-crayon-pink:    #a84f6b;
```

Materials you can compose with: `.panel` (+ `__spine`, `__shade`, `__num`),
`.bubble`, `.sticker`, `.sticky-tab`, `.ink-edge`, `.dogear`, `.paper-stack`,
`.halftone`, `.crosshatch`, `.ink-rule`, `.page-num`, `.margin-note`,
`.live-dot`.

## Deployment

Optimised for **[Vercel](https://vercel.com/)** — import the repo and it builds
with zero config. Add `GITHUB_TOKEN` (and optionally `GITHUB_LOGIN`) to make the
work section fully live; without them it runs on the committed snapshot and the
scheduled Action keeps that fresh.

> The one thing that will break it: making `GITHUB_TOKEN` **required**. It isn't,
> deliberately. Every path through `lib/github.ts` falls back to something real.

## Credits

- Design, engineering & copy — **Daniel Oluwadare** (Emerald)
- **TestFlow** built in collaboration with
  [Feranmi Oresajo](https://feranmi.appmd.dev) (frontend), whose site was the
  tonal reference for the writing voice.

---

<div align="center">

*Keep building. Keep learning. Keep shipping.*

</div>
