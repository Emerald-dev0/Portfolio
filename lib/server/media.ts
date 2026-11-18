/**
 * ============================================================================
 * MEDIA, server-only. Images live in Vercel Blob; the database holds a row of
 * metadata and nothing heavier than a URL.
 * ============================================================================
 * Validation happens here, on the server, not in the browser:
 *
 *   type      image/png, image/jpeg, image/webp, image/gif, image/avif
 *   size      8 MB ceiling, which is far more than a hero needs
 *   name      rewritten to a slug plus a short random suffix, so uploads can
 *             never collide and can never carry a path
 *
 * When Blob is not configured (local development, tests) the file is written
 * into `public/uploads` instead, so the editor works end to end offline.
 * ============================================================================
 */

import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { slugify } from "../blog";

export const ACCEPTED = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

export const MAX_BYTES = 8 * 1024 * 1024;

export type Upload = {
  url: string;
  pathname: string;
  contentType: string;
  bytes: number;
};

function extFor(type: string): string {
  return (
    {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/avif": "avif",
    } as Record<string, string>
  )[type] ?? "bin";
}

/** Validate and store one uploaded image. */
export async function storeImage(file: File, altHint?: string): Promise<Upload> {
  if (!(file instanceof File) || file.size === 0) throw new Error("Pick an image to upload.");
  if (!ACCEPTED.includes(file.type as (typeof ACCEPTED)[number])) {
    throw new Error("That file is not an image we accept. Use PNG, JPEG, WebP, GIF or AVIF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 8 MB.`);
  }

  const base = slugify(altHint || file.name.replace(/\.[^.]+$/, "")) || "image";
  const suffix = crypto.randomBytes(4).toString("hex");
  const pathname = `media/${base}-${suffix}.${extFor(file.type)}`;

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    const { put } = await import("@vercel/blob");
    const { url } = await put(pathname, file, {
      access: "public",
      token,
      contentType: file.type,
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    return { url, pathname, contentType: file.type, bytes: file.size };
  }

  // Local fallback so the editor is usable without cloud credentials.
  const dest = path.join(process.cwd(), "public", "uploads", pathname.replace(/^media\//, ""));
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, Buffer.from(await file.arrayBuffer()));
  return {
    url: `/uploads/${pathname.replace(/^media\//, "")}`,
    pathname,
    contentType: file.type,
    bytes: file.size,
  };
}

/** Remove the underlying blob or file, best effort. */
export async function removeImage(url: string, pathname: string): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  try {
    if (token) {
      const { del } = await import("@vercel/blob");
      await del(url, { token });
      return;
    }
    if (url.startsWith("/uploads/")) {
      await fs.unlink(path.join(process.cwd(), "public", url.replace(/^\//, "")));
    }
  } catch {
    // The row is going away either way; an orphaned blob is not worth failing on.
  }
  void pathname;
}

export function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
