import { guard, handle, json } from "../../../../lib/admin-api";
import { addMedia, listMedia } from "../../../../lib/server/cms";
import { ACCEPTED, MAX_BYTES, storeImage } from "../../../../lib/server/media";

/** GET /api/admin/media, the library, newest first. */
export async function GET(req: Request) {
  const g = await guard(req);
  if (!g.ok) return g.res;
  return handle(async () => json({ media: await listMedia(120) }));
}

/**
 * POST /api/admin/media
 * multipart/form-data: { file, alt?, caption? }
 * The browser never chooses the stored name, the server does.
 */
export async function POST(req: Request) {
  const g = await guard(req, { write: true });
  if (!g.ok) return g.res;
  return handle(async () => {
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      throw new Error("Send the image as multipart/form-data.");
    }
    const file = form.get("file");
    if (!(file instanceof File)) throw new Error("No file arrived with the request.");
    const alt = typeof form.get("alt") === "string" ? String(form.get("alt")).trim() : "";
    const caption = typeof form.get("caption") === "string" ? String(form.get("caption")).trim() : "";

    const upload = await storeImage(file, alt || file.name);
    const id = await addMedia({
      url: upload.url,
      pathname: upload.pathname,
      alt: alt || null,
      caption: caption || null,
      contentType: upload.contentType,
      bytes: upload.bytes,
    });
    return json(
      {
        media: {
          id,
          url: upload.url,
          alt: alt || null,
          caption: caption || null,
          content_type: upload.contentType,
          bytes: upload.bytes,
        },
        accepted: ACCEPTED,
        maxBytes: MAX_BYTES,
      },
      201,
    );
  });
}
