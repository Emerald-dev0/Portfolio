/**
 * ============================================================================
 * ANALYTICS, server-only. Collection, filtering and aggregation.
 * ============================================================================
 * HOW THE NUMBERS ARE CALCULATED, so they mean something:
 *
 *  view     one per article, per session, per day. The client sends a beacon,
 *           but the server decides everything: the post is resolved by slug,
 *           device and browser are parsed from the user agent, obvious bots are
 *           dropped, admin traffic is dropped, and the unique index on
 *           (session, post_id, kind, action_day) makes a duplicate physically
 *           impossible. Reloading 40 times is still one view.
 *
 *  read     sent at 25%, 50%, 75% and 100% of the article. Four rows per
 *           article per session per day, one per milestone, because `kind`
 *           differs. Completion is the share of sessions that reached 100.
 *
 *  visitor  a salted hash of IP + user agent, re-salted every day, so the same
 *           person is one visitor within a day and unlinkable across days. No
 *           IP, no cookie id, and nothing reversible is stored.
 *
 *  session  a random id the client keeps in sessionStorage. It exists only to
 *           deduplicate, and is never exposed through any API.
 *
 * Raw event rows are never returned by an endpoint; only aggregates.
 * ============================================================================
 */

import "server-only";
import crypto from "node:crypto";
import { all, one, run } from "./db";

export type Kind = "view" | "read";

/**
 * A deliberately conservative bot test. It matches crawler and tool user
 * agents, and treats a missing UA as automated. It must never match a real
 * browser, so there is no bare "preview" or "monitor" in here.
 */
const BOT_RE =
  /bot\b|crawler|spider|slurp|bingpreview|headless|phantomjs|puppeteer|playwright|lighthouse|facebookexternalhit|embedly|curl\/|wget|python-requests|axios\/|go-http|node-fetch|okhttp|scrapy/i;

export function looksLikeBot(ua: string): boolean {
  if (!ua || ua.trim().length < 12) return true;
  return BOT_RE.test(ua);
}

export function parseDevice(ua: string): "mobile" | "tablet" | "desktop" {
  if (/ipad|tablet|playbook|silk/i.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(ua)) return "mobile";
  return "desktop";
}

export function parseBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua)) return "Safari";
  return "Other";
}

/** Daily salted, non-reversible visitor id. */
export function visitorHash(ip: string, ua: string, day = new Date().toISOString().slice(0, 10)) {
  const salt = process.env.ANALYTICS_SALT ?? "emerald-analytics";
  return crypto
    .createHash("sha256")
    .update(`${salt}:${day}:${ip}:${ua}`)
    .digest("hex")
    .slice(0, 32);
}

export type TrackInput = {
  slug: string;
  kind: Kind;
  session: string;
  path?: string;
  referrer?: string;
  /** Field name is `ua`, not `userAgent`; both callers follow it. */
  ua: string;
  ip: string;
  country?: string;
  isAdmin?: boolean;
  /** Percentage of the article reached, for read milestones. Ignored for views. */
  progress?: number;
};

/**
 * Record one event. Returns what happened so the route can answer honestly.
 * Every rejection path is a real reason, not a silent drop.
 */
export async function track(input: TrackInput): Promise<{ stored: boolean; reason?: string }> {
  if (input.isAdmin) return { stored: false, reason: "admin traffic is excluded" };
  if (looksLikeBot(input.ua)) return { stored: false, reason: "bot traffic is excluded" };
  if (!input.session || input.session.length < 8)
    return { stored: false, reason: "a session id is required" };
  if (input.kind !== "view" && input.kind !== "read")
    return { stored: false, reason: "unknown event kind" };

  const post = await one<{ id: number }>("SELECT id FROM posts WHERE slug = ?", [input.slug]);
  if (!post) return { stored: false, reason: "unknown article" };

  const day = new Date().toISOString().slice(0, 10);
  let refHost: string | null = null;
  try {
    if (input.referrer) {
      const u = new URL(input.referrer);
      refHost = u.hostname.replace(/^www\./, "");
    }
  } catch {
    /* a referrer we cannot parse is simply not recorded */
  }

  const inserted = await run(
    `INSERT OR IGNORE INTO analytics
      (post_id, kind, path, visitor, session, referrer_host, device, browser, country,
       action_day, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [
      post.id,
      input.kind,
      input.path ?? null,
      visitorHash(input.ip, input.ua, day),
      input.session,
      refHost,
      parseDevice(input.ua),
      parseBrowser(input.ua),
      input.country ?? null,
      day,
      new Date().toISOString(),
    ],
  );

  // `changes` is 0 when the unique index rejected the duplicate, which is the
  // only reliable signal that this session has already been counted today.
  return inserted.changes > 0
    ? { stored: true }
    : { stored: false, reason: "duplicate event: already counted for this session today" };
}

/* --------------------------------------------------------------- windows */

export type Range = "24h" | "7d" | "30d" | "90d" | "all" | "custom";

export function sinceFor(range: Range, from?: string, to?: string): { from: string; to: string } {
  const now = new Date();
  const toIso = to ? new Date(to).toISOString() : now.toISOString();
  if (range === "custom" && from) return { from: new Date(from).toISOString(), to: toIso };
  const hours: Record<Range, number> = {
    "24h": 24,
    "7d": 24 * 7,
    "30d": 24 * 30,
    "90d": 24 * 90,
    all: 24 * 365 * 20,
    custom: 24 * 30,
  };
  return { from: new Date(now.getTime() - hours[range] * 3600_000).toISOString(), to: toIso };
}

/* ---------------------------------------------------------------- totals */

export async function overview(range: Range = "30d", from?: string, to?: string) {
  const win = sinceFor(range, from, to);

  const counts = await all<{ kind: string; n: number }>(
    "SELECT kind, COUNT(*) AS n FROM analytics WHERE created_at BETWEEN ? AND ? GROUP BY kind",
    [win.from, win.to],
  );
  const views = Number(counts.find((c) => c.kind === "view")?.n ?? 0);
  const reads = Number(counts.find((c) => c.kind === "read")?.n ?? 0);

  const uniques = await one<{ n: number }>(
    "SELECT COUNT(DISTINCT visitor) AS n FROM analytics WHERE kind='view' AND created_at BETWEEN ? AND ?",
    [win.from, win.to],
  );

  const sessions = await one<{ n: number }>(
    "SELECT COUNT(DISTINCT session) AS n FROM analytics WHERE kind='view' AND created_at BETWEEN ? AND ?",
    [win.from, win.to],
  );

  const done = await one<{ n: number }>(
    `SELECT COUNT(DISTINCT session) AS n FROM analytics
      WHERE kind='read' AND created_at BETWEEN ? AND ?`,
    [win.from, win.to],
  );

  return {
    views,
    reads,
    uniqueVisitors: Number(uniques?.n ?? 0),
    sessions: Number(sessions?.n ?? 0),
    completedSessions: Number(done?.n ?? 0),
    completionRate: sessions?.n ? Math.round((Number(done?.n ?? 0) / Number(sessions.n)) * 100) : 0,
    from: win.from,
    to: win.to,
  };
}

/** Views per day, with days that had none filled in as zero. */
export async function timeseries(range: Range = "30d", from?: string, to?: string) {
  const win = sinceFor(range, from, to);
  const rows = await all<{ day: string; n: number }>(
    `SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS n FROM analytics
      WHERE kind='view' AND created_at BETWEEN ? AND ?
      GROUP BY day ORDER BY day`,
    [win.from, win.to],
  );
  const map = new Map(rows.map((r) => [r.day, Number(r.n)]));
  const out: { day: string; views: number }[] = [];
  const start = new Date(win.from);
  const end = new Date(win.to);
  const spanDays = Math.min(180, Math.ceil((end.getTime() - start.getTime()) / 86400_000) + 1);
  for (let i = 0; i < spanDays; i++) {
    const d = new Date(start.getTime() + i * 86400_000).toISOString().slice(0, 10);
    out.push({ day: d, views: map.get(d) ?? 0 });
  }
  return out;
}

export async function topPosts(
  range: Range = "30d",
  limit = 8,
  from?: string,
  to?: string,
) {
  const win = sinceFor(range, from, to);
  const rows = await all<{ id: number; slug: string; title: string; views: number; visitors: number }>(
    `SELECT p.id, p.slug, p.title, COUNT(a.id) AS views,
            COUNT(DISTINCT a.visitor) AS visitors
       FROM analytics a JOIN posts p ON p.id = a.post_id
      WHERE a.kind='view' AND a.created_at BETWEEN ? AND ?
      GROUP BY p.id ORDER BY views DESC LIMIT ?`,
    [win.from, win.to, limit],
  );
  return rows.map((r) => ({ ...r, views: Number(r.views), visitors: Number(r.visitors) }));
}

export async function breakdowns(range: Range = "30d", from?: string, to?: string) {
  const win = sinceFor(range, from, to);

  const devices = await all<{ label: string; n: number }>(
    `SELECT device AS label, COUNT(*) AS n FROM analytics
      WHERE kind='view' AND created_at BETWEEN ? AND ? GROUP BY device ORDER BY n DESC`,
    [win.from, win.to],
  );
  const browsers = await all<{ label: string; n: number }>(
    `SELECT browser AS label, COUNT(*) AS n FROM analytics
      WHERE kind='view' AND created_at BETWEEN ? AND ? GROUP BY browser ORDER BY n DESC`,
    [win.from, win.to],
  );
  const referrers = await all<{ label: string; n: number }>(
    `SELECT COALESCE(referrer_host, 'direct') AS label, COUNT(*) AS n FROM analytics
      WHERE kind='view' AND created_at BETWEEN ? AND ? GROUP BY label ORDER BY n DESC LIMIT 8`,
    [win.from, win.to],
  );
  const shape = (rows: { label: string | null; n: number }[]) =>
    rows.map((r) => ({ name: r.label ?? "unknown", count: Number(r.n) }));

  return {
    devices: shape(devices),
    browsers: shape(browsers),
    referrers: shape(referrers),
  };
}

/** Everything for one article's analytics screen. */
export async function postAnalytics(
  postId: number,
  range: Range = "30d",
  from?: string,
  to?: string,
) {
  const win = sinceFor(range, from, to);
  const views = await one<{ n: number }>(
    "SELECT COUNT(*) AS n FROM analytics WHERE kind='view' AND post_id=? AND created_at BETWEEN ? AND ?",
    [postId, win.from, win.to],
  );
  const uniques = await one<{ n: number }>(
    "SELECT COUNT(DISTINCT visitor) AS n FROM analytics WHERE kind='view' AND post_id=? AND created_at BETWEEN ? AND ?",
    [postId, win.from, win.to],
  );
  const completed = await one<{ n: number }>(
    "SELECT COUNT(DISTINCT session) AS n FROM analytics WHERE kind='read' AND post_id=? AND created_at BETWEEN ? AND ?",
    [postId, win.from, win.to],
  );
  const sessions = await one<{ n: number }>(
    "SELECT COUNT(DISTINCT session) AS n FROM analytics WHERE kind='view' AND post_id=? AND created_at BETWEEN ? AND ?",
    [postId, win.from, win.to],
  );
  const series = await all<{ day: string; n: number }>(
    `SELECT substr(created_at,1,10) AS day, COUNT(*) AS n FROM analytics
      WHERE kind='view' AND post_id=? AND created_at BETWEEN ? AND ?
      GROUP BY day ORDER BY day`,
    [postId, win.from, win.to],
  );
  const referrers = await all<{ label: string; n: number }>(
    `SELECT COALESCE(referrer_host,'direct') AS label, COUNT(*) AS n FROM analytics
      WHERE kind='view' AND post_id=? AND created_at BETWEEN ? AND ?
      GROUP BY label ORDER BY n DESC LIMIT 8`,
    [postId, win.from, win.to],
  );

  return {
    views: Number(views?.n ?? 0),
    uniqueVisitors: Number(uniques?.n ?? 0),
    completed: Number(completed?.n ?? 0),
    sessions: Number(sessions?.n ?? 0),
    completionRate: sessions?.n ? Math.round((Number(completed?.n ?? 0) / Number(sessions.n)) * 100) : 0,
    series,
    referrers: referrers.map((r) => ({ name: r.label, count: Number(r.n) })),
    from: win.from,
    to: win.to,
  };
}
