/**
 * ============================================================================
 * CONTENT — single source of truth for all copy.
 * ============================================================================
 * Voice: ~80% engineer, ~20% dry humor. Facts over adjectives. Short lines.
 * Rare, sharp jokes (never bitter). All project copy is grounded in the real
 * products. Contact details are real and confirmed.
 * ============================================================================
 */

/* Flip to true once real contact details exist. */
export const CONTACT_CONFIRMED = true;

/* Dual identity — real name + online persona. */
export const identity = {
  realName: "Daniel Oluwadare",
  persona: "Emerald",
  personaHandle: "@emerald_dev",
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
  aside: "1,600+ commits since December 2025. Probably an unhealthy amount.",
  cta: "Let's Build Something",
  scrollNote: "scroll to explore",
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

export type Project = {
  name: string;
  tag: string; // BUILDING · LIVE
  tagColor: "accent" | "marker" | "ink";
  featured?: boolean; // flagship — gets a subtle accent treatment
  oneLiner: string;
  blurb: string; // kept ~2 sentences so the grid stays even
  role: string;
  tech: string[];
  href: string;
  cta: string;
  note: string; // handwritten corner annotation (Feranmi-style)
  metric?: string;
  credit?: { linkText: string; href: string };
};

const projects: Project[] = [
  {
    name: "Contextly",
    tag: "BUILDING",
    tagColor: "accent",
    featured: true,
    oneLiner: "A universal context layer for AI coding agents.",
    blurb:
      "Persistent project memory across Claude Code, Cursor, Copilot — every MCP-compatible assistant. It captures the decisions, history, and knowledge behind a codebase, so agents grasp not just what changed, but why.",
    role: "Solo — architecture, backend, MCP.",
    tech: ["TypeScript", "MCP", "Node.js", "Postgres"],
    href: "https://github.com/GetContextly/contextly",
    cta: "view code",
    note: "flagship",
  },
  {
    name: "Blueprint",
    tag: "BUILDING",
    tagColor: "accent",
    featured: true,
    oneLiner: "An AI engineering command center.",
    blurb:
      "An operating system for AI-assisted software engineering: project intelligence, architectural memory, AI orchestration, and developer workflows in one local-first workspace that sits above your editors and coordinates them.",
    role: "Solo — product & architecture.",
    tech: ["TypeScript", "Tauri", "Rust", "SQLite"],
    href: "https://github.com/Emerald-dev0/Blueprint",
    cta: "view code",
    note: "local-first",
  },
  {
    name: "ORVN Labs",
    tag: "LIVE",
    tagColor: "marker",
    oneLiner: "First-contact intelligence for real estate brokerages.",
    blurb:
      "Brokerage infrastructure that answers, qualifies, routes, books, and logs inbound leads before response-delay kills the deal. The PAS engine handles first contact in seconds.",
    role: "Lead frontend developer.",
    tech: ["Next.js", "TypeScript", "Node.js"],
    href: "https://orvnlabs.com",
    cta: "visit site",
    note: "leads, before they go cold",
  },
  {
    name: "LifeLink",
    tag: "LIVE",
    tagColor: "marker",
    oneLiner: "An emergency health identity platform.",
    blurb:
      "When you can't speak for yourself, your Digital Twin does. Responders scan a grant code and get only the health data you authorized — instantly, time-limited, and logged. Patient-owned consent, always.",
    role: "Built for a hackathon.",
    tech: ["Next.js", "TypeScript", "Tailwind"],
    href: "https://lifelink-rho.vercel.app/",
    cta: "visit site",
    note: "hackathon build",
  },
  {
    name: "TestFlow",
    tag: "LIVE",
    tagColor: "ink",
    oneLiner: "Timed CBT exam practice for OAU students.",
    blurb:
      "A mobile-first computer-based-testing platform: real exam timing, instant marking with corrections, and progress analytics across the first-year courses students struggle with most.",
    role: "Backend developer.",
    tech: ["Node.js", "MongoDB", "Express"],
    href: "http://testflow-phi.vercel.app/",
    cta: "visit site",
    metric: "7,957+ tests taken",
    credit: { linkText: "w/ Feranmi", href: "https://feranmi.appmd.dev" },
    note: "backend was mine",
  },
  {
    name: "Mukhtar Salvage",
    tag: "LIVE",
    tagColor: "ink",
    oneLiner: "A YouTube packaging studio on the TKO Framework.",
    blurb:
      "Psychological thumbnail and title packaging that turns the videos creators already make into consistent wins. I built the platform — results showcase, system breakdown, and application funnel.",
    role: "Built the website / platform.",
    tech: ["Next.js", "Tailwind", "Framer Motion"],
    href: "https://www.mukhtarsalvage.com/",
    cta: "visit site",
    note: "packaging > luck",
  },
];

export const featured = {
  tag: "WORK",
  sticky: "the stuff I'm proud of",
  heading: "Things I've actually shipped.",
  projects,
  closing: "MORE ON GITHUB",
};

export const moreProjects = {
  tag: "ARCHIVE",
  heading: "And twenty more in the pile.",
  note: "Twenty-plus repositories covering client work, experiments, hackathons, and products. Not every project deserves the spotlight — but every one taught me something.",
  cta: "BROWSE THE PILE →",
  href: "#",
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
  | "arrow-curve";

export type Chapter = {
  era: string;
  title: string;
  body: string;
  listLabel?: string;
  items?: string[];
  annotation?: string;
  commits?: string;
  doodle: DoodleName;
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
  },
  {
    era: "2026 — now",
    title: "Building AI developer infrastructure.",
    body: "The focus shifted from only building applications to building tools that improve how developers build software. Contextly gives AI agents persistent memory of a codebase; Blueprint unifies project intelligence, architectural memory, and AI orchestration. The goal is no longer just building software — it's building the tools that shape how software gets built.",
    annotation: "the questions got bigger",
    doodle: "brain",
    flagship: true,
  },
];

export const journey = {
  tag: "JOURNEY",
  sticky: "the whole story, one page at a time",
  heading: "How I got here.",
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
  copyright: "© 2026 Daniel Oluwadare. All rights reserved.",
  builtNote: "Built in Next.js, on a page that thinks it's paper.",
};
