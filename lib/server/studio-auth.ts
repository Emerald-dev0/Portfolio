/**
 * ============================================================================
 * STUDIO AUTH, one password, one long-lived cookie. Server-only.
 * ============================================================================
 * There are no users and no database: the studio belongs to one person, so the
 * whole auth model is "do you know the password in STUDIO_PASSWORD?".
 *
 * The cookie holds an HMAC of the password, not the password itself, so the
 * value cannot be replayed elsewhere or read out of devtools. Sessions last 30
 * days. Every studio route (and the write API) calls `requireAuth` first.
 * ============================================================================
 */

import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "studio_session";
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

/** Length-independent, timing-safe compare. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/** Did they type the right password? */
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
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** True when the request carries a valid studio cookie. */
export async function isAuthed(): Promise<boolean> {
  if (!configured()) return false;
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  if (!value) return false;
  return safeEqual(value, tokenFor(secret()));
}

/** For API routes: returns false and the caller answers 401. */
export async function guard(): Promise<boolean> {
  return isAuthed();
}
