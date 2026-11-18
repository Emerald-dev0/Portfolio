import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight01Icon, PlusSignIcon, EyeIcon } from "@hugeicons/core-free-icons";
import { AdminShell } from "../../components/admin/AdminShell";
import { BarList, Sparkline, Stat } from "../../components/admin/Charts";
import { StatusPill } from "../../components/admin/StatusPill";
import { Icon } from "../../components/ui/Icon";
import { isAuthed } from "../../lib/server/admin-auth";
import { listPosts, countPublished } from "../../lib/server/cms";
import { breakdowns, overview, timeseries, topPosts } from "../../lib/server/analytics";
import { seedOnce } from "../../lib/server/seed";

export const dynamic = "force-dynamic";

/**
 * OVERVIEW. The state of the blog in one screen: what is published, what is
 * waiting to go out, what is in draft, and what the last 30 days actually did.
 *
 * Every number on this page comes from a real row. Nothing here is a
 * placeholder, a sample, or an estimate: if there is no traffic yet, the charts
 * say zero rather than showing something flattering.
 */
export default async function AdminOverview() {
  if (!(await isAuthed())) redirect("/admin/login");
  await seedOnce();

  const [published, all, drafts, scheduled, archived, stats, series, top, splits] =
    await Promise.all([
      countPublished(),
      listPosts({ status: "all", limit: 500 }),
      listPosts({ status: "draft", limit: 500 }),
      listPosts({ status: "scheduled", limit: 500 }),
      listPosts({ status: "archived", limit: 500 }),
      overview("30d"),
      timeseries("30d"),
      topPosts("30d", 5),
      breakdowns("30d"),
    ]);

  const recent = all.slice(0, 5);
  const due = scheduled
    .slice()
    .sort((a, b) => (a.scheduled_for ?? "").localeCompare(b.scheduled_for ?? ""))[0];

  return (
    <AdminShell
      title="Overview"
      description="Everything that has been published, what is coming, and how the last 30 days went."
      actions={
        <>
          <Link href="/blog" className="btn btn-paper px-4 py-2 text-sm">
            <Icon icon={EyeIcon} size={15} />
            View blog
          </Link>
          <Link href="/admin/posts/new" className="btn btn-leaf px-4 py-2 text-sm">
            <Icon icon={PlusSignIcon} size={15} />
            New post
          </Link>
        </>
      }
    >
      <section aria-labelledby="numbers" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <h2 id="numbers" className="sr-only">
          Totals
        </h2>
        <Stat value={published} label="Published" hint="Live and listed" tone="leaf" />
        <Stat value={drafts.length} label="Drafts" hint="Only you can see these" />
        <Stat value={scheduled.length} label="Scheduled" hint={due?.scheduled_for ? `Next: ${formatWhen(due.scheduled_for)}` : "Nothing queued"} />
        <Stat value={archived.length} label="Archived" hint="Live, unlisted, noindex" />
      </section>

      <section aria-labelledby="traffic" className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="sticker-flat p-5 lg:col-span-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="traffic" className="font-display text-xl font-extrabold">
              Views, last 30 days
            </h2>
            <Link
              href="/admin/analytics"
              className="inline-flex items-center gap-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] underline decoration-2 underline-offset-4"
            >
              Full analytics
              <Icon icon={ArrowRight01Icon} size={12} />
            </Link>
          </div>
          <Sparkline data={series} label="Views, last 30 days" />
        </div>

        <div className="flex flex-col gap-3">
          <Stat value={stats.views} label="Views, 30 days" hint="One per reader per article per day" />
          <Stat value={stats.uniqueVisitors} label="Readers, 30 days" hint="Daily salted hashes, not identities" />
          <Stat value={`${stats.completionRate}%`} label="Read to the end" hint={`${stats.completedSessions} of ${stats.sessions} sessions`} />
        </div>
      </section>

      <section aria-labelledby="recent" className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="sticker-flat p-5 lg:col-span-2">
          <h2 id="recent" className="font-display text-xl font-extrabold">
            Recently edited
          </h2>
          <ul className="mt-4 flex flex-col">
            {recent.map((post) => (
              <li key={post.id} className="border-b-2 border-ink/10 last:border-0">
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="flex flex-wrap items-center gap-3 py-3 transition hover:opacity-70"
                >
                  <span className="min-w-0 flex-1 truncate font-semibold">{post.title}</span>
                  <StatusPill status={post.status} />
                  <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.12em] opacity-50">
                    {formatWhen(post.updated_at)}
                  </span>
                </Link>
              </li>
            ))}
            {!recent.length ? (
              <li className="py-6 text-sm opacity-60">
                No posts yet. Start with the first one.
              </li>
            ) : null}
          </ul>
        </div>

        <div className="flex flex-col gap-6">
          <div className="sticker-flat p-5">
            <h2 className="font-display text-lg font-extrabold">Most read</h2>
            <div className="mt-3">
              <BarList
                items={top.map((t) => ({ name: t.title, count: t.views }))}
                emptyLabel="No views recorded in this window."
              />
            </div>
          </div>
          <div className="sticker-flat p-5">
            <h2 className="font-display text-lg font-extrabold">Where readers came from</h2>
            <div className="mt-3">
              <BarList items={splits.referrers} emptyLabel="No referrers recorded yet." />
            </div>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}
