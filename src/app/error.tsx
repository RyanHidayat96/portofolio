"use client";

export default function Error({
  reset
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>): React.ReactElement {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6 text-[var(--text-primary)]">
      <section className="max-w-md border border-[var(--border)] bg-[var(--panel)] p-6">
        <p className="mono text-sm text-[var(--danger)]">RyanOS fault boundary</p>
        <h1 className="mt-3 text-2xl font-semibold">Unable to render workspace.</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Retry reloads the current workspace state.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 border border-[var(--accent-strong)] px-4 py-2 text-sm font-semibold text-[var(--accent)]"
        >
          Retry
        </button>
      </section>
    </main>
  );
}
