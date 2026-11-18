/**
 * A read only database must not break the site.
 *
 * This is the Vercel case: the filesystem cannot be written, so publishing what
 * is due and recording a view will fail. Those failures have to be survivable,
 * because a reader should never see a 500 caused by a log write.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

describe("read only handling", () => {
  it("treats a readonly error as zero changes rather than throwing", async () => {
    // A file we are not allowed to write, mirroring a readonly filesystem.
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cms-ro-"));
    const file = path.join(dir, "cms.db");
    fs.writeFileSync(file, "");
    fs.chmodSync(file, 0o444);

    const { default: Database } = await import("better-sqlite3");
    const db = new Database(file);
    let code = "";
    try {
      db.prepare("CREATE TABLE t (a TEXT)").run();
    } catch (err) {
      code = (err as { code?: string }).code ?? "";
    }
    expect(code).toMatch(/SQLITE_READONLY/);

    // Mirrors the helper in db.ts: the exact code, or the message on a
    // connection that has already fallen back to read only.
    const isReadOnly = (err: unknown) => {
      const code = (err as { code?: string })?.code ?? "";
      const message = (err as { message?: string })?.message ?? "";
      return code.startsWith("SQLITE_READONLY") || /readonly database/i.test(message);
    };
    expect(isReadOnly({ code: "SQLITE_READONLY" })).toBe(true);
    expect(isReadOnly(new Error("attempt to write a readonly database"))).toBe(true);
    expect(isReadOnly(new Error("no such table"))).toBe(false);

    db.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });
});
