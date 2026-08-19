import Link from "next/link";

export default function NotFound(): React.ReactElement {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6 text-[var(--text-primary)]">
      <section className="max-w-md border border-[var(--border)] bg-[var(--panel)] p-6">
        <p className="mono text-sm text-[var(--warning)]">404 route missing</p>
        <h1 className="mt-3 text-2xl font-semibold">Workspace panel not found.</h1>
        <Link className="mt-5 inline-block text-sm font-semibold text-[var(--accent)]" href="/">
          Return to RyanOS
        </Link>
      </section>
    </main>
  );
}
