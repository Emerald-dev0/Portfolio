/**
 * ============================================================================
 * CONTENT — single source of truth for all copy.
 * ============================================================================
 * Voice: ~80% engineer, ~20% dry humor. Facts over adjectives. Short lines.
 * Rare, sharp jokes (never bitter). All project copy is grounded in the real
 * products. Contact details are real and confirmed.
 *
 * Two things live here that changed the job of this file:
 *
 *   `githubOverlay` — hand-written copy for repos that come from GitHub. The
 *   site reads your pinned repos, and this map is where you make them sound
 *   like you instead of like a repo description. Key it "owner/name" or just
 *   "name" (case-insensitive). Anything you don't write falls back to the
 *   repo's own description/README, then to an honest placeholder.
 *
 *   `curatedProjects` — projects that aren't pinned on GitHub. These render
 *   after the pins so the page never depends on a pin being set.
 * ============================================================================
 */

/* Flip to true once real contact details exist. */
export const CONTACT_CONFIRMED = true;

/* Dual identity — real name + online persona. */
export const identity = {
  realName: "Daniel Oluwadare",
  persona: "Emerald",
  personaHandle: "@emerald_dev",
  github: "Emerald-dev0",
};

/* ---------------------------------------------------------------------------
 * THE JOURNAL — the shape of the book itself.
 * Every section is a diary entry: a day, a page number, and a running head at
 * the top of the page. That's the whole trick of the thing the site is copying
 * — a week of entries, read in order.
 * ------------------------------------------------------------------------- */
export const journal = {
  /** printed at the top of every page, like a book's running head */
  runningHead: "The Engineer's Journal",
  owner: "Daniel Oluwadare",
  entries: {
    hero: { date: "MONDAY", page: 1 },
    about: { date: "MONDAY, LATER", page: 2 },
    work: { date: "TUESDAY", page: 3 },
    stack: { date: "WEDNESDAY", page: 4 },
    comic: { date: "WEDNESDAY, 11:47 PM", page: 5 },
    services: { date: "THURSDAY", page: 6 },
    journey: { date: "FRIDAY", page: 7 },
    connect: { date: "SATURDAY", page: 8 },
  } satisfies Record<string, { date: string; page: number }>,
};

/** The inside front cover: a label, a name, and a warning. */
export const insideCover = {
  label: "PROPERTY OF",
  name: "Daniel Oluwadare",
  sub: "Year 2026 · Emerald",
  warning: "If found, please return. Do not read the commit messages.",
  note: "This is not a résumé. It's a notebook that got out.",
  stamp: "KEEP OUT",
};

export type NavLink = { label: string; href: string };

export const nav = {
  wordmark: "DANIEL",
  links: [
    { label: "about", href: "#about" },
    { label: "work", href: "#work" },
    { label: "stack", href: "#stack" },
    { label: "journey", href: "#journey" },
    { label: "contact", href: "#contact" },
  ] satisfies NavLink[],
};

export const hero = {
  // Small eyebrow that cycles through identity facets.
  kicker: "SOFTWARE ENGINEER",
  kickerRotation: [
    "SOFTWARE ENGINEER",
    "AI INFRASTRUCTURE BUILDER",
    "FULL-STACK · NIGERIA",
    "ALSO KNOWN AS EMERALD",
  ],
  greeting: "Hi, I'm",
  realName: "Daniel Oluwadare.",
  personaLine: "— but online, I go by Emerald.",
  // The rotating verb-phrase that rewrites itself under the name.
  buildingPrefix: "Building",
  buildingRotation: [
    "AI developer infrastructure.",
    "production web applications.",
    "tools developers actually enjoy using.",
    "developer experiences.",
    "products from raw ideas.",
    "the future of AI engineering.",
  ],
  // Personality one-liners that cycle in the margin.
  personaRotation: [
    "Probably coding when I should be sleeping.",
    "Slightly obsessed with turning ideas into software.",
    "1,600+ commits later… still not done.",
    "Still building. Still learning.",
  ],
  tagline: "Full-stack by trade. Backend by circumstance.",
  /** Journal-header line, Wimpy-Kid style: a date and a mood. */
  journalLine: "Monday. Still building.",
  journalNote: "(and the build finally passed)",
  cta: "Let's Build Something",
  scrollNote: "scroll to explore",
  // Stats marked `live` are replaced with real numbers from GitHub at render
  // time — never hard-code a number you can read off the API instead.
  stats: [
    { value: "1,600+", label: "commits since Dec 2025" },
    { value: "3", label: "production systems shipped" },
    { value: "20+", label: "full-stack projects built" },
  ],
};

export const about = {
  tag: "ABOUT",
  noteId: "NOTE #001",
  heading: "Started with curiosity and a lot of broken builds.",
  body: [
    "Started teaching myself programming in 2024 while studying Computer Science. The degree gives me the theory; the late nights taught me why the build broke, then why the fix broke too.",
    "I naturally gravitate toward frontend experiences, but most projects eventually pull me into backend architecture and infrastructure — and I've learned to enjoy that.",
    "Recently, that curiosity has shifted toward AI developer infrastructure: building tools that help engineers and AI systems work together more effectively.",
  ],
  building: "Studying at Obafemi Awolowo University. Based in Osun State, Nigeria.",
  pullQuote: "Code is how I find out if the idea actually works.",
};

/* ---------------------------------------------------------------------------
 * COLOUR — a small crayon box for panels and character accessories.
 * The values live in globals.css (@theme); this is the type + list so copy and
 * components can never invent a colour that doesn't exist.
 * ------------------------------------------------------------------------- */
export type Crayon =
  | "oxblood"
  | "teal"
  | "mustard"
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "pink"
  | "ink";

/* ---------------------------------------------------------------------------
 * DRAWINGS — keys for the ink figures in components/motion/Chibi.tsx.
 * They are illustrations, not characters with backstories: they stand on the
 * corner of a panel, walk along the footer tear, and otherwise stay out of the
 * way. Nothing here is shown to the reader.
 * ------------------------------------------------------------------------- */
export type CharacterId = "dash" | "pip" | "nova" | "biscuit" | "moss";

/* ---------------------------------------------------------------------------
 * PROJECTS — the data contract everything else agrees on.
 * Built at render time by lib/projects.ts from (a) your GitHub pins and
 * (b) `curatedProjects` below.
 * ------------------------------------------------------------------------- */

/** The fields a human writes by hand, for a repo that comes from GitHub. */
export type ProjectOverlay = {
  /** Display name, if the repo slug isn't how you'd say it out loud. */
  name?: string;
  /** One line that hooks. Falls back to the repo's own description. */
  oneLiner?: string;
  /** 1–2 sentences. Falls back to the README's first real paragraph. */
  blurb?: string;
  role?: string;
  /** Handwritten corner annotation. */
  note?: string;
  tag?: string;
  /** Which crayon the comic panel is inked in. */
  crayon?: Crayon;
  tech?: string[];
  /** Override the primary link (defaults to homepage, then the repo). */
  href?: string;
  cta?: string;
  metric?: string;
  credit?: { linkText: string; href: string };
  /** Which illustration loiters on this panel. */
  character?: CharacterId;
  /** Large panel spanning two columns. */
  flagship?: boolean;
  /** Pin it on GitHub, but keep it off the site. */
  hidden?: boolean;
};

/** A finished project, assembled from overlay + live GitHub + defaults. */
export type Project = {
  slug: string;
  name: string;
  oneLiner: string;
  blurb: string;
  role?: string;
  tech: string[];
  /** primary destination */
  href: string;
  cta: string;
  /** the repo itself, when the primary link isn't the repo */
  codeHref?: string;
  note?: string;
  tag: string;
  tagColor: "accent" | "marker" | "ink";
  crayon: Crayon;
  character?: CharacterId;
  flagship?: boolean;
  metric?: string;
  credit?: { linkText: string; href: string };
  /** Where this row came from — pins are the live half of the page. */
  source: "pinned" | "curated";
  owner?: string;
  live?: {
    stars: number;
    forks: number;
    language: string | null;
    languageColor: string | null;
    pushedAt: string | null;
    /** "3 weeks ago" — formatted on the server so hydration never disagrees. */
    pushedLabel: string | null;
    commits: number | null;
    topics: string[];
    isEmpty: boolean;
    isArchived: boolean;
  };
};

/* ---------------------------------------------------------------------------
 * GITHUB OVERLAY — copy for the repos currently pinned on my profile.
 * Delete a key and the panel falls back to the repo's own words.
 * ------------------------------------------------------------------------- */
export const githubOverlay: Record<string, ProjectOverlay> = {
  /* ---- pinned, flagship ------------------------------------------------- */
  "GetContextly/contextly": {
    name: "Contextly",
    oneLiner: "A universal context layer for AI coding agents.",
    blurb:
      "Persistent project memory across Claude Code, Cursor, Copilot — every MCP-compatible assistant. It captures the decisions, history, and knowledge behind a codebase, so agents grasp not just what changed, but why.",
    role: "Solo — architecture, backend, MCP.",
    tag: "BUILDING",
    crayon: "teal",
    tech: ["TypeScript", "MCP", "Node.js", "Supabase", "Postgres"],
    note: "the flagship",
    character: "nova",
    flagship: true,
  },
  "Emerald-dev0/axiom-network": {
    name: "Axiom Network",
    oneLiner: "An economic layer for autonomous AI agents.",
    blurb:
      "Agents that discover, hire, and pay for each other's capabilities: an AXC ledger with atomic transactions and cryptographic receipts, an x402 payment engine, a capability registry, reputation scoring, and a conductor that plans a goal then hires the sub-agents to reach it.",
    role: "Solo — protocol, ledger, monorepo.",
    tag: "BUILDING",
    crayon: "blue",
    tech: ["TypeScript", "Node.js", "Express", "Prisma", "Neon Postgres", "React"],
    note: "agents hiring agents",
    character: "moss",
  },
  "Emerald-dev0/Cypher": {
    name: "Cypher",
    oneLiner: "Your PC, driven from your phone. No cloud, no accounts.",
    blurb:
      "A local-network remote control: live desktop streaming, screen recording at up to 60fps, two-way clipboard sync, chunked file transfer, power and process control. A Flutter Android app talking to a Python/Flask agent over WebSockets, found by mDNS, unlocked by a rotating six-digit pairing code.",
    role: "Solo — mobile app, PC agent, protocol.",
    tag: "LIVE",
    crayon: "green",
    tech: ["Flutter", "Dart", "Python", "Flask", "WebSocket", "OpenCV"],
    note: "no cloud, on purpose",
    character: "dash",
  },
  "Emerald-dev0/Commitgraph": {
    name: "Commitgraph",
    oneLiner: "Git forensics for the file everyone's afraid to touch.",
    blurb:
      "A CLI that mines repository history instead of guessing at it: file hotspots, knowledge distribution, and logical coupling — the hidden dependency between files that always change together. Markdown and JSON output, so it can run in CI beside the tests.",
    role: "Solo — CLI, analyzers, tests.",
    tag: "BUILDING",
    crayon: "purple",
    tech: ["TypeScript", "Node.js", "Commander", "Vitest"],
    note: "reads history, not vibes",
    character: "pip",
  },
  "Emerald-dev0/Axon": {
    name: "Axon",
    oneLiner: "A collaborative API workspace with the plumbing already in.",
    blurb:
      "Collections, environments, request history, API keys, shared workspaces, and team roles behind an Express/Supabase API — plus Stripe billing, an admin surface, and a VS Code extension speaking to the same endpoints.",
    role: "Solo — backend, Next.js client, extension.",
    tag: "BUILDING",
    crayon: "orange",
    tech: ["TypeScript", "Next.js", "Express", "Supabase", "Stripe", "VS Code API"],
    note: "early, honestly",
    character: "biscuit",
  },
  "Emerald-dev0/Noon-digital": {
    name: "Noon Digital",
    oneLiner: "A name I parked before it became anything.",
    blurb:
      "The repository is empty on purpose — no commits, just the spot held. It stays pinned because that's where it lives until it turns into the thing I keep sketching on paper.",
    role: "Eventually.",
    tag: "PARKED",
    crayon: "mustard",
    tech: [],
    note: "blank page (for now)",
    character: "pip",
  },
};

/* ---------------------------------------------------------------------------
 * CURATED PROJECTS — work worth showing that isn't pinned on GitHub.
 * These render after the pinned ones.
 * ------------------------------------------------------------------------- */
export const curatedProjects: Project[] = [
  {
    slug: "curated/blueprint",
    name: "Blueprint",
    oneLiner: "An AI engineering command center.",
    blurb:
      "An operating system for AI-assisted software engineering: Tree-sitter semantic analysis of a whole repository, architecture decision records linked to the code they explain, and AI orchestration across editors — in one local-first workspace.",
    role: "Solo — product & architecture.",
    tech: ["TypeScript", "Tauri", "Rust", "SQLite"],
    href: "https://github.com/Emerald-dev0/Blueprint",
    codeHref: "https://github.com/Emerald-dev0/Blueprint",
    cta: "view code",
    note: "local-first",
    tag: "BUILDING",
    tagColor: "accent",
    crayon: "oxblood",
    character: "nova",
    flagship: true,
    source: "curated",
  },
  {
    slug: "curated/orvn-labs",
    name: "ORVN Labs",
    oneLiner: "First-contact intelligence for real estate brokerages.",
    blurb:
      "Brokerage infrastructure that answers, qualifies, routes, books, and logs inbound leads before response-delay kills the deal. The PAS engine handles first contact in seconds.",
    role: "Lead frontend developer.",
    tech: ["Next.js", "TypeScript", "Node.js"],
    href: "https://orvnlabs.com",
    codeHref: undefined,
    cta: "visit site",
    note: "leads, before they go cold",
    tag: "LIVE",
    tagColor: "marker",
    crayon: "pink",
    character: "dash",
    source: "curated",
  },
  {
    slug: "curated/lifelink",
    name: "LifeLink",
    oneLiner: "An emergency health identity platform.",
    blurb:
      "When you can't speak for yourself, your Digital Twin does. Responders scan a grant code and get only the health data you authorized — instantly, time-limited, and logged. Patient-owned consent, always.",
    role: "Built for a hackathon.",
    tech: ["Next.js", "TypeScript", "Tailwind"],
    href: "https://lifelink-rho.vercel.app/",
    cta: "visit site",
    note: "hackathon build",
    tag: "LIVE",
    tagColor: "marker",
    crayon: "teal",
    character: "moss",
    source: "curated",
  },
  {
    slug: "curated/testflow",
    name: "TestFlow",
    oneLiner: "Timed CBT exam practice for OAU students.",
    blurb:
      "A mobile-first computer-based-testing platform: real exam timing, instant marking with corrections, and progress analytics across the first-year courses students struggle with most.",
    role: "Backend developer.",
    tech: ["Node.js", "MongoDB", "Express"],
    href: "http://testflow-phi.vercel.app/",
    cta: "visit site",
    note: "backend was mine",
    tag: "LIVE",
    tagColor: "ink",
    crayon: "blue",
    character: "biscuit",
    source: "curated",
  },
  {
    slug: "curated/mukhtar-salvage",
    name: "Mukhtar Salvage",
    oneLiner: "A YouTube packaging studio on the TKO Framework.",
    blurb:
      "Psychological thumbnail and title packaging that turns the videos creators already make into consistent wins. I built the platform — results showcase, system breakdown, and application funnel.",
    role: "Built the website / platform.",
    tech: ["Next.js", "Tailwind", "Framer Motion"],
    href: "https://www.mukhtarsalvage.com/",
    cta: "visit site",
    note: "packaging > luck",
    tag: "LIVE",
    tagColor: "ink",
    crayon: "mustard",
    character: "dash",
    source: "curated",
  },
];

/* ---------------------------------------------------------------------------
 * SHOWCASE — the section that renders both halves.
 * ------------------------------------------------------------------------- */
export const showcase = {
  tag: "WORK",
  sticky: "the stuff I'm proud of",
  heading: "Things I've actually shipped.",
  /**
   * How the grid is assembled:
   *   "pins-first"   pinned repos, then curated work (default)
   *   "pins-only"    strictly what's pinned on GitHub
   *   "curated-only" ignore GitHub entirely
   */
  order: "pins-first" as "pins-first" | "pins-only" | "curated-only",
  /** Live line under the header, filled with real numbers at render time. */
  livePrefix: "Read live from",
  liveSuffix: "— pin something new and it shows up here.",
  /** Shown when a repo insists on being empty. */
  emptyNote: "this page intentionally left blank",
  closing: "MORE ON GITHUB",
  archiveNote:
    "Sixty-plus public repositories covering client work, experiments, hackathons, and products. Not everything deserves the spotlight — but every one taught me something.",
  allLabel: "everything",
  filterHint: "filter the pile",
  statsHeading: "the receipts",
};

export const stack = {
  tag: "STACK",
  heading: "What I actually reach for.",
  note: "MERN most often. AI tooling in the workflow, not as a gimmick — Claude Code included.",
  groups: [
    {
      label: "Frontend",
      items: ["JavaScript", "TypeScript", "React", "Next.js", "Tailwind"],
    },
    { label: "Backend", items: ["Node.js", "Express", "SQL"] },
    { label: "Mobile", items: ["Flutter"] },
    {
      label: "Data & Infra",
      items: ["MongoDB", "Supabase", "Neon", "Vercel"],
      note: "most comfortable with MongoDB",
    },
  ],
};

/* ---------------------------------------------------------------------------
 * COMIC STRIP — one evening, in three panels. Captions are the joke; the
 * drawing carries the rest. Keep the copy short enough to fit a caption bar.
 * ------------------------------------------------------------------------- */
export const comicStrip = {
  tag: "COMIC",
  heading: "One evening, in three panels.",
  note: "based on a true story, unfortunately",
  panels: [
    {
      caption: "9:00 PM — one small feature. Two hours, tops.",
      mood: "typing" as const,
      time: "9:00",
    },
    {
      caption: "11:30 PM — the tests have opinions.",
      mood: "error" as const,
      time: "11:30",
    },
    {
      caption: "11:47 PM — it was a comma.",
      mood: "aha" as const,
      time: "11:47",
      bubble: "nine hours of my life.",
    },
  ],
  moral: "moral: read the error message.",
};

export const whatIDo = {
  tag: "SERVICES",
  heading: "What I do, when someone asks.",
  items: [
    { title: "Web Development", line: "Next.js and React, front to back." },
    { title: "Mobile Apps", line: "Flutter, when it needs to live on a phone." },
    {
      title: "Backend & APIs",
      line: "The part I keep saying I won't touch — and always end up owning.",
    },
    { title: "AI Infrastructure", line: "Context layers and tooling agents rely on." },
  ],
};

/* ---------------------------------------------------------------------------
 * JOURNEY — told as notebook chapters, not a flat year list. Each chapter is a
 * page in the engineer's journal: an era tab, a headline, a short narrative, a
 * handwritten annotation, and a checklist of milestones or production work.
 * ------------------------------------------------------------------------- */
export type DoodleName =
  | "star"
  | "spark"
  | "crown"
  | "rocket"
  | "brain"
  | "arrow-curve"
  | "lightbulb"
  | "coffee"
  | "bug"
  | "flag"
  | "cloud"
  | "wifi";

export type Chapter = {
  era: string;
  title: string;
  body: string;
  listLabel?: string;
  items?: string[];
  annotation?: string;
  commits?: string;
  doodle: DoodleName;
  crayon: Crayon;
  /** Which illustration appears in the margin of this chapter. */
  character?: CharacterId;
  flagship?: boolean;
};

const chapters: Chapter[] = [
  {
    era: "2024",
    title: "The beginning.",
    body: "Started learning programming and teaching myself software development. Spent this phase building fundamentals, experimenting, breaking things, debugging endlessly, and learning how software actually works through hands-on projects.",
    listLabel: "Milestones",
    items: [
      "Learned JavaScript and modern web development",
      "Built first React and Node.js applications",
      "Started contributing consistently on GitHub",
      "Fell for solving problems by building them",
    ],
    annotation: "every mistake became another lesson",
    doodle: "rocket",
    crayon: "green",
    character: "dash",
  },
  {
    era: "2025",
    title: "From learning to serious building.",
    body: "Moved beyond tutorials and started building more complex full-stack applications — improving my engineering workflow and developing a stronger understanding of building complete products.",
    listLabel: "Focused on",
    items: [
      "React and Next.js",
      "Node.js backend development",
      "Databases, APIs, deployment",
      "Software architecture",
    ],
    doodle: "star",
    crayon: "blue",
    character: "moss",
  },
  {
    era: "Early 2026",
    title: "Started shipping production software.",
    body: "Moved from experimental projects into real-world products used by actual people. This phase taught me what it means to build beyond code — thinking about users, reliability, deployment, maintenance, and real-world requirements.",
    listLabel: "Production systems shipped",
    items: ["ORVN Labs", "TestFlow", "Mukhtar Salvage"],
    annotation: "1,600+ commits since December",
    commits: "1,600+ commits",
    doodle: "crown",
    crayon: "orange",
    character: "nova",
  },
  {
    era: "2026 — now",
    title: "Building AI developer infrastructure.",
    body: "The focus shifted from only building applications to building tools that improve how developers build software. Contextly gives AI agents persistent memory of a codebase; Blueprint unifies project intelligence, architectural memory, and AI orchestration. The goal is no longer just building software — it's building the tools that shape how software gets built.",
    annotation: "the questions got bigger",
    doodle: "brain",
    crayon: "purple",
    character: "pip",
    flagship: true,
  },
];

export const journey = {
  tag: "JOURNEY",
  sticky: "the whole story, one page at a time",
  heading: "How I got here.",
  note: "four chapters, so far",
  chapters,
};

/* Testimonials: intentionally empty. Do NOT fabricate quotes. */
export const testimonials: { quote: string; author: string }[] = [];

/* Real social links. `icon` keys map to <SocialIcon>. */
export type Social = {
  label: string;
  handle: string;
  href: string;
  icon: "email" | "github" | "instagram" | "tiktok" | "x";
};

export const socials: Social[] = [
  { label: "Email", handle: "oluwadare458@gmail.com", href: "mailto:oluwadare458@gmail.com", icon: "email" },
  { label: "GitHub", handle: "Emerald-dev0", href: "https://github.com/Emerald-dev0", icon: "github" },
  { label: "Instagram", handle: "@emerald_dev1", href: "https://instagram.com/emerald_dev1", icon: "instagram" },
  { label: "TikTok", handle: "@emerald_dev1", href: "https://tiktok.com/@emerald_dev1", icon: "tiktok" },
  { label: "X", handle: "@dev_boy09", href: "https://x.com/dev_boy09", icon: "x" },
];

/* Logo marquee. If a matching /logos/<file> exists it's used; otherwise the
   monogram chip renders. Drop real SVGs in public/logos/ to upgrade. */
export const logos = {
  heading: "Tools I build with.",
  note: "the daily drivers",
  items: [
    "TypeScript", "JavaScript", "React", "Next.js", "Node.js", "Express",
    "MongoDB", "Postgres", "Supabase", "Tailwind", "Flutter", "Vercel",
    "Neon", "Rust", "MCP",
  ],
};

export const connect = {
  tag: "CONTACT",
  heading: "Have an idea worth building?",
  bubble:
    "I'm usually building something. If you've got an ambitious idea — or an impossible deadline — I'd love to hear about it.",
  emailHref: "mailto:oluwadare458@gmail.com",
  socials,
};

export const footer = {
  lines: ["Keep building.", "Keep learning.", "Keep shipping."],
  emphasis: "shipping",
  signoff: "Daniel Oluwadare — building as Emerald.",
  theEnd: "— the end —",
  copyright: "© 2026 Daniel Oluwadare. All rights reserved.",
  builtNote: "Built in Next.js, on a page that thinks it's paper.",
};

/* ---- 404 — a torn-out page ------------------------------------------- */
export const notFound = {
  sticky: "LOST PAGE",
  heading: "This page fell out of the notebook.",
  body: "Either the link is wrong, or I tore this page out because it was embarrassing. Most likely the first one.",
  cta: "back to the notebook",
  margin: "if found, please return",
};
