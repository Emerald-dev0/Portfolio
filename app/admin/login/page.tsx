import { redirect } from "next/navigation";
import { LoginForm } from "../../../components/admin/LoginForm";
import { configured, isAuthed } from "../../../lib/server/admin-auth";

export const dynamic = "force-dynamic";

/**
 * The login screen. If you are already signed in, it sends you to the
 * dashboard rather than showing you a password box.
 */
export default async function LoginPage() {
  if (await isAuthed()) redirect("/admin");

  return (
    <div className="grid min-h-[100svh] place-items-center px-5 py-16">
      <div className="w-full max-w-md">
        <LoginForm />
        {!configured() ? (
          <p className="mt-5 rounded-xl border-2 border-ink bg-tang/20 p-4 text-sm font-semibold">
            STUDIO_PASSWORD is not set on this deployment, so sign in is disabled. Set it in your
            environment, then reload this page.
          </p>
        ) : null}
      </div>
    </div>
  );
}
