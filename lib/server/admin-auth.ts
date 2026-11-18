/**
 * ============================================================================
 * ADMIN AUTH, server-only.
 * ============================================================================
 * One operator, one password (`STUDIO_PASSWORD`), one httpOnly cookie holding
 * a SHA-256 of `emerald-studio:<password>` so the secret itself never leaves
 * the server. Sessions last 30 days.
 *
 * On top of the existing cookie check this adds the things a production admin
 * surface needs:
 *
 *   failLimit   in-memory rate limiting on login attempts, per IP, with a lock
 *   sameOrigin  CSRF: a write request must come from our own origin
 *   requireAdmin a single guard every /api/admin route calls first
 *
 * The in-memory limiter is per instance, which is the honest trade for a
 * single-operator site with no KV dependency. It is documented, not hidden.
 * ============================================================================
 */

import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 30;

function secret(): string {
  return process.env.STUDIO_PASSWORD ?? "";
}

export function configured(): boolean {
  return secret().length > 0;
}

function tokenFor(password: string): string {
  return crypto.createHash("sha256").update(`emerald-studio:${password}`).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/* ------------------------------------------------------------- limiting */

type Bucket = { count: number; resetAt: number };
const failures = new Map<string, Bucket>();
const MAX_FAILURES = 5;
const LOCK_MS = 10 * 60_000;

export function loginLocked(ip: string): { locked: boolean; retryAfter: number } {
  const b = failures.get(ip);
  if (!b) return { locked: false, retryAfter: 0 };
  if (Date.now() > b.resetAt) {
    failures.delete(ip);
    return { locked: false, retryAfter: 0 };
  }
  return { locked: b.count >= MAX_FAILURES, retryAfter: Math.ceil((b.resetAt - Date.now()) / 1000) };
}

export function noteFailure(ip: string): void {
  const b = failures.get(ip) ?? { count: 0, resetAt: Date.now() + LOCK_MS };
  b.count += 1;
  failures.set(ip, b);
}

export function clearFailures(ip: string): void {
  failures.delete(ip);
}

/** Test helper. */
export function _resetLimiter(): void {
  failures.clear();
}

/* --------------------------------------------------------------- session */

export function checkPassword(input: string): boolean {
  const s = secret();
  return s.length > 0 && safeEqual(input, s);
}

export async function createSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, tokenFor(secret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  // Retire the old cookie name so a stale session cannot linger.
  store.delete("studio_session");
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function isAuthed(): Promise<boolean> {
  if (!configured()) return false;
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  if (!value) return false;
  return safeEqual(value, tokenFor(secret()));
}

/**
 * The single boundary for privileged operations. Every /api/admin route calls
 * this and answers 401 when it returns false. Hiding UI is never the control.
 */
export async function requireAdmin(): Promise<boolean> {
  return isAuthed();
}

/** CSRF: writes must originate from this site. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin fetch from a server component
  const host = req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Best-effort client IP, for rate limiting only. Never stored. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "local";
}
