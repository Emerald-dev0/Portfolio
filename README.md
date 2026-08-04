<div align="center">

# The Engineer's Journal

### Daniel Oluwadare — *also known as Emerald*

A portfolio that behaves less like a landing page and more like a spiral-bound
engineering notebook someone left open on a desk. Aged newsprint, hand-drawn
ink, taped-down cards, folded corners, and little characters that never quite
sit still.

**Building AI developer infrastructure, production web applications, and tools developers actually enjoy using.**

`Next.js 15` · `React 19` · `TypeScript` · `Tailwind CSS v4` · `Framer Motion`

</div>

---

## The idea

Most developer portfolios are a template with a different coat of paint. This
one is built around a single, committed metaphor: **paper**.

Every element on the page maps to one of five physical materials — so as the
site grows, it stays coherent instead of turning into a pile of unrelated UI.

| Material | What it is |
| --- | --- |
| **Paper** | Warm newsprint base, faint ruled lines, a subtle grain overlay |
| **Ink** | Headlines, hand-drawn doodles, self-drawing scribble lines — always `#22201a`, never pure black |
| **Marker / highlighter** | Sticky-note tabs, highlight bars — aged mustard + oxblood, the only accent colours |
| **Tape / paperclip / dog-ear** | Small graphics that signal something is physically stuck (or folded) down |
| **Stamp / sticker** | Pill buttons and status tags with imperfect, rubber-stamp edges |

The visuals are loud and textured on purpose; the writing is the opposite —
quiet, dry, specific. Roughly 80% engineer, 20% personality.

## What makes it feel alive

The brief was simple: *it should never feel static.* So motion runs on several
layers that keep going long after the page loads.

- **Re-triggering reveals** — sections ink-bleed back in every time they
  re-enter the viewport, not just on first load.
- **Self-drawing scribbles** — SVG underlines and arrows draw themselves with
  `pathLength` as you scroll to them.
- **Rotating typewriter copy** — the hero continuously rewrites its "Building
  ___" line and cycles personality asides.
- **Ambient doodles** — stars, sparks and rockets drift on independent loops
  with light scroll parallax, so nothing ever moves in lockstep.
- **Chibi characters** — tiny ink figures bob, blink, wave, and one strolls
  back and forth along the footer tear.
- **A scroll-scrubbed timeline** — the journey "notebook spine" inks itself in
  as you read down the chapters.
- **Tactile hovers** — cards lift and settle, paper corners peel, the nav's ink
  highlight glides between links.

All of it respects `prefers-reduced-motion`.

## Tech stack

- **[Next.js 15](https://nextjs.org/)** (App Router) + **React 19**
- **TypeScript**
- **[Tailwind CSS v4](https://tailwindcss.com/)** (CSS-first `@theme` tokens)
- **[Framer Motion](https://www.framer.com/motion/)** for all motion
- **Google Fonts** loaded at runtime via `<link>` — Permanent Marker (marker),
  Caveat (pen), Inter (body), JetBrains Mono (labels)

## Project structure

```
app/
  layout.tsx        # fonts + metadata
  page.tsx          # the scroll order
  globals.css       # design tokens, material classes, keyframes
components/
  materials/        # Paper, Tape, StickyNote, TornEdge, Doodle …  (the 5 materials)
  motion/           # Reveal, Scribble, RotatingText, InkBleed, Parallax,
                    #   AmbientField, Chibi, ChibiWalker
  sections/         # Nav, Hero, About, FeaturedProjects, MoreProjects,
                    #   LogoMarquee, WhatIDo, Journey, Connect, Footer
  ui/               # ProjectFile, SectionHeader, Pill, SocialIcon
lib/
  content.ts        # ← single source of truth for ALL copy
```

## Getting started

```bash
# install
npm install

# dev server (http://localhost:3000)
npm run dev

# production build
npm run build && npm run start

# type-check / lint
npm run typecheck
npm run lint
```

## Editing the content

**Everything you'd want to change lives in [`lib/content.ts`](lib/content.ts)** —
copy, projects, stats, timeline chapters, and social links. No component edits
needed for day-to-day updates.

- **Projects** — add or reorder entries in the `projects` array. Six fill the
  grid cleanly (3 × 2 on desktop, 2-up on mobile). Flagships get an accent ring.
- **Social links** — real destinations live in `socials`.
- **Timeline** — edit the `chapters` array; each renders as a notebook page.
- **Logos** — the marquee renders monogram chips by default. Drop real SVGs in
  `public/logos/` to upgrade them later.

## Design system at a glance

Tokens are defined once in `globals.css` under `@theme`:

```css
--color-paper:  #ece3d0;   /* aged newsprint            */
--color-ink:    #22201a;   /* warm near-black           */
--color-accent: #a4432f;   /* faded oxblood / comic red */
--color-accent-2:#3c6067;  /* dusty teal                */
--color-marker: #d19a3f;   /* aged mustard highlighter  */
```

## Deployment

Optimised for **[Vercel](https://vercel.com/)** — import the repo and it builds
with zero config. No environment variables are required.

## Credits

- Design, engineering & copy — **Daniel Oluwadare** (Emerald)
- **TestFlow** built in collaboration with
  [Feranmi Oresajo](https://feranmi.appmd.dev) (frontend), whose site was the
  tonal reference for the writing voice.

---

<div align="center">

*Keep building. Keep learning. Keep shipping.*

</div>
