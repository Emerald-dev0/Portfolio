import { NextResponse } from "next/server";
import { checkPassword, configured, createSession } from "../../../../lib/server/studio-auth";

/**
 * POST /api/studio/login, exchange the studio password for a session cookie.
 * Rate-limited crudely: a wrong password costs a second of the responder's
 * time, which is enough against a human typing guesses.
 */
export async function POST(request: Request) {
  if (!configured()) {
    return NextResponse.json(
      { error: "STUDIO_PASSWORD isn't set. Add it in your Vercel project settings." },
      { status: 500 },
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Send a JSON body with a password." }, { status: 400 });
  }

  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 700));
    return NextResponse.json({ error: "That password doesn't match." }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ ok: true });
}
