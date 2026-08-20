import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { experience } from "@/data/experience";
import type { ExperienceRole } from "@/data/types";
import { cn } from "@/lib/cn";

interface CareerMilestone {
  readonly id: string;
  readonly year: string;
  readonly stage: string;
  readonly domains: readonly string[];
  readonly story: string;
}

const careerMilestones: readonly CareerMilestone[] = [
  {
    id: "adira-software-engineer",
    year: "2021",
    stage: "Software Engineering Foundation",
    domains: ["Build", "Backend", "Data"],
    story: "Built enterprise backend features, APIs, data fixes, and production support habits."
  },
  {
    id: "astra-sqa",
    year: "2022",
    stage: "Quality and Product Risk",
    domains: ["Quality", "API", "UAT"],
    story: "Moved closer to product behavior, release risk, test design, and automation coverage."
  },
  {
    id: "jasa-marga-sdet",
    year: "2025",
    stage: "Automation Architecture",
    domains: ["SDET", "Performance", "Delivery"],
    story: "Engineered automation systems, reports, device execution, and quality gate signals."
  },
  {
    id: "jasa-marga-full-stack",
    year: "2026",
    stage: "Full-Cycle Ownership",
    domains: ["Full Stack", "API", "Delivery"],
    story:
      "Returned to product build work with quality, data, and delivery discipline carried forward."
  }
];

const timelineItems = careerMilestones
  .map((milestone) => ({
    milestone,
    role: experience.find((item) => item.id === milestone.id)
  }))
  .filter((item): item is { readonly milestone: CareerMilestone; readonly role: ExperienceRole } =>
    Boolean(item.role)
  );

export function CareerEvolution(): React.ReactElement {
  const sdetRole = experience.find((role) => role.id === "jasa-marga-sdet");
  const fullStackRole = experience.find((role) => role.id === "jasa-marga-full-stack");

  return (
    <Panel className="p-5 sm:p-7">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mono text-sm text-[var(--accent)]">career.evolution</p>
          <h1 className="mt-2 text-3xl font-semibold">Career Evolution</h1>
        </div>
        <Badge tone="success">Full Stack is current</Badge>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <article className="border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="mono text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
            build.foundation
          </p>
          <p className="mt-3 text-xl font-semibold">
            Building software taught Ryan how systems are constructed.
          </p>
        </article>
        <article className="border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="mono text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
            quality.instinct
          </p>
          <p className="mt-3 text-xl font-semibold">
            Quality engineering taught Ryan where systems fail.
          </p>
        </article>
      </div>

      <ol className="mt-7 grid gap-4 lg:grid-cols-4">
        {timelineItems.map(({ milestone, role }, index) => {
          const isCurrent = role.id === "jasa-marga-full-stack";

          return (
            <li key={role.id} className="relative">
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className="absolute -top-4 left-6 h-4 w-px bg-[var(--accent-strong)] lg:-left-4 lg:top-12 lg:h-px lg:w-4"
                />
              ) : null}
              <article
                className={cn(
                  "min-h-full border p-4",
                  isCurrent
                    ? "border-[var(--accent-strong)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--surface)]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="mono text-2xl font-semibold text-[var(--accent)]">
                    {milestone.year}
                  </span>
                  {isCurrent ? <Badge tone="success">Current</Badge> : null}
                </div>
                <p className="mono mt-4 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  {milestone.stage}
                </p>
                <h2 className="mt-3 text-xl font-semibold">{role.role}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{role.company}</p>
                <p className="mono mt-3 text-xs text-[var(--accent)]">{role.period}</p>
                <p className="mt-4 text-sm leading-6 text-[#c8d4e6]">{milestone.story}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {milestone.domains.map((domain) => (
                    <Badge key={domain} tone={isCurrent ? "success" : "info"}>
                      {domain}
                    </Badge>
                  ))}
                </div>
              </article>
            </li>
          );
        })}
      </ol>

      {sdetRole && fullStackRole ? (
        <section className="mt-7 border border-[var(--accent-strong)] bg-[#080d14] p-5">
          <p className="mono text-sm text-[var(--accent)]">jasa_marga.role_evolution</p>
          <h2 className="mt-3 text-2xl font-semibold">PT Jasa Marga (Persero) Tbk</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_180px_1fr] lg:items-stretch">
            <RoleEvolutionCard role={sdetRole} label="Quality systems" />
            <div className="flex items-center justify-center border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
              <div>
                <p className="mono text-xs uppercase tracking-[0.2em] text-[var(--warning)]">
                  role evolution
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                  Sequential growth inside same company.
                </p>
              </div>
            </div>
            <RoleEvolutionCard role={fullStackRole} label="Product delivery" isCurrent />
          </div>
        </section>
      ) : null}
    </Panel>
  );
}

function RoleEvolutionCard({
  role,
  label,
  isCurrent = false
}: Readonly<{
  role: ExperienceRole;
  label: string;
  isCurrent?: boolean;
}>): React.ReactElement {
  return (
    <article
      className={cn(
        "border p-4",
        isCurrent
          ? "border-[var(--accent-strong)] bg-[var(--accent-soft)]"
          : "border-[var(--border)] bg-[var(--surface)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Badge tone={isCurrent ? "success" : "info"}>{label}</Badge>
        {isCurrent ? <Badge tone="success">Current</Badge> : null}
      </div>
      <h3 className="mt-4 text-xl font-semibold">{role.role}</h3>
      <p className="mono mt-3 text-sm text-[var(--accent)]">{role.period}</p>
      <p className="mt-4 text-sm leading-6 text-[#c8d4e6]">{role.impact[0]}</p>
    </article>
  );
}
