import { clearSession } from "../../../../lib/server/admin-auth";
import { json } from "../../../../lib/admin-api";

/** POST /api/admin/logout, drop the session cookie. */
export async function POST() {
  await clearSession();
  return json({ ok: true });
}
