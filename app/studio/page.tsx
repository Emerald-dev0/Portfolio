import { redirect } from "next/navigation";

/**
 * The old writing surface lived here. The CMS now owns /admin, so this route
 * exists only to forward an old bookmark, and to keep the name out of a 404.
 */
export default function StudioPage() {
  redirect("/admin");
}
