/**
 * ============================================================================
 * GITHUB — the living half of the portfolio.   [server only]
 * ============================================================================
 * The pinned repos on github.com/Emerald-dev0 drive the "Pinned" section of
 * this site. Pin something new and it appears here; unpin it and it leaves.
 *
 * How it stays honest, in four layers (each one catches the one above it):
 *
 *   1. LIVE      — one GraphQL call reads the profile + pinned items. Runs at
 *                  most once every REVALIDATE seconds (Next caches it), so the
 *                  page is a static file that quietly refreshes itself.
 *   2. SNAPSHOT  — `lib/github.snapshot.json`, committed to the repo. What the
 *                  live call doesn't replace it gets merged with, so the
 *                  checked-in copy is never lost.
 *   3. FALLBACK  — no token / no network / GitHub down → the snapshot alone.
 *   4. CURATED   — if even the snapshot is empty, `lib/content.ts` still has a
 *                  hand-written project list. The page must never break.
 *
 * Set GITHUB_TOKEN in the environment (Vercel → Settings → Environment
 * Variables) to turn layer 1 on. A read-only classic token, or a fine-grained
 * token with public read, is enough — pinned items are public data. Without it
 * the site runs on layer 2 and the scheduled Action keeps that fresh.
 *
 * Never import this from a client component.
 * ============================================================================
 */

import snapshotJson from "./github.snapshot.json";

/* --------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------ */

export type RepoLanguage = {
  name: string;
  percent: number;
  color: string | null;
};

export type PinnedRepo = {
  slug: string; // "owner/name" — the stable key everything else joins on
  owner: string;
  name: string;
  description: string | null;
  url: string;
  homepage: string | null;
  stars: number;
  forks: number;
  isArchived: boolean;
  isEmpty: boolean;
  pushedAt: string | null;
  updatedAt: string | null;
  language: string | null;
  languageColor: string | null;
  languages: RepoLanguage[];
  topics: string[];
  readmeTitle: string | null;
  lede: string | null;
  commits: number | null;
};

export type GithubUser = {
  login: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  followers: number;
  publicRepos: number;
};

export type LanguageShare = { name: string; repos: number; color: string | null };

export type GithubStats = {
  pinned: number;
  starsPinned: number;
  stars: number;
  commitsPinned: number;
  publicRepos: number;
  reposScanned: number;
  languages: LanguageShare[];
  pushed: string | null;
};

export type GithubSnapshot = {
  generatedAt: string;
  source: "pinned" | "recent-pushed";
  version: number;
  user: GithubUser;
  stats: GithubStats;
  pins: PinnedRepo[];
  /** true when this render came from the live API, false when from disk. */
  live: boolean;
  /** short reason the live read didn't happen — surfaced in dev only. */
  note?: string;
};

/* --------------------------------------------------------------------------
 * Config
 * ------------------------------------------------------------------------ */

/** How long a live GitHub read is cached before Next refreshes it. */
export const REVALIDATE_SECONDS = 60 * 60 * 3; // 3 hours

const LOGIN = process.env.GITHUB_LOGIN ?? "Emerald-dev0";
const TOKEN = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? "";
const MAX_PINS = 6;

/** The committed snapshot is the baseline every other layer merges into. */
const SNAPSHOT = snapshotJson as unknown as GithubSnapshot;

/* --------------------------------------------------------------------------
 * The GraphQL read — profile + pins + commit counts in one request.
 * ------------------------------------------------------------------------ */

const PINS_QUERY = /* GraphQL */ `
  query PortfolioPins($login: String!, $count: Int!) {
    user(login: $login) {
      login
      name
      avatarUrl
      bio
      location
      followers { totalCount }
      repositories(privacy: PUBLIC, ownerAffiliations: OWNER) { totalCount }
      pinnedItems(first: $count, types: REPOSITORY) {
        nodes {
          ... on Repository {
            nameWithOwner
            name
            description
            url
            homepageUrl
            stargazerCount
            forkCount
            isArchived
            isEmpty
            pushedAt
            updatedAt
            primaryLanguage { name color }
            repositoryTopics(first: 12) { nodes { topic { name } } }
            defaultBranchRef { target { ... on Commit { history { totalCount } } } }
          }
        }
      }
    }
  }
`;

type GqlNode = {
  nameWithOwner: string;
  name: string;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  stargazerCount: number;
  forkCount: number;
  isArchived: boolean;
  isEmpty: boolean;
  pushedAt: string | null;
  updatedAt: string | null;
  primaryLanguage: { name: string; color: string | null } | null;
  repositoryTopics: { nodes: { topic: { name: string } }[] } | null;
  defaultBranchRef: { target: { history?: { totalCount: number } } | null } | null;
};

type GqlUser = {
  login: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  followers: { totalCount: number };
  repositories: { totalCount: number };
  pinnedItems: { nodes: (GqlNode | null)[] };
};

function shapeLiveRepo(node: GqlNode, known?: PinnedRepo): PinnedRepo {
  const [owner, name] = node.nameWithOwner.split("/");
  return {
    slug: node.nameWithOwner,
    owner,
    name,
    description: node.description ?? known?.description ?? null,
    url: node.url,
    homepage: node.homepageUrl || known?.homepage || null,
    stars: node.stargazerCount ?? 0,
    forks: node.forkCount ?? 0,
    isArchived: Boolean(node.isArchived),
    isEmpty: Boolean(node.isEmpty),
    pushedAt: node.pushedAt ?? known?.pushedAt ?? null,
    updatedAt: node.updatedAt ?? known?.updatedAt ?? null,
    language: node.primaryLanguage?.name ?? known?.language ?? null,
    languageColor: node.primaryLanguage?.color ?? known?.languageColor ?? null,
    // GraphQL doesn't do language breakdowns or READMEs — keep what the
    // snapshot already knows, and let the sync script fill gaps over time.
    languages: known?.languages ?? [],
    topics: (node.repositoryTopics?.nodes ?? []).map((t) => t.topic.name),
    readmeTitle: known?.readmeTitle ?? null,
    lede: known?.lede ?? null,
    commits:
      node.defaultBranchRef?.target?.history?.totalCount ?? known?.commits ?? null,
  };
}

/** Attempt one live read. Returns null on ANY problem — never throws. */
async function readLive(): Promise<GithubSnapshot | null> {
  if (!TOKEN) return null;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "emerald-portfolio",
      },
      body: JSON.stringify({
        query: PINS_QUERY,
        variables: { login: LOGIN, count: MAX_PINS },
      }),
      // the whole reason the page is self-updating
      next: { revalidate: REVALIDATE_SECONDS, tags: ["github-pins"] },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as {
      data?: { user: GqlUser | null };
      errors?: unknown;
    };
    const user = json.data?.user;
    if (!user) return null;

    const known = new Map(
      SNAPSHOT.pins.map((p) => [p.slug.toLowerCase(), p] as const),
    );
    const pins = (user.pinnedItems.nodes ?? [])
      .filter((n): n is GqlNode => Boolean(n))
      .map((n) => shapeLiveRepo(n, known.get(n.nameWithOwner.toLowerCase())));

    return {
      ...SNAPSHOT,
      generatedAt: new Date().toISOString(),
      source: "pinned",
      live: true,
      user: {
        login: user.login,
        name: user.name,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        location: user.location,
        followers: user.followers?.totalCount ?? SNAPSHOT.user.followers,
        publicRepos: user.repositories?.totalCount ?? SNAPSHOT.user.publicRepos,
      },
      stats: {
        ...SNAPSHOT.stats,
        pinned: pins.length,
        starsPinned: pins.reduce((sum, p) => sum + p.stars, 0),
        commitsPinned: pins.reduce((sum, p) => sum + (p.commits ?? 0), 0),
        publicRepos: user.repositories?.totalCount ?? SNAPSHOT.stats.publicRepos,
        pushed:
          pins
            .map((p) => p.pushedAt)
            .filter((d): d is string => Boolean(d))
            .sort()
            .reverse()[0] ?? SNAPSHOT.stats.pushed,
      },
      pins,
    };
  } catch {
    return null;
  }
}

/* --------------------------------------------------------------------------
 * Public API
 * ------------------------------------------------------------------------ */

/**
 * The showcase snapshot: live pins when a token is configured, the committed
 * snapshot otherwise. Cached by React per-request and by Next across requests.
 */
export async function getGithubSnapshot(): Promise<GithubSnapshot> {
  const live = await readLive();
  if (live) return live;

  return {
    ...SNAPSHOT,
    live: false,
    note: TOKEN ? "github read failed — using last synced snapshot" : "no GITHUB_TOKEN — using last synced snapshot",
  };
}

/** Where the data actually came from, for the little honesty label in the UI. */
export function describeProvenance(snapshot: GithubSnapshot): string {
  if (snapshot.live && snapshot.source === "pinned") return "live from my pins";
  if (snapshot.source === "pinned") return "synced from my pins";
  return "recently pushed public repos";
}
