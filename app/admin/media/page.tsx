import { redirect } from "next/navigation";
import { AdminShell } from "../../../components/admin/AdminShell";
import { MediaLibrary } from "../../../components/admin/MediaLibrary";
import { isAuthed } from "../../../lib/server/admin-auth";
import { listMedia } from "../../../lib/server/cms";
import { blobConfigured } from "../../../lib/server/media";

export const dynamic = "force-dynamic";

/**
 * The media library. Images live in Blob (or public/uploads in local
 * development); the database only ever holds a URL and its metadata.
 */
export default async function MediaPage() {
  if (!(await isAuthed())) redirect("/admin/login");

  const media = await listMedia(120);

  return (
    <AdminShell
      title="Media"
      description="Images used in posts and covers. Files go to Blob storage, never into the database."
    >
      {!blobConfigured() ? (
        <p className="mb-5 rounded-xl border-2 border-ink bg-tang/20 px-4 py-3 text-sm font-semibold">
          BLOB_READ_WRITE_TOKEN is not set, so uploads are being written to public/uploads
          instead. That works locally, and it will not survive a deploy.
        </p>
      ) : null}

      <MediaLibrary media={media.map((m) => ({ ...m }))} />
    </AdminShell>
  );
}
