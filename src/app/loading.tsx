import { branding } from "@/data/branding";

export default function Loading(): React.ReactElement {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] text-[var(--text-primary)]">
      <p className="mono text-sm text-[var(--accent)]">Loading {branding.appName}...</p>
    </main>
  );
}
