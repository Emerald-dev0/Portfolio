import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { AdminShell } from "../../../components/admin/AdminShell";
import { BarList, Sparkline, Stat } from "../../../components/admin/Charts";
import { RangePicker } from "../../../components/admin/RangePicker";
import { Methodology } from "../../../components/admin/Methodology";
import { Icon } from "../../../components/ui/Icon";
import { isAuthed } from "../../../lib/server/admin-auth";
import {
  breakdowns,
  overview,
  timeseries,
  topPosts,
  type Range,
} from "../../../lib/server/analytics";

export const dynamic = "force-dynamic";

const RANGES: Range[] = ["24h", "7d", "30d", "90d", "all", "custom"];

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  if (!(await isAuthed())) redirect("/admin/login");

  const { range: raw = "30d", from, to } = await searchParams;
  const range: Range = RANGES.includes(raw as Range) ? (raw as Range) : "30d";
  const custom = range === "custom" && from && to;

  const [summary, series, top, splits] = await Promise.all([
    overview(range, from, to),
    timeseries(range, from, to),
    topPosts(range, 10, from, to),
    breakdowns(range, from, to),
  ]);

  return (
    <AdminShell
      title="Analytics"
      description="Every number here is a stored event. Nothing is sampled, estimated or made up."
      actions={<RangePicker active={range} />}
    >
      {range === "custom" && !custom ? (
        <p className="rounded-xl border-2 border-tang bg-tang/15 px-4 py-3 text-sm font-semibold">
          A custom range needs both a start and an end date.
        </p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat value={summary.views} label="Page views" hint="One per reader per article per day" tone="leaf" />
        <Stat value={summary.uniqueVisitors} label="Unique readers" hint="Hashed, daily salted, never stored raw" />
        <Stat value={summary.reads} label="Finished reads" hint="Reached three quarters of the article" />
        <Stat value={`${summary.completionRate}%`} label="Completion" hint={`${summary.completedSessions} of ${summary.sessions} sessions`} />
      </section>

      <section className="mt-6 sticker-flat p-5">
        <h2 className="font-display text-xl font-extrabold">Views over time</h2>
        <Sparkline data={series} label={`Views, ${range}`} />
        <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.12em] muted-soft">
          {summary.from.slice(0, 10)} to {summary.to.slice(0, 10)} UTC
        </p>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="sticker-flat p-5 lg:col-span-2">
          <h2 className="font-display text-xl font-extrabold">Articles</h2>
          {top.length ? (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-ink/15">
                    <th scope="col" className="py-2 font-mono text-[0.55rem] font-bold uppercase tracking-[0.12em] muted-soft">
                      Title
                    </th>
                    <th scope="col" className="py-2 text-right font-mono text-[0.55rem] font-bold uppercase tracking-[0.12em] muted-soft">
                      Views
                    </th>
                    <th scope="col" className="py-2 text-right font-mono text-[0.55rem] font-bold uppercase tracking-[0.12em] muted-soft">
                      Readers
                    </th>
                    <th scope="col" className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {top.map((row) => (
                    <tr key={row.id} className="border-b-2 border-ink/10 last:border-0">
                      <td className="max-w-[22rem] truncate py-2 font-semibold">{row.title}</td>
                      <td className="py-2 text-right font-mono text-xs">{row.views}</td>
                      <td className="py-2 text-right font-mono text-xs muted">{row.visitors}</td>
                      <td className="py-2 pl-3 text-right">
                        <Link
                          href={`/admin/analytics/${row.id}?range=${range}`}
                          className="inline-flex items-center gap-1 font-mono text-[0.55rem] font-bold uppercase tracking-[0.1em] underline decoration-2 underline-offset-4"
                        >
                          Detail
                          <Icon icon={ArrowRight01Icon} size={10} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-3 text-sm muted-soft">
              No views in this window. Publish something and share the link.
            </p>
          )}
        </section>

        <div className="flex flex-col gap-6">
          <section className="sticker-flat p-5">
            <h2 className="font-display text-lg font-extrabold">Referrers</h2>
            <div className="mt-3">
              <BarList items={splits.referrers} emptyLabel="Direct visits only so far." />
            </div>
          </section>
          <section className="sticker-flat p-5">
            <h2 className="font-display text-lg font-extrabold">Devices</h2>
            <div className="mt-3">
              <BarList items={splits.devices} emptyLabel="No device data yet." />
            </div>
          </section>
          <section className="sticker-flat p-5">
            <h2 className="font-display text-lg font-extrabold">Browsers</h2>
            <div className="mt-3">
              <BarList items={splits.browsers} emptyLabel="No browser data yet." />
            </div>
          </section>
        </div>
      </div>

      <Methodology />
    </AdminShell>
  );
}
