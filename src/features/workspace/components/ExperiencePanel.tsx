import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { profile } from "@/data/profile";
import { publicExperience } from "@/data/public-experience";
import { CareerEvolution } from "@/features/workspace/components/CareerEvolution";
import { cn } from "@/lib/cn";
import { isPortfolioValueConfigured } from "@/lib/portfolio-values";

export function ExperiencePanel(): React.ReactElement {
  const cv = profile.contact.cv;

  return (
    <div className="grid gap-5">
      <CareerEvolution />

      <Panel className="p-5 sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mono text-sm text-[var(--accent)]">experience.summary</p>
            <h2 className="mt-2 text-3xl font-semibold">Work History</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#b7c2d2]">
              Short public version. Full responsibilities and project detail stay in CV.
            </p>
          </div>
          {isPortfolioValueConfigured(cv.href) ? (
            <a
              className="inline-flex min-h-[var(--touch-target)] items-center justify-center border border-[var(--accent-strong)] px-4 py-2 text-sm font-semibold text-[var(--accent)]"
              href={cv.href}
              download="cv.pdf"
            >
              Download CV
            </a>
          ) : (
            <Badge tone="success">verified career data</Badge>
          )}
        </div>

        <div className="mt-7 space-y-5">
          {publicExperience.map((role) => {
            const isCurrent = role.id === "jasa-marga-full-stack";

            return (
              <article
                key={role.id}
                className={cn(
                  "border p-5",
                  isCurrent
                    ? "border-[var(--accent-strong)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--surface)]"
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold">{role.role}</h3>
                      {isCurrent ? <Badge tone="success">Current</Badge> : null}
                    </div>
                    <p className="mt-1 text-[var(--text-muted)]">
                      {role.company} - {role.location}
                    </p>
                  </div>
                  <p className="mono text-sm text-[var(--accent)]">{role.period}</p>
                </div>

                <p className="mt-5 max-w-4xl text-sm leading-6 text-[#c8d4e6]">{role.summary}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {role.technologies.map((technology) => (
                    <Badge key={technology}>{technology}</Badge>
                  ))}
                  <Badge tone="info">More detail in CV</Badge>
                </div>
              </article>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
