/** One status vocabulary, rendered the same everywhere in the admin. */
export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "published"
      ? "bg-leaf text-bone"
      : status === "scheduled"
        ? "bg-lagoon text-night"
        : status === "archived"
          ? "bg-ink/10 text-ink"
          : "bg-tang text-night";
  return (
    <span
      className={`shrink-0 rounded-full border-2 border-ink px-2 py-0.5 font-mono text-[0.55rem] font-bold uppercase tracking-[0.12em] ${tone}`}
    >
      {status}
    </span>
  );
}
