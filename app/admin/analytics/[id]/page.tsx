import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { AdminShell } from "../../../../components/admin/AdminShell";
import { BarList, Sparkline, Stat } from "../../../../components/admin/Charts";
import { RangePicker } from "../../../../components/admin/RangePicker";
import { Methodology } from "../../../../components/admin/Methodology";
import { Icon } from "../../../../components/ui/Icon";
import { isAuthed } from "../../../../lib/server/admin-auth";
import { postById } from "../../../../lib/server/cms";
import { postAnalytics, type Range } from "../../../../lib/server/analytics";

export const dynamic = "force-dynamic";

const RANGES: Range[] = ["24h", "7d", "30d", "90d", "all", "custom"];

/** One article's own numbers, with its own range. */
export default async function PostAnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  if (!(await isAuthed())) redirect("/admin/login");

  const { id } = await params;
  const numeric = Number(id);
  if (!Number.isInteger(numeric) || numeric <= 0) notFound();

  const post = await postById(numeric);
  if (!post) notFound();

  const { range: raw = "30d", from, to } = await searchParams;
  const range: Range = RANGES.includes(raw as Range) ? (raw as Range) : "30d";
  const data = await postAnalytics(numeric, range, from, to);

  // The series comes back as raw day rows, so fill the gaps for the chart.
  const filled = fillDays(data.series, data.from, data.to);

  return (
    <AdminShell
      title={post.title}
      description={`Analytics for /blog/${post.slug}`}
      actions={
        <>
          <RangePicker active={range} />
          <Link href="/admin/analytics" className="btn btn-paper px-3 py-2 text-sm">
            <Icon icon={ArrowLeft01Icon} size={14} />
            All analytics
          </Link>
        </>
      }
    >
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat value={data.views} label="Views" tone="leaf" />
        <Stat value={data.uniqueVisitors} label="Unique readers" />
        <Stat value={data.completed} label="Finished reads" />
        <Stat value={`${data.completionRate}%`} label="Completion" />
      </section>

      <section className="mt-6 sticker-flat p-5">
        <h2 className="font-display text-xl font-extrabold">Views over time</h2>
        <Sparkline data={filled} label={`Views for ${post.title}`} />
      </section>

      <section className="mt-6 sticker-flat p-5">
        <h2 className="font-display text-xl font-extrabold">Where they came from</h2>
        <div className="mt-3">
          <BarList items={data.referrers} emptyLabel="No referrers in this window." />
        </div>
      </section>

      <Methodology />
    </AdminShell>
  );
}

function fillDays(rows: { day: string; n: number }[], from: string, to: string) {
  const map = new Map(rows.map((r) => [r.day, Number(r.n)]));
  const out: { day: string; views: number }[] = [];
  const start = new Date(from);
  const end = new Date(to);
  const span = Math.min(180, Math.ceil((end.getTime() - start.getTime()) / 86400_000) + 1);
  for (let i = 0; i < span; i++) {
    const day = new Date(start.getTime() + i * 86400_000).toISOString().slice(0, 10);
    out.push({ day, views: map.get(day) ?? 0 });
  }
  return out;
}
