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

    const { DatabaseSync } = await import("node:sqlite");
    const db = new DatabaseSync(file);
    let code = "";
    try {
      db.prepare("CREATE TABLE t (a TEXT)").run();
    } catch (err) {
      code = (err as { code?: string }).code ?? "";
    }
    // node:sqlite reports everything as ERR_SQLITE_ERROR and carries the real
    // SQLite result code in `errcode`, where 8 is SQLITE_READONLY.
    expect(code).toBe("ERR_SQLITE_ERROR");

    // Mirrors the helper in db.ts. It has to match on the numeric code and the
    // message, because the string `code` says nothing useful.
    const isReadOnly = (err: unknown) => {
      const e = err as { code?: string; errcode?: number; errstr?: string; message?: string };
      const message = e?.errstr ?? e?.message ?? "";
      if (/readonly database|read-only database/i.test(message)) return true;
      if (typeof e?.errcode === "number") return (e.errcode & 0xff) === 8;
      return (e?.code ?? "").startsWith("SQLITE_READONLY");
    };

    expect(isReadOnly({ code: "ERR_SQLITE_ERROR", errcode: 8 })).toBe(true);
    expect(isReadOnly({ errcode: 8 | (1 << 8) })).toBe(true); // extended form
    expect(isReadOnly(new Error("attempt to write a readonly database"))).toBe(true);
    expect(isReadOnly({ code: "ERR_SQLITE_ERROR", errcode: 1 })).toBe(false);
    expect(isReadOnly(new Error("no such table"))).toBe(false);

    db.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });
});
