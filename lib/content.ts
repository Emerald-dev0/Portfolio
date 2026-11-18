/**
 * ============================================================================
 * CONTENT, every word on the site, in one place.
 * ============================================================================
 * Links and socials live in `lib/config.ts`. This file is the copy: hero,
 * services, projects, about, process, content pillars, contact, footer.
 *
 * The project copy is written from each project's own README or live site, and
 * it says plainly where something is still in progress. Accuracy beats hype.
 *
 * No em dashes anywhere in this file. Commas, colons and full stops only.
 * ============================================================================
 */

/* --------------------------------------------------------------------------
 * HERO
 * ------------------------------------------------------------------------ */
export const hero = {
  greeting: "Hey, I'm Daniel.",
  headline: "I build software.",
  intro: [
    "I'm a software engineer at TestFlow, where I work on the backend behind computer-based testing: how questions are delivered, scored and turned into something students can actually learn from.",
    "Most of what I build is on the server side, APIs, background jobs and the data behind a product. I also ship the interfaces, because a backend nobody can use is only half a product.",
    "Calder, Intake and ORREI are what I'm building now. This is where they live.",
  ],
  ctaWork: "Explore my work",
  ctaContact: "Let's work together",
  badge: "Open to freelance projects and interesting collaborations.",
  location: "Ile-Ife, Nigeria",
  dragHint: "Drag me",
  scrollNote: "Scroll to explore",
  posters: [
    { name: "TestFlow", note: "Live", crayon: "leaf" as const, index: "03" },
    { name: "Calder", note: "In development", crayon: "grape" as const, index: "01" },
  ],
};

/* --------------------------------------------------------------------------
 * MARQUEE, the stack strip.
 * ------------------------------------------------------------------------ */
export const marquee = {
  items: [
    "TypeScript",
    "Next.js",
    "React",
    "Node.js",
    "PostgreSQL",
    "Prisma",
    "Tailwind CSS",
    "Python",
    "Kotlin",
    "MCP",
    "Neon",
    "Vercel",
    "Framer Motion",
    "Groq",
  ],
  note: "software engineer at TestFlow, building Calder",
  projects: [
    "Calder",
    "TestFlow",
    "ORREI",
    "Intake",
    "Blueprint",
    "Cypher",
  ],
};

/* --------------------------------------------------------------------------
 * WHAT I DO
 * ------------------------------------------------------------------------ */
export type Service = {
  icon: "code" | "database" | "wrench" | "sparkles";
  title: string;
  copy: string;
  chips: string[];
  color: "leaf" | "tang" | "grape" | "lagoon";
  rotate: number;
};

export const servicesHeading = {
  label: "What I do",
  heading: "Things I can help you build.",
  intro:
    "I work across different parts of software development, depending on what a project needs. Here are some areas I spend most of my time working in.",
  cta: "Have something in mind? Let's talk.",
};

export const services: Service[] = [
  {
    icon: "database",
    title: "Backend Development & APIs",
    copy: "I enjoy working on the parts of an application that users don't necessarily see but depend on every day. From authentication and database design to APIs, background jobs and third-party integrations, I focus on building systems that are reliable, maintainable and make sense as a project grows.",
    chips: ["Node.js", "TypeScript", "PostgreSQL", "Prisma", "Neon", "Queues"],
    color: "leaf",
    rotate: -1,
  },
  {
    icon: "code",
    title: "Full-stack Development",
    copy: "I build web applications from the ground up, working across the frontend and backend to make sure everything fits together. That means thinking about the data, application logic, user experience and all the little details that make a product enjoyable to use.",
    chips: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    color: "tang",
    rotate: 1,
  },
  {
    icon: "wrench",
    title: "Developer Tools & Automation",
    copy: "I like finding ways to make repetitive work less repetitive. I've worked on bots, integrations and automation tools that connect services and simplify everyday development workflows. I'm also exploring how AI can fit into the tools developers already use.",
    chips: ["Python", "Telegram Bot API", "MCP", "GitHub API", "CI/CD"],
    color: "grape",
    rotate: -1,
  },
  {
    icon: "sparkles",
    title: "Frontend & Interface Development",
    copy: "I care about how software feels to use, not just whether it works. I enjoy building clean interfaces, thoughtful interactions and responsive layouts. Things like loading states, transitions, accessibility and small usability details matter just as much as the main functionality.",
    chips: ["React", "Next.js", "Framer Motion", "Tailwind CSS", "Design Systems"],
    color: "lagoon",
    rotate: 1,
  },
];

/* --------------------------------------------------------------------------
 * SELECTED WORK
 * `repo` is the GitHub repo name used for live stats; `null` = no public repo.
 * ------------------------------------------------------------------------ */
export type Project = {
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  repo: string | null;
  liveUrl: string | null;
  role: string;
  color: "leaf" | "tang" | "grape" | "lagoon";
  status: string;
  note: string;
  /** Honest footnote: pending work, scope limits, or current state. */
  footnote?: string;
};

export const workHeading = {
  label: "Selected work",
  heading: "A few things I've been working on.",
  intro:
    "Each of these started with a problem I kept running into. What follows is what the thing is, the decision that shaped it, and where it stands today.",
  closing: "Real projects, with the engineering decisions written down.",
  count: "4 featured",
  archiveCount: "8 other projects and experiments",
};

export const featuredProjects: Project[] = [
  {
    name: "Calder",
    tagline: "Developer-first communication infrastructure.",
    description:
      "Every application needs to communicate with its users. I kept running into the same problem whenever I worked on a new product: setting up transactional email meant rebuilding much of the same infrastructure. That's what led me to start Calder. It's a transactional email API with its own queue, background workers, AWS SES integration and dashboard. The idea is to give developers a straightforward way to handle application email without having to manage all the underlying infrastructure themselves. I'm building it with the intention of expanding beyond email into other communication channels.",
    stack: ["TypeScript", "Next.js", "PostgreSQL", "AWS SES", "Turborepo"],
    repo: "Calder",
    liveUrl: "https://calder.click",
    role: "Solo developer: architecture, API, worker and dashboard.",
    color: "leaf",
    status: "In development",
    note: "communication infrastructure",
    footnote:
      "Core email delivery and worker infrastructure are implemented and manually tested. Billing and SDK distribution are still being worked on, so the HTTP quickstart is currently the recommended way to integrate.",
  },
  {
    name: "Intake",
    tagline: "Describe, review, create.",
    description:
      "Creating a form shouldn't mean spending the next twenty minutes clicking through settings and arranging questions. Intake lets you describe the form you want in plain language. It interprets your request, puts together a proposed structure and lets you review everything before creating the form in your Google Forms or Typeform account. I built it around a simple idea: people should spend more time thinking about what information they need and less time figuring out how to collect it.",
    stack: ["TypeScript", "Next.js", "Neon", "Better Auth", "Groq"],
    repo: "Intake",
    liveUrl: "https://intake.calder.click",
    role: "Solo developer: full-stack development, AI pipeline and provider integrations.",
    color: "tang",
    status: "Live",
    note: "describe, review, create",
    footnote:
      "AI operations are metered through a server-side credit ledger. Provider credentials remain protected, and unsupported integrations are communicated honestly rather than pretending they're available. Microsoft Forms creation isn't supported because Microsoft doesn't provide the required creation API.",
  },
  {
    name: "TestFlow",
    tagline: "Exam confidence for Nigerian university students.",
    description:
      "TestFlow is a computer-based testing and practice platform for Nigerian university students. Students practise questions across their courses, sit timed tests, read explanations and track progress against a study plan. I'm a software engineer on it, working on the exam engine: question delivery, scoring, study-plan progress and the services that hold the practice experience together. It's the work I'm proudest of, because a mistake in the code is a student's wasted study session.",
    stack: ["Next.js", "Node.js", "PostgreSQL", "Question Bank"],
    repo: null,
    liveUrl: "https://testflow.com.ng",
    role: "Software engineer, backend.",
    color: "leaf",
    status: "Live",
    note: "in students' hands",
    footnote:
      "Over 1,300 students and a question bank of more than 1,500 questions across 50+ courses. The product is public, while its source code is private.",
  },
  {
    name: "ORREI",
    tagline: "A property deserves better than a forwarded PDF.",
    description:
      "ORREI is being developed under ORVN Labs for real estate wholesalers and disposition teams in the United States. The idea is to take property information that's often scattered across documents, messages and spreadsheets and turn it into a structured, shareable presentation for potential buyers. One of the things I care about most with this project is data accuracy. Property information needs to retain its source, and AI-generated suggestions shouldn't automatically become published facts. People should be able to review and approve information before it goes live.",
    stack: ["TypeScript", "Next.js", "Neon", "PostgreSQL RLS", "Cloudflare R2"],
    repo: "Orvn-labs2",
    liveUrl: "https://orvnlabs.com",
    role: "Platform engineering, data modelling and publishing workflow.",
    color: "grape",
    status: "In development · Private beta",
    note: "ORVN Labs",
    footnote:
      "Currently in a private beta with approved users, with early activity concentrated in Florida. The product's public website uses illustrative screens and property information rather than live customer data.",
  },
];

export type ArchiveProject = {
  name: string;
  blurb: string;
  stack: string[];
  repo: string | null;
  liveUrl: string | null;
  color: "leaf" | "tang" | "grape" | "lagoon";
  status: string;
};

export const archiveHeading = {
  label: "And the rest of the wall",
  description: "Client work, experiments and ideas I've enjoyed bringing to life.",
  cta: "Every repository on GitHub",
  note: "Or tell me what to build next.",
};

export const moreProjects: ArchiveProject[] = [
  {
    name: "Cypher",
    blurb:
      "A project that lets you control a Windows PC from your phone over your local network. It includes screen streaming, clipboard synchronisation, file transfers and session pairing without relying on cloud servers.",
    stack: ["HTML", "Node.js", "Android"],
    repo: "Cypher",
    liveUrl: "https://cypher-one-omega.vercel.app",
    color: "tang",
    status: "Shipped",
  },
  {
    name: "Blueprint",
    blurb:
      "An exploration of what an AI-powered engineering workspace could look like. It combines codebase intelligence, architecture decision records and local-first indexing to help developers understand and work with their projects.",
    stack: ["TypeScript", "Tauri", "Rust"],
    repo: "Blueprint",
    liveUrl: null,
    color: "grape",
    status: "Alpha",
  },
  {
    name: "PhoneDock",
    blurb:
      "An ongoing project exploring better ways to connect phones and computers. The goal is to support things like screen sharing, file transfers, clipboard synchronisation and using a phone as a second display.",
    stack: ["Kotlin", "Android", "Cross-platform development"],
    repo: "PhoneDock",
    liveUrl: null,
    color: "grape",
    status: "In development",
  },
  {
    name: "Attack on Titan",
    blurb:
      "An experimental, cinematic web experience inspired by the visual world of Attack on Titan. I used it to explore animation, transitions, image-led layouts and unconventional navigation.",
    stack: ["TypeScript", "Framer Motion", "Art Direction"],
    repo: "AOT",
    liveUrl: "https://aot-verse.vercel.app",
    color: "tang",
    status: "Live",
  },
  {
    name: "LIFELINK",
    blurb:
      "An emergency health identity concept built around the idea of a digital twin. The goal is to make important health information accessible when someone cannot communicate for themselves.",
    stack: ["TypeScript", "Next.js"],
    repo: "lifelink-emergency-twin",
    liveUrl: "https://lifelink-rho.vercel.app",
    color: "lagoon",
    status: "Prototype",
  },
  {
    name: "Formak",
    blurb:
      "A small design and development experiment exploring claymorphism, soft shadows, rounded surfaces and playful interactions.",
    stack: ["TypeScript", "CSS"],
    repo: "Formak",
    liveUrl: "https://forma-kappa-orcin.vercel.app",
    color: "leaf",
    status: "Experiment",
  },
  {
    name: "Noma Form",
    blurb:
      "An exploration of how typography can influence the experience of filling out a form, using type as the main visual element rather than relying on decorative components.",
    stack: ["TypeScript", "Typography"],
    repo: "Noma-Form",
    liveUrl: "https://noma.pxxl.click",
    color: "tang",
    status: "Experiment",
  },
  {
    name: "This Portfolio",
    blurb:
      "The website you're currently exploring. I built it to bring together my projects, writing, GitHub activity and a little bit of personality.",
    stack: ["Next.js", "Tailwind CSS", "Framer Motion"],
    repo: "Portfolio",
    liveUrl: "https://oluwadaredaniel.me",
    color: "lagoon",
    status: "Live",
  },
];

/* --------------------------------------------------------------------------
 * GITHUB
 * ------------------------------------------------------------------------ */
export const githubSection = {
  label: "GitHub",
  heading: "A look at what I've been building.",
  body: [
    "I enjoy sharing my work publicly, whether it's a finished project, a small experiment or something I'm still trying to figure out.",
    "My GitHub is where most of that work lives. You'll find applications, experiments, utilities and the occasional idea that got a little out of hand.",
  ],
  statsLabel: "Synced from GitHub",
  cta: "Follow me on GitHub",
  note: "New projects and repositories appear here automatically.",
};

/* --------------------------------------------------------------------------
 * ABOUT
 * ------------------------------------------------------------------------ */
export const about = {
  label: "About",
  heading: "A little more about me.",
  body: [
    "I write software for a living and mostly on the server side. Databases, APIs, background workers, the parts that have to stay standing when a product gets busy.",
    "I got here by building things. An idea, a weekend, a problem I did not yet know how to solve. That loop never really stopped, and it is still how I learn fastest: ship something small, find out what I got wrong, fix it properly.",
    "I care about the reasoning behind a decision, not just whether the code runs. Why this schema, why this queue, why not the simpler option. That is the part of engineering I find worth writing down, so I do.",
    "Alongside the client work I build my own products. That is where the harder lessons are, because nobody hands you the requirements and nobody tells you when to stop.",
  ],
  currentlyLabel: "Currently",
  facts: [
    { label: "Software engineer", sub: "Backend, APIs and data" },
    { label: "Ile-Ife, Nigeria", sub: "UTC+1" },
    {
      label: "Building in public",
      sub: "Projects, decisions and things I got wrong.",
    },
    { label: "Open to freelance", sub: "Backend and full-stack work." },
    {
      label: "Usually working on something",
      sub: "even when I should probably be sleeping.",
    },
  ],
  signature: "a human, not a résumé",
  currently: {
    building: "Calder, communication infrastructure for developers.",
    learning: "System design and distributed systems.",
    reading: "Designing Data-Intensive Applications.",
    listening: "Whatever happens to be playing on Spotify.",
  },
};

/* --------------------------------------------------------------------------
 * SPOTIFY
 * ------------------------------------------------------------------------ */
export const spotifySection = {
  label: "Currently listening",
  heading: "What I'm listening to while building.",
  body: "A little soundtrack to the projects, late-night debugging sessions and everything in between.",
  note: "Pulled live from Spotify.",
};

/* --------------------------------------------------------------------------
 * PROCESS
 * ------------------------------------------------------------------------ */
export const processHeading = {
  label: "Process",
  heading: "From an idea to something people can use.",
  intro:
    "I like keeping projects straightforward. Good communication, clear expectations and regular progress make a huge difference.",
};

export const processSteps = [
  {
    title: "Understand the problem",
    copy: "Before jumping into code, I'd like to understand what you're trying to achieve, who you're building it for and what success actually looks like. Sometimes the best first step is figuring out what doesn't need to be built.",
    deliverable: "A clear scope and agreed direction.",
  },
  {
    title: "Work out the approach",
    copy: "Once we understand the problem, I'll work through the structure, technical decisions and user experience. If there's something particularly important or uncertain, I'd rather test it early than discover problems halfway through development.",
    deliverable: "A practical plan and an early look at the solution.",
  },
  {
    title: "Build and share progress",
    copy: "I prefer working in smaller, manageable steps rather than disappearing for weeks and returning with a surprise. You'll have something to review as development progresses, and we can address feedback along the way.",
    deliverable: "Regular updates and working features.",
  },
  {
    title: "Get it live",
    copy: "We'll get the application deployed, check that everything works as expected and take care of the final details. I'm also happy to help with fixes and improvements after launch.",
    deliverable: "A deployed product and a proper handover.",
  },
];

/* --------------------------------------------------------------------------
 * CONTENT
 * ------------------------------------------------------------------------ */
export const contentHeading = {
  label: "Content",
  heading: "I share what I'm learning along the way.",
  intro:
    "I enjoy documenting my experiences as a developer. Not just the finished projects, but the decisions, mistakes, tools and lessons that come with building software.",
  note: "Everything I write ends up on the blog first.",
  cta: "Read the blog",
  ctaSecondary: "See the code",
};

export const contentPillars = [
  {
    title: "Building in public",
    copy: "Updates from projects I'm working on, things I've shipped and the occasional bug that took far longer to fix than it should have.",
  },
  {
    title: "Learning as I go",
    copy: "Notes on concepts I'm working through, things I got wrong the first time and what I'd do differently now.",
  },
  {
    title: "Tools and technology",
    copy: "Honest thoughts on developer tools, frameworks and technologies I've tried. What worked, what didn't and what I'd recommend to other developers.",
  },
];

/* --------------------------------------------------------------------------
 * BLOG
 * ------------------------------------------------------------------------ */
export const blogHeading = {
  label: "Blog",
  heading: "Notes from things I've built and learned.",
  intro:
    "I write about projects, technical decisions, interesting problems and lessons from working through them.",
  note:
    "These aren't meant to be perfect technical papers. They're my way of documenting what I've learned, hopefully in a way that's useful to someone else.",
  cta: "Read all posts",
};

/* --------------------------------------------------------------------------
 * CONTACT
 * ------------------------------------------------------------------------ */
export const contact = {
  label: "Contact",
  heading: "Have something you'd like to build?",
  copy: [
    "Maybe you have an idea you've been thinking about, an existing product that needs some work or a technical problem you're trying to solve.",
    "I'm always open to interesting projects, freelance opportunities and conversations with people building useful things.",
    "Tell me a little about what you're working on. We can take it from there.",
  ],
  emailCta: "oluwadare458@gmail.com",
  successTitle: "Message sent.",
  successCopy:
    "Thanks for reaching out. I'll get back to you within 24 hours. If it's urgent, the email button is right there.",
  form: {
    name: "Name",
    email: "Email",
    message: "What are we building?",
    submit: "Send message",
    placeholders: {
      name: "Your name",
      email: "Your email address",
      message:
        "Tell me a little about your project, idea or the problem you're trying to solve...",
    },
  },
};

/* --------------------------------------------------------------------------
 * FOOTER
 * ------------------------------------------------------------------------ */
export const footer = {
  brand: "Emerald",
  tagline: "Still curious. Still building.",
  copyright: "© 2026 Daniel Oluwadare. All rights reserved.",
  builtNote: "Built with Next.js, React & Tailwind CSS. No templates were harmed.",
  location: "Ile-Ife, Nigeria",
  availability: "Usually around · Replies within a day.",
};

/* --------------------------------------------------------------------------
 * CRAYONS AND INK FIGURES
 * The illustration system: a fixed box of crayons, each with the ink colour it
 * fills and a matching text colour that stays legible on top of it.
 * ------------------------------------------------------------------------ */
export type Crayon =
  | "oxblood"
  | "teal"
  | "mustard"
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "pink";

export type CharacterId = "dash" | "pip" | "nova" | "biscuit" | "moss";
