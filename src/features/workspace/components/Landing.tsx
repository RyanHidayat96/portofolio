import { Button } from "@/components/ui/Button";
import { branding } from "@/data/branding";
import { experience } from "@/data/experience";
import { profile } from "@/data/profile";
import { isPortfolioValueConfigured } from "@/lib/portfolio-values";
import { Activity, ExternalLink, FileText, Power, UserRound } from "lucide-react";

export function Landing({
  onInitialize,
  onRecruiterMode
}: Readonly<{
  onInitialize: () => void;
  onRecruiterMode: () => void;
}>): React.ReactElement {
  const cvLink = profile.contact.cv;
  const linkedInLink = profile.contact.linkedIn;
  const hasCv = isPortfolioValueConfigured(cvLink.value) && isPortfolioValueConfigured(cvLink.href);
  const hasLinkedIn =
    isPortfolioValueConfigured(linkedInLink.value) && isPortfolioValueConfigured(linkedInLink.href);
  const currentRole = experience.find((role) => role.id === "jasa-marga-full-stack");
  const ctaLinkClass =
    "inline-flex min-h-[var(--touch-target)] w-full items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent-strong)] sm:w-auto";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[var(--text-primary)]">
      <div aria-hidden="true" className="engineering-grid absolute inset-0 opacity-70" />
      <section className="relative z-10 flex min-h-screen items-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="grid w-full max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div>
            <div className="mono mb-8 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.26em] text-[var(--accent)]">
              <span>{branding.appName}</span>
              <span className="h-px w-12 bg-[var(--accent-strong)]" />
              <span>{branding.workspaceLabel}</span>
            </div>

            <h1 className="max-w-5xl text-5xl font-semibold leading-none sm:text-7xl lg:text-8xl">
              {profile.name.toUpperCase()}
            </h1>
            <p className="mono mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent)] sm:text-base">
              {profile.headline}
            </p>
            <p className="mt-7 max-w-3xl text-3xl font-semibold leading-tight text-[var(--text-primary)] sm:text-5xl">
              {branding.heroStatementLead}
              <span className="block text-[var(--accent)]">{branding.heroStatementAccent}</span>
            </p>
            <p className="mt-6 max-w-3xl text-base leading-7 text-[var(--text-muted)] sm:text-lg">
              Full Stack Developer building enterprise applications across frontend, backend, APIs,
              databases, test automation, performance engineering, and CI/CD delivery.
            </p>

            <div className="mt-8 grid max-w-3xl gap-3 text-sm text-[var(--text-muted)] sm:grid-cols-3">
              <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-translucent)] p-4">
                <p className="mono text-[var(--accent)]">current_role</p>
                <p className="mt-3 font-semibold text-[var(--text-primary)]">
                  {currentRole?.role ?? profile.role}
                </p>
                <p className="mt-1">{currentRole?.period ?? "Mar 2026 - Present"}</p>
              </div>
              <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-translucent)] p-4">
                <p className="mono text-[var(--accent)]">differentiator</p>
                <p className="mt-3 font-semibold text-[var(--text-primary)]">
                  Build software + engineer quality
                </p>
              </div>
              <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-translucent)] p-4">
                <Activity className="mb-3 text-[var(--success)]" aria-hidden="true" size={20} />
                <p className="font-semibold text-[var(--text-primary)]">Available</p>
                <p className="mt-1">{profile.location}</p>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                variant="primary"
                icon={<Power aria-hidden="true" size={18} />}
                onClick={onInitialize}
                className="w-full sm:w-auto"
              >
                Explore RyanOS
              </Button>
              <Button
                variant="secondary"
                icon={<UserRound aria-hidden="true" size={18} />}
                onClick={onRecruiterMode}
                className="w-full sm:w-auto"
              >
                Recruiter Mode
              </Button>
              {hasCv ? (
                <a href={cvLink.href} download="cv.pdf" className={ctaLinkClass}>
                  <FileText aria-hidden="true" size={18} />
                  <span>Download CV</span>
                </a>
              ) : null}
              {hasLinkedIn ? (
                <a
                  href={linkedInLink.href}
                  className={ctaLinkClass}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLink aria-hidden="true" size={18} />
                  <span>LinkedIn</span>
                </a>
              ) : null}
            </div>
          </div>

          <aside
            aria-label="CLI identity snapshot"
            className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[#080c12]/90 p-5 shadow-[0_0_40px_rgba(85,215,255,0.08)] sm:p-6"
          >
            <p className="mono text-xs text-[var(--accent)]">ryan@portfolio:~$ whoami</p>
            <div className="mt-5 border-l border-[var(--accent-strong)] pl-4">
              <p className="text-xl font-semibold">{profile.name}</p>
              <p className="mt-1 text-sm text-[var(--accent)]">{profile.headline}</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{profile.location}</p>
            </div>

            <div className="mono mt-6 space-y-2 text-sm leading-6 text-[#c8d4e6]">
              {[
                "> building enterprise applications",
                "> engineering APIs and data flows",
                "> automating quality at scale",
                "> shipping through CI/CD"
              ].map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            <div className="mt-6 border-t border-[var(--border)] pt-5">
              <p className="mono text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                status
              </p>
              <p className="mono mt-2 text-sm text-[var(--success)]">available_for_opportunities</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
