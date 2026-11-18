/**
 * METHODOLOGY. Shown on the analytics screen rather than buried in a doc,
 * because a number you cannot explain is a number you should not trust.
 */
export function Methodology() {
  return (
    <section className="mt-10 rounded-2xl border-[2.5px] border-ink/25 p-5">
      <h2 className="font-display text-lg font-extrabold">How these numbers are counted</h2>
      <dl className="mt-3 grid gap-4 text-sm leading-relaxed sm:grid-cols-2">
        <div>
          <dt className="font-bold">A view</dt>
          <dd className="opacity-75">
            One per reader, per article, per day. A reload in the same tab, or coming back later
            the same day, does not add a second view.
          </dd>
        </div>
        <div>
          <dt className="font-bold">A read</dt>
          <dd className="opacity-75">
            Sent once when a reader scrolls past three quarters of the article. Completion is
            reads divided by sessions, so it measures reaching the end, not opening.
          </dd>
        </div>
        <div>
          <dt className="font-bold">A unique reader</dt>
          <dd className="opacity-75">
            A SHA-256 hash of your IP and user agent with a salt that changes every day. It cannot
            be reversed into an identity, and yesterday&apos;s hash does not match today&apos;s, so
            nobody can be followed across days.
          </dd>
        </div>
        <div>
          <dt className="font-bold">What is excluded</dt>
          <dd className="opacity-75">
            Bots and crawlers, requests with no user agent, and any traffic from a browser holding
            a valid admin session. Your own visits never inflate your own numbers.
          </dd>
        </div>
        <div>
          <dt className="font-bold">Sessions</dt>
          <dd className="opacity-75">
            A random id kept in sessionStorage, so it lasts one tab and one visit. No cookie, and
            nothing that follows a reader to any other site.
          </dd>
        </div>
        <div>
          <dt className="font-bold">Time</dt>
          <dd className="opacity-75">
            All windows are UTC days. A &quot;day&quot; in these charts starts at midnight UTC.
          </dd>
        </div>
      </dl>
    </section>
  );
}
