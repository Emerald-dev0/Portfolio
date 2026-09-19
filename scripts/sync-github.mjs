#!/usr/bin/env node
/**
 * ============================================================================
 * sync-github — pull my pinned GitHub repos into a snapshot the site can read.
 * ============================================================================
 * The portfolio's "Pinned" section is driven by the repos pinned on my GitHub
 * profile. This script reads them and writes `lib/github.snapshot.json`, which
 * is committed to the repo and used in three ways:
 *
 *   1. as the checked-in fallback when the site is built without network or
 *      without a token,
 *   2. as the payload for the scheduled GitHub Action (zero-config auto-sync),
 *   3. as the thing the runtime fetch merges over when a token IS present.
 *
 * Priority of data sources:
 *   GITHUB_TOKEN + GraphQL  → real pinned items (the intended path)
 *   no token   + REST       → most recently pushed public repos (honest proxy,
 *                             flagged as `recent` in the output)
 *
 * Usage:
 *   node scripts/sync-github.mjs                 # pins (needs GITHUB_TOKEN)
 *   GITHUB_TOKEN=ghp_… npm run sync:github
 *   node scripts/sync-github.mjs --user=somebody --top=8 --out=lib/x.json
 *
 * Every network call is individually trapped: a repo that can't be read gets
 * nulls rather than killing the run, because a half-filled portfolio beats a
 * failed build.
 * ============================================================================
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/* --------------------------------------------------------------------------
 * args + env
 * ------------------------------------------------------------------------ */
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);

const USER = String(args.user ?? process.env.GITHUB_LOGIN ?? "Emerald-dev0");
const TOP = Number(args.top ?? 6);
const OUT = resolve(ROOT, String(args.out ?? "lib/github.snapshot.json"));
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";

const API = "https://api.github.com";
const GQL = "https://api.github.com/graphql";

/* --------------------------------------------------------------------------
 * GitHub's own language colours, so a live language dot always matches what
 * github.com shows. Unknown languages fall back to a stable hash hue.
 * ------------------------------------------------------------------------ */
const LANGUAGE_COLORS = {
  TypeScript: "#3178c6", JavaScript: "#f1e05a", HTML: "#e34c26", CSS: "#563d7c",
  SCSS: "#c6538c", Dart: "#00B4AB", Kotlin: "#A97BFF", Python: "#3572A5",
  "C++": "#f34b7d", C: "#555555", Shell: "#89e051", Go: "#00ADD8",
  Rust: "#dea584", Java: "#b07219", Swift: "#F05138", Ruby: "#701516",
  PHP: "#4F5D95", Vue: "#41b883", Svelte: "#ff3e00", Dockerfile: "#384d54",
  Makefile: "#427819", CMake: "#DA3434", "Inno Setup": "#26466D",
  "Objective-C": "#438eff", TeX: "#3D6117", PLpgSQL: "#336790", MDX: "#fcb32c",
  Astro: "#ff5a03", Lua: "#000080", "C#": "#178600",
  "Jupyter Notebook": "#DA5B0B",
};

/* --------------------------------------------------------------------------
 * helpers
 * ------------------------------------------------------------------------ */
function headers() {
  const h = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "emerald-portfolio-sync",
  };
  if (TOKEN) h.Authorization = `Bearer ${TOKEN}`;
  return h;
}

/** fetch JSON, or null — never throws, never kills the run. */
async function getJSON(url, opts = {}) {
  try {
    const res = await fetch(url, { ...opts, headers: { ...headers(), ...opts.headers } });
    if (!res.ok) {
      if (process.env.DEBUG) console.error(`  ! ${res.status} ${url}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    if (process.env.DEBUG) console.error(`  ! ${err.message} ${url}`);
    return null;
  }
}

/** fetch raw text (READMEs), or null — never throws. */
async function getText(url) {
  try {
    const res = await fetch(url, {
      headers: { ...headers(), Accept: "application/vnd.github.raw" },
    });
    return res.ok ? await res.text() : null;
  } catch (err) {
    if (process.env.DEBUG) console.error(`  ! ${err.message} ${url}`);
    return null;
  }
}

/** base64 → utf8, for the JSON flavour of the README endpoint. */
function decodeB64(b64) {
  try {
    return Buffer.from(b64, "base64").toString("utf8");
  } catch {
    return "";
  }
}

/**
 * Turn a wall of README markdown into a single honest sentence.
 * Badges, HTML, headings and code fences are stripped; the first real
 * paragraph wins. Returns null rather than inventing copy.
 */
export function ledeFromReadme(md) {
  if (!md) return null;
  let text = md.replace(/^---[\s\S]*?---/, ""); // front matter
  text = text.replace(/```[\s\S]*?```/g, ""); // code fences
  text = text.replace(/<\/?[a-zA-Z][^>]*>/g, ""); // html / img / br
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !/^#{1,6}\s/.test(l)) // headings
    .filter((l) => !/^[[!]/.test(l)) // badge walls
    .filter((l) => !/^[-*_]{3,}$/.test(l)); // rules

  for (const line of lines) {
    const clean = stripInline(line);
    if (clean.length >= 40) return truncate(clean, 208);
  }
  // anything is better than nothing, but only if it's a real sentence
  const first = lines.map(stripInline).find((l) => l.length > 0);
  return first ? truncate(first, 208) : null;
}

/** First markdown H1 in a README, if it isn't just the repo name. */
export function titleFromReadme(md) {
  const m = md?.match(/^\s*#\s+(.+)$/m);
  if (!m) return null;
  return stripInline(m[1]).replace(/[#*`]/g, "").trim() || null;
}

function stripInline(line) {
  return line
    .replace(/\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)/g, "") // linked badges
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links → text
    .replace(/[*`_>#]/g, "") // markdown noise
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(str, max) {
  if (str.length <= max) return str;
  const cut = str.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ")) || cut}…`;
}

function languageColor(name) {
  if (!name) return null;
  if (LANGUAGE_COLORS[name]) return LANGUAGE_COLORS[name];
  // stable fallback: hash the name into an aged-paper-friendly hue
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h} 38% 42%)`;
}

/** Sort languages by bytes desc, return [{name, percent, color}] (top 4). */
function shapeLanguages(map) {
  if (!map) return [];
  const total = Object.values(map).reduce((a, b) => a + b, 0);
  if (!total) return [];
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, bytes]) => ({
      name,
      percent: Math.round((bytes / total) * 1000) / 10,
      color: languageColor(name),
    }));
}

/* --------------------------------------------------------------------------
 * The GraphQL read — one request for the whole profile.
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
            diskUsage
            primaryLanguage { name color }
            repositoryTopics(first: 12) { nodes { topic { name } } }
            defaultBranchRef { target { ... on Commit { history { totalCount } } } }
          }
        }
      }
    }
  }
`;

async function fetchPinsGraphQL() {
  if (!TOKEN) return null;
  const res = await getJSON(GQL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: PINS_QUERY,
      variables: { login: USER, count: Math.min(Math.max(TOP, 1), 6) },
    }),
  });
  if (!res || res.errors || !res.data?.user) return null;
  return res.data.user;
}

/* --------------------------------------------------------------------------
 * REST fallback — no token, so no pinned items available (GitHub has no public
 * endpoint for them). Most-recently-pushed non-forks is the honest substitute,
 * and the snapshot records `source: "recent-pushed"` so the UI can say so.
 * ------------------------------------------------------------------------ */
async function fetchPinsREST() {
  const user = await getJSON(`${API}/users/${USER}`);
  const repos =
    (await getJSON(
      `${API}/users/${USER}/repos?per_page=100&sort=pushed&direction=desc&type=owner`,
    )) ?? [];

  const nodes = repos
    .filter((r) => !r.fork && !r.archived)
    .slice(0, TOP)
    .map((r) => ({
      nameWithOwner: r.full_name,
      name: r.name,
      description: r.description,
      url: r.html_url,
      homepageUrl: r.homepage || null,
      stargazerCount: r.stargazers_count ?? 0,
      forkCount: r.forks_count ?? 0,
      isArchived: Boolean(r.archived),
      isEmpty: (r.size ?? 0) === 0,
      pushedAt: r.pushed_at,
      updatedAt: r.updated_at,
      primaryLanguage: r.language
        ? { name: r.language, color: languageColor(r.language) }
        : null,
      repositoryTopics: { nodes: [] },
    }));

  return {
    login: USER,
    name: user?.name ?? null,
    avatarUrl: user?.avatar_url ?? null,
    bio: user?.bio ?? null,
    location: user?.location ?? null,
    followers: { totalCount: user?.followers ?? 0 },
    repositories: { totalCount: user?.public_repos ?? repos.length },
    pinnedItems: { nodes },
    __source: "recent-pushed",
  };
}

/* --------------------------------------------------------------------------
 * enrich — languages breakdown + a README lede, per repo, in parallel.
 * ------------------------------------------------------------------------ */
async function enrich(node) {
  const [slug, name] = node.nameWithOwner.split("/");
  const base = `${API}/repos/${slug}/${name}`;

  const [languages, readmeRaw] = await Promise.all([
    getJSON(`${base}/languages`),
    getText(`${base}/readme`),
  ]);

  const primary = node.primaryLanguage?.name ?? null;

  return {
    slug: node.nameWithOwner,
    owner: slug,
    name,
    displayName: null, // filled in by the curated overlay when it knows better
    description: node.description ?? null,
    url: node.url,
    homepage: node.homepageUrl || null,
    stars: node.stargazerCount ?? 0,
    forks: node.forkCount ?? 0,
    isArchived: Boolean(node.isArchived),
    isEmpty: Boolean(node.isEmpty),
    pushedAt: node.pushedAt ?? null,
    updatedAt: node.updatedAt ?? null,
    language: primary,
    languageColor: node.primaryLanguage?.color ?? languageColor(primary),
    languages: shapeLanguages(languages),
    topics: (node.repositoryTopics?.nodes ?? []).map((t) => t.topic.name),
    readmeTitle: titleFromReadme(readmeRaw),
    lede: ledeFromReadme(readmeRaw),
  };
}

/**
 * Commit count for a repo, from a single `/commits?per_page=1` call — GitHub
 * reports the last page in the Link header, which is the total. Cheap, and it
 * means an un-tokened sync still produces real numbers.
 */
async function commitCount(slug, branch) {
  try {
    const url = `${API}/repos/${slug}/commits?per_page=1${
      branch ? `&sha=${encodeURIComponent(branch)}` : ""
    }`;
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) return null;
    const link = res.headers.get("link");
    const last = link?.match(/[?&]page=(\d+)>;\s*rel="last"/);
    if (last) return Number(last[1]);
    const body = await res.json();
    return Array.isArray(body) ? body.length : null;
  } catch {
    return null;
  }
}

/**
 * Whole-account picture: every public repo, so the site can show real totals
 * instead of vibes. One request (paged up to 300 repos, which is plenty).
 */
async function accountStats() {
  const repos = [];
  for (let page = 1; page <= 3; page++) {
    const batch = await getJSON(
      `${API}/users/${USER}/repos?per_page=100&page=${page}&type=owner`,
    );
    if (!Array.isArray(batch) || batch.length === 0) break;
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  const mine = repos.filter((r) => !r.fork);
  const languages = {};
  for (const r of mine) {
    if (r.language) languages[r.language] = (languages[r.language] ?? 0) + 1;
  }
  return {
    scanned: repos.length,
    publicRepos: mine.length,
    stars: mine.reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0),
    languages: Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, repos]) => ({ name, repos, color: languageColor(name) })),
    totalPushes: mine.reduce((sum, r) => sum + (r.pushed_at ? 1 : 0), 0),
  };
}

/* --------------------------------------------------------------------------
 * main
 * ------------------------------------------------------------------------ */
async function main() {
  const mode = TOKEN ? "GraphQL pinned items" : "REST recent-pushed (no token)";
  console.log(`\n  github sync · @${USER} · ${mode}\n`);

  const user = (await fetchPinsGraphQL()) ?? (await fetchPinsREST());
  if (!user?.pinnedItems) {
    console.error("  ✗  Could not read from GitHub. Nothing written.\n");
    process.exitCode = 1;
    return;
  }

  const nodes = (user.pinnedItems.nodes ?? []).filter(Boolean);
  const account = await accountStats();

  const pins = [];
  for (const node of nodes) {
    const repo = await enrich(node);
    // GraphQL hands us the count; the REST path has to ask for it.
    repo.commits =
      node.defaultBranchRef?.target?.history?.totalCount ??
      (repo.isEmpty ? 0 : await commitCount(repo.slug));
    pins.push(repo);
    const bits = [
      (repo.language ?? "—").padEnd(11),
      `${repo.stars}★`.padEnd(4),
      `${repo.commits ?? "?"} commits`.padEnd(12),
      repo.isEmpty ? "empty" : "ok",
      repo.lede ? "readme" : "no readme",
    ];
    console.log(`  · ${repo.slug.padEnd(30)} ${bits.join("  ")}`);
  }

  const snapshot = {
    generatedAt: new Date().toISOString(),
    // "pinned" = real pins; "recent-pushed" = honest no-token proxy
    source: user.__source === "recent-pushed" ? "recent-pushed" : "pinned",
    version: 1,
    user: {
      login: user.login,
      name: user.name ?? null,
      avatarUrl: user.avatarUrl ?? null,
      bio: user.bio ?? null,
      location: user.location ?? null,
      followers: user.followers?.totalCount ?? 0,
      publicRepos: user.repositories?.totalCount ?? account.publicRepos,
    },
    stats: {
      pinned: pins.length,
      starsPinned: pins.reduce((sum, p) => sum + (p.stars ?? 0), 0),
      stars: account.stars,
      commitsPinned: pins.reduce((sum, p) => sum + (p.commits ?? 0), 0),
      // GitHub profiles count forks; the language bar shouldn't. Both numbers
      // are here so the site can pick the right one for the right sentence.
      publicRepos: user.repositories?.totalCount ?? account.scanned,
      ownRepos: account.publicRepos,
      reposScanned: account.scanned,
      languages: account.languages,
      pushed:
        pins.map((p) => p.pushedAt).filter(Boolean).sort().reverse()[0] ?? null,
    },
    pins,
  };

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  const rel = OUT.replace(`${ROOT}/`, "");
  console.log(`\n  ✓  ${pins.length} repos → ${rel}`);
  console.log(`     stars: ${snapshot.stats.stars} · commits(pins): ${snapshot.stats.commitsPinned} · latest push: ${snapshot.stats.pushed ?? "—"}\n`);
}

main();
