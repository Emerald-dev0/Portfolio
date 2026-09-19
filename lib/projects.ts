/**
 * ============================================================================
 * PROJECTS — assemble the work section from two sources.
 * ============================================================================
 *   pinned  ← GitHub (live, or the committed snapshot): the order, the names,
 *             the numbers, the links. You control this by pinning repos.
 *   overlay ← lib/content.ts: the voice. What the thing actually is, said in
 *             a way a README never manages.
 *
 * A repo with no overlay still renders — it borrows its own description or the
 * first real paragraph of its README, and shows its real language breakdown as
 * the tech list. Nothing invented, nothing missing.
 *
 * `showcase.order` in content.ts decides whether curated non-pinned work is
 * appended ("pins-first"), dropped ("pins-only"), or the pins are ignored
 * entirely ("curated-only").
 * ============================================================================
 */

import {
  curatedProjects,
  githubOverlay,
  showcase,
  type Crayon,
  type CharacterId,
  type Project,
  type ProjectOverlay,
} from "./content";
import type { GithubSnapshot, LanguageShare, PinnedRepo } from "./github";
import { relativeTime } from "./format";

const CRAYONS: Crayon[] = [
  "teal",
  "blue",
  "purple",
  "green",
  "orange",
  "oxblood",
  "pink",
  "mustard",
];

const CAST: CharacterId[] = ["dash", "pip", "nova", "biscuit", "moss"];

/** Stable hash → deterministic pick, so a repo keeps its colour forever. */
function pick<T>(list: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 100003;
  return list[h % list.length];
}

/** "axiom-network" → "Axiom Network" for repos with no human-written name. */
function titleFromSlug(name: string): string {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w) => (w.length > 2 && w === w.toLowerCase() ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/**
 * The overlay is keyed by "owner/name" or just "name" — both work, and both are
 * matched case-insensitively, because GitHub hands back "Emerald-dev0/Cypher"
 * and nobody wants to lose their copy to a capital letter.
 */
const OVERLAY_INDEX: Record<string, ProjectOverlay> = Object.fromEntries(
  Object.entries(githubOverlay).map(([key, value]) => [key.toLowerCase(), value]),
);

export function overlayFor(slug: string): ProjectOverlay | undefined {
  const lower = slug.toLowerCase();
  const name = lower.split("/").pop() ?? lower;
  return OVERLAY_INDEX[lower] ?? OVERLAY_INDEX[name];
}

const TAG_COLORS: Record<string, Project["tagColor"]> = {
  LIVE: "marker",
  BUILDING: "accent",
  PINNED: "accent",
  PARKED: "ink",
  ARCHIVED: "ink",
};

/* ---------------------------------------------------------------------------
 * GitHub repo → Project
 * ------------------------------------------------------------------------ */
export function projectFromRepo(repo: PinnedRepo): Project {
  const overlay = overlayFor(repo.slug) ?? {};
  const primary = overlay.href ?? repo.homepage ?? repo.url;
  const isRepoLink = primary === repo.url;

  const languageTech = (repo.languages ?? []).slice(0, 4).map((l) => l.name);
  const techFromRepo = languageTech.length
    ? languageTech
    : repo.language && !repo.isEmpty
      ? [repo.language]
      : [];

  const tag = overlay.tag ?? (repo.isArchived ? "ARCHIVED" : repo.isEmpty ? "PARKED" : "PINNED");

  return {
    slug: repo.slug,
    name:
      overlay.name ??
      (repo.readmeTitle && repo.readmeTitle.length <= 28 && !repo.readmeTitle.includes(":")
        ? repo.readmeTitle
        : titleFromSlug(repo.name)),
    oneLiner:
      overlay.oneLiner ??
      repo.description ??
      repo.lede ??
      (repo.isEmpty
        ? "An empty repository holding a name."
        : "Another repo from the pile. Description pending."),
    blurb:
      overlay.blurb ??
      repo.description ??
      repo.lede ??
      "No description on GitHub yet. The code is the documentation, which is a polite way of saying there isn't any.",
    role: overlay.role,
    tech: overlay.tech ?? techFromRepo,
    href: primary,
    cta: overlay.cta ?? (isRepoLink ? "view code" : "visit site"),
    codeHref: isRepoLink ? undefined : repo.url,
    note: overlay.note,
    tag,
    tagColor: TAG_COLORS[tag] ?? "accent",
    crayon: overlay.crayon ?? pick(CRAYONS, repo.slug),
    character: overlay.character ?? pick(CAST, `${repo.slug}-cast`),
    flagship: overlay.flagship,
    metric: overlay.metric,
    credit: overlay.credit,
    source: "pinned",
    owner: repo.owner,
    live: {
      stars: repo.stars,
      forks: repo.forks,
      language: repo.language,
      languageColor: repo.languageColor,
      pushedAt: repo.pushedAt,
      pushedLabel: relativeTime(repo.pushedAt),
      commits: repo.commits,
      topics: repo.topics ?? [],
      isEmpty: repo.isEmpty,
      isArchived: repo.isArchived,
    },
  };
}

/* ---------------------------------------------------------------------------
 * The whole section
 * ------------------------------------------------------------------------ */
export type ShowcaseFilter = { id: string; label: string; count: number };

export type Showcase = {
  projects: Project[];
  pinned: Project[];
  curated: Project[];
  filters: ShowcaseFilter[];
  /** Real numbers for the receipts strip. */
  totals: {
    pinned: number;
    publicRepos: number;
    stars: number;
    followers: number;
    commits: number;
    languages: LanguageShare[];
    lastPush: string | null;
    lastPushLabel: string | null;
    generatedAt: string;
    /** "2 hours ago" — server-formatted, for the honesty label. */
    generatedLabel: string | null;
    live: boolean;
    sourceLabel: string;
    login: string;
  };
};

export function buildShowcase(snapshot: GithubSnapshot): Showcase {
  const overlayHidden = (slug: string) => overlayFor(slug)?.hidden === true;

  const pinned = (snapshot.pins ?? [])
    .filter((repo) => !overlayHidden(repo.slug))
    .map(projectFromRepo);

  const curated = curatedProjects.filter(
    (project) => !pinned.some((p) => p.name.toLowerCase() === project.name.toLowerCase()),
  );

  const projects =
    showcase.order === "curated-only"
      ? curated
      : showcase.order === "pins-only"
        ? pinned
        : [...pinned, ...curated];

  /* ---- filter chips: the technologies that actually repeat ------------- */
  const counts = new Map<string, number>();
  for (const project of projects) {
    for (const tech of project.tech) {
      counts.set(tech, (counts.get(tech) ?? 0) + 1);
    }
  }
  const filters: ShowcaseFilter[] = [
    { id: "all", label: showcase.allLabel, count: projects.length },
    ...[...counts.entries()]
      .filter(([, n]) => n >= 2)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 5)
      .map(([label, count]) => ({ id: label.toLowerCase(), label, count })),
  ];

  return {
    projects,
    pinned,
    curated,
    filters,
    totals: {
      pinned: pinned.length,
      publicRepos: snapshot.stats?.publicRepos ?? snapshot.user?.publicRepos ?? 0,
      stars: snapshot.stats?.stars ?? 0,
      followers: snapshot.user?.followers ?? 0,
      commits: snapshot.stats?.commitsPinned ?? 0,
      languages: snapshot.stats?.languages ?? [],
      lastPush: snapshot.stats?.pushed ?? null,
      lastPushLabel: relativeTime(snapshot.stats?.pushed),
      generatedAt: snapshot.generatedAt,
      generatedLabel: relativeTime(snapshot.generatedAt),
      live: snapshot.live,
      login: snapshot.user?.login ?? "Emerald-dev0",
      sourceLabel: snapshot.live
        ? "live from GitHub"
        : snapshot.source === "pinned"
          ? "synced from my pins"
          : "recently pushed repos",
    },
  };
}

/** Does this project match a filter chip id ("all" always matches)? */
export function matchesFilter(project: Project, filterId: string): boolean {
  if (filterId === "all") return true;
  return project.tech.some((t) => t.toLowerCase() === filterId);
}
