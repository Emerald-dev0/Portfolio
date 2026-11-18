/**
 * ============================================================================
 * DATABASE, server-only. One SQLite file, through better-sqlite3.
 * ============================================================================
 * A personal blog does not need a hosted database. The whole dataset is a few
 * hundred kilobytes of text, so it lives in a single SQLite file: no account to
 * create, no connection string, no vendor, and `npm run dev` works on a fresh
 * clone with nothing configured.
 *
 * The schema is created on first use, so a new clone, a preview deploy and a
 * brand new machine all work without a migration step.
 *
 * Where the file lives:
 *   Vercel           /tmp, deployed site stays fully readable, dashboard
 *                    changes last until the next cold start.
 *   Docker, VPS      CMS_DB_FILE=/data/cms.db on a mounted volume, and writes
 *                    persist indefinitely.
 *   Your machine     ./.data/cms.db, gitignored.
 *   Tests            :memory:
 *
 * If the disk is read only, reads keep working and writes are skipped rather
 * than thrown, so the site never 500s because it could not record a log line.
 * See BLOG.md for the deployment options.
 * ============================================================================
 */

import "server-only";
import fs from "node:fs";
import nodePath from "node:path";
import Database from "better-sqlite3";

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS categories (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     slug TEXT NOT NULL UNIQUE,
     name TEXT NOT NULL,
     description TEXT,
     created_at TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS posts (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     slug TEXT NOT NULL UNIQUE,
     title TEXT NOT NULL,
     excerpt TEXT NOT NULL DEFAULT '',
     content_md TEXT NOT NULL DEFAULT '',
     category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
     status TEXT NOT NULL DEFAULT 'draft',
     featured INTEGER NOT NULL DEFAULT 0,
     cover_url TEXT,
     cover_alt TEXT,
     seo_title TEXT,
     seo_description TEXT,
     og_image TEXT,
     published_at TEXT,
     scheduled_for TEXT,
     created_at TEXT NOT NULL,
     updated_at TEXT NOT NULL,
     read_minutes INTEGER NOT NULL DEFAULT 1
   )`,
  `CREATE TABLE IF NOT EXISTS tags (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     slug TEXT NOT NULL UNIQUE,
     name TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS post_tags (
     post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
     tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
     PRIMARY KEY (post_id, tag_id)
   )`,
  `CREATE TABLE IF NOT EXISTS media (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     url TEXT NOT NULL,
     pathname TEXT NOT NULL,
     alt TEXT,
     caption TEXT,
     content_type TEXT,
     bytes INTEGER,
     created_at TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS revisions (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     excerpt TEXT NOT NULL DEFAULT '',
     content_md TEXT NOT NULL DEFAULT '',
     created_at TEXT NOT NULL,
     note TEXT
   )`,
  `CREATE TABLE IF NOT EXISTS redirects (
     from_slug TEXT PRIMARY KEY,
     to_slug TEXT NOT NULL,
     created_at TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS analytics (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     post_id INTEGER,
     kind TEXT NOT NULL,
     path TEXT,
     visitor TEXT,
     session TEXT,
     referrer_host TEXT,
     device TEXT,
     browser TEXT,
     country TEXT,
     action_day TEXT NOT NULL,
     created_at TEXT NOT NULL
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS analytics_dedupe
     ON analytics(session, post_id, kind, action_day)`,
  `CREATE INDEX IF NOT EXISTS analytics_post_time ON analytics(post_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS analytics_time ON analytics(created_at)`,
  `CREATE INDEX IF NOT EXISTS posts_status_time ON posts(status, published_at)`,
  `CREATE INDEX IF NOT EXISTS revisions_post_time ON revisions(post_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS post_tags_tag ON post_tags(tag_id)`,
];

type Value = string | number | null;

let handle: Database.Database | null = null;
let readOnly = false;

/** Where the database file lives, and whether we can write to it. */
function resolveFile(): string {
  if (process.env.CMS_DB_FILE) return process.env.CMS_DB_FILE;

  const writable = (dir: string) => {
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.accessSync(dir, fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  };

  // Vercel's bundle is read only apart from /tmp. Using /tmp keeps the whole
  // deployed site working, and `vercel dev` gets the same treatment.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const dir = nodePath.join("/tmp", ".data");
    return writable(dir) ? nodePath.join(dir, "cms.db") : ":memory:";
  }

  const local = nodePath.join(process.cwd(), ".data");
  if (writable(local)) return nodePath.join(local, "cms.db");

  // A read only checkout: serve the in-memory copy instead of crashing.
  return ":memory:";
}

function open(): Database.Database {
  if (handle) return handle;

  const file = resolveFile();
  const isMemory = file === ":memory:";

  try {
    handle = new Database(file);
  } catch {
    readOnly = true;
    handle = new Database(":memory:");
  }

  handle.pragma("journal_mode = WAL");
  handle.pragma("foreign_keys = ON");
  handle.pragma("busy_timeout = 5000");

  // Schema creation is a write. If it fails, this process is read only.
  try {
    const tx = handle.transaction(() => {
      for (const stmt of SCHEMA) handle!.exec(stmt);
    });
    tx();
  } catch {
    readOnly = true;
  }

  if (!isMemory) {
    console.info(`[db] ${file}${readOnly ? " (read only)" : ""}`);
  }
  return handle;
}

/** The connection. Synchronous, so callers can await it without thinking. */
export function db(): Database.Database {
  return open();
}

/** True when the database cannot be written to, so callers can explain it. */
export function isReadOnly(): boolean {
  return readOnly;
}

/** Rows as plain objects, which is what every caller wants. */
export async function all<T = Record<string, unknown>>(
  sql: string,
  args: Value[] = [],
): Promise<T[]> {
  try {
    return db().prepare(sql).all(...args) as T[];
  } catch (err) {
    if (isReadOnlyError(err)) return [];
    throw err;
  }
}

export async function one<T = Record<string, unknown>>(
  sql: string,
  args: Value[] = [],
): Promise<T | null> {
  const rows = await all<T>(sql, args);
  return rows[0] ?? null;
}

/**
 * A write. On a read only filesystem this reports zero changes instead of
 * throwing, so a page that happens to write (publishing what is due, recording
 * a view) still renders.
 */
export async function run(
  sql: string,
  args: Value[] = [],
): Promise<{ lastId: number; changes: number }> {
  try {
    const res = db().prepare(sql).run(...args);
    return { lastId: Number(res.lastInsertRowid ?? 0), changes: Number(res.changes ?? 0) };
  } catch (err) {
    if (isReadOnlyError(err)) {
      readOnly = true;
      return { lastId: 0, changes: 0 };
    }
    throw err;
  }
}

/**
 * SQLite reports a readonly failure in two ways: the exact code when the file
 * itself refuses, and a plain SQLITE_ERROR whose message says so when the open
 * connection has already gone read only. Both mean the same thing here.
 */
function isReadOnlyError(err: unknown): boolean {
  const code = (err as { code?: string })?.code ?? "";
  const message = (err as { message?: string })?.message ?? "";
  return code.startsWith("SQLITE_READONLY") || /readonly database/i.test(message);
}

/** Insert-or-update a single row, returning the id. */
export async function upsert(
  table: "categories" | "tags",
  slug: string,
  name: string,
): Promise<number> {
  const found = await one<{ id: number }>(`SELECT id FROM ${table} WHERE slug = ?`, [slug]);
  if (found) return found.id;
  // `categories` has a required created_at, `tags` does not, so this is the one
  // place the two differ and it is handled here rather than by every caller.
  const res =
    table === "categories"
      ? await run("INSERT INTO categories (slug, name, created_at) VALUES (?, ?, ?)", [
          slug,
          name,
          new Date().toISOString(),
        ])
      : await run("INSERT INTO tags (slug, name) VALUES (?, ?)", [slug, name]);
  return res.lastId;
}

/** Test helper: wipe everything, keeping the schema. */
export async function resetDb(): Promise<void> {
  const tables = [
    "analytics",
    "revisions",
    "post_tags",
    "media",
    "redirects",
    "posts",
    "tags",
    "categories",
  ];
  for (const t of tables) await run(`DELETE FROM ${t}`);
}
