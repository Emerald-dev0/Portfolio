import { NextResponse } from "next/server";
import {
  checkPassword,
  clearFailures,
  clientIp,
  configured,
  createSession,
  loginLocked,
  noteFailure,
} from "../../../../lib/server/admin-auth";
import { body, fail, json } from "../../../../lib/admin-api";

/**
 * POST /api/admin/login
 * One password in, one httpOnly cookie out. Failures are rate limited per IP
 * and take a constant-ish 600ms, so guessing is neither fast nor free.
 */
export async function POST(req: Request) {
  if (!configured()) {
    return fail("STUDIO_PASSWORD is not set on the server, so sign in is disabled.", 503);
  }
  const ip = clientIp(req);
  const lock = loginLocked(ip);
  if (lock.locked) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${lock.retryAfter}s.` },
      { status: 429, headers: { "retry-after": String(lock.retryAfter) } },
    );
  }

  const { password } = await body(req);
  await new Promise((r) => setTimeout(r, 600));

  if (typeof password !== "string" || !checkPassword(password)) {
    noteFailure(ip);
    return fail("That password is not right.", 401);
  }

  clearFailures(ip);
  await createSession();
  return json({ ok: true });
}
