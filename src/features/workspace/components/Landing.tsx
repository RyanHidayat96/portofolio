import { Button } from "@/components/ui/Button";
import { profile } from "@/data/profile";
import { isPortfolioValueConfigured } from "@/lib/portfolio-values";
import { Activity, FileText, Power, UserRound } from "lucide-react";

export function Landing({
  hasBooted,
  onInitialize,
  onViewProfile
}: Readonly<{
  hasBooted: boolean;
  onInitialize: () => void;
  onViewProfile: () => void;
}>): React.ReactElement {
  const cvLink = profile.contact.cv;
  const hasCv = isPortfolioValueConfigured(cvLink.value) && isPortfolioValueConfigured(cvLink.href);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[var(--text-primary)]">
      <div aria-hidden="true" className="engineering-grid absolute inset-0 opacity-70" />
      <section className="relative z-10 flex min-h-screen items-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-6xl">
          <div className="mono mb-8 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.26em] text-[var(--accent)]">
            <span>RyanOS</span>
            <span className="h-px w-12 bg-[var(--accent-strong)]" />
            <span>SDET Workspace</span>
          </div>

          <h1 className="max-w-5xl text-5xl font-semibold leading-none sm:text-7xl lg:text-8xl">
            {profile.name.toUpperCase()}
          </h1>
          <p className="mt-7 max-w-3xl text-3xl font-semibold leading-tight text-[var(--text-primary)] sm:text-5xl">
            I don&apos;t just test software.
            <span className="block text-[var(--accent)]">I engineer confidence.</span>
          </p>
          <p className="mt-6 text-base text-[var(--text-muted)] sm:text-lg">{profile.headline}</p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primary"
              icon={<Power aria-hidden="true" size={18} />}
              onClick={onInitialize}
              className="w-full sm:w-auto"
            >
              {hasBooted ? "ENTER WORKSPACE" : "INITIALIZE PORTFOLIO"}
            </Button>
            <Button
              variant="secondary"
              icon={<UserRound aria-hidden="true" size={18} />}
              onClick={onViewProfile}
              className="w-full sm:w-auto"
            >
              VIEW PROFILE
            </Button>
            {hasCv ? (
              <a
                href={cvLink.href}
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 border border-transparent px-4 py-2 text-sm font-semibold text-[var(--text-muted)] transition hover:border-[var(--border)] hover:text-[var(--text-primary)] sm:w-auto"
              >
                <FileText aria-hidden="true" size={18} />
                <span>DOWNLOAD CV</span>
              </a>
            ) : null}
          </div>

          <div className="mt-12 grid gap-3 text-sm text-[var(--text-muted)] sm:grid-cols-3">
            <div className="border border-[var(--border)] bg-[var(--surface-translucent)] p-4">
              <Activity className="mb-4 text-[var(--success)]" aria-hidden="true" size={20} />
              <p className="font-semibold text-[var(--text-primary)]">System Status</p>
              <p className="mt-1">Available</p>
            </div>
            <div className="border border-[var(--border)] bg-[var(--surface-translucent)] p-4">
              <p className="mono text-[var(--accent)]">focus --primary</p>
              <p className="mt-3 text-[var(--text-primary)]">
                Automation reliability and release confidence.
              </p>
            </div>
            <div className="border border-[var(--border)] bg-[var(--surface-translucent)] p-4">
              <p className="mono text-[#b18cff]">mode --fast</p>
              <p className="mt-3 text-[var(--text-primary)]">
                Professional summary in 30-60 seconds.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
