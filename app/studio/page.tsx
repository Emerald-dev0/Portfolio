import { StudioEditor } from "../../components/studio/StudioEditor";
import { StudioLogin } from "../../components/studio/StudioLogin";
import { allPosts, blogStore } from "../../lib/server/blog-store";
import { configured as blobConfigured } from "../../lib/server/blog-writes";
import { configured as authConfigured, isAuthed } from "../../lib/server/studio-auth";

/**
 * /studio, writing surface. Renders the login until the session cookie is
 * valid, then the editor with every post (drafts included). Always dynamic,
 * never cached: it is a private page.
 */
export const dynamic = "force-dynamic";

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ post?: string }>;
}) {
  const authed = await isAuthed();
  if (!authed) return <StudioLogin ready={authConfigured()} />;

  const [{ post }, posts] = await Promise.all([searchParams, allPosts()]);
  return <StudioEditor posts={posts} hasBlob={blobConfigured() && blogStore.hasBlob} initialSlug={post} />;
}
