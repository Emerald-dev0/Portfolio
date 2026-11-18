/**
 * ============================================================================
 * DATABASE, server-only. libSQL (Turso in production, a file in development).
 * ============================================================================
 * Turso speaks SQLite over HTTP, so the same code runs locally with a file and
 * in production against a hosted database, with no ORM in the middle. The
 * schema is created idempotently on first use, which means a fresh deploy, a
 * preview branch or a brand new local checkout all work without a migration
 * step being run by hand.
 *
 * Config:
 *   TURSO_DATABASE_URL   libsql://...   (falls back to a local file)
 *   TURSO_AUTH_TOKEN     token for the hosted database
 *   CMS_DB_FILE          overrides the local file path (tests use :memory:)
 * ============================================================================
 */

import "server-only";
import fs from "node:fs";
import nodePath from "node:path";
import { createClient, type Client, type InValue } from "@libsql/client";

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

let client: Client | null = null;
let ready: Promise<Client> | null = null;

function makeClient(): Client {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (url) return createClient({ url, authToken });

  // Local development: a file next to the project, or :memory: in tests.
  const file = process.env.CMS_DB_FILE ?? "file:./.data/cms.db";
  // SQLite will not create a missing directory, so make one first.
  const path = file.replace(/^file:/, "");
  if (path !== ":memory:" && !path.startsWith(":memory:")) {
    fs.mkdirSync(nodePath.dirname(nodePath.resolve(path)), { recursive: true });
  }
  return createClient({ url: file });
}

/** The shared client, with the schema guaranteed to exist. */
async function init(): Promise<Client> {
  if (!client) client = makeClient();
  for (const stmt of SCHEMA) await client.execute(stmt);
  return client;
}

export function db(): Promise<Client> {
  if (!ready) ready = init();
  return ready;
}

/** Rows as plain objects, which is what every caller wants. */
export async function all<T = Record<string, unknown>>(
  sql: string,
  args: InValue[] = [],
): Promise<T[]> {
  const c = await db();
  const res = await c.execute({ sql, args });
  return res.rows as unknown as T[];
}

export async function one<T = Record<string, unknown>>(
  sql: string,
  args: InValue[] = [],
): Promise<T | null> {
  const rows = await all<T>(sql, args);
  return rows[0] ?? null;
}

export async function run(
  sql: string,
  args: InValue[] = [],
): Promise<{ lastId: number; changes: number }> {
  const c = await db();
  const res = await c.execute({ sql, args });
  return {
    lastId: Number(res.lastInsertRowid ?? 0),
    changes: Number(res.rowsAffected ?? 0),
  };
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
      ? await run(
          "INSERT INTO categories (slug, name, created_at) VALUES (?, ?, ?)",
          [slug, name, new Date().toISOString()],
        )
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
