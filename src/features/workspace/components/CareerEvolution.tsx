import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { experience } from "@/data/experience";
import type { ExperienceRole } from "@/data/types";
import { cn } from "@/lib/cn";
import { ArrowRight, Building2, CheckCircle2 } from "lucide-react";

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
    <Panel className="career-evolution p-5 sm:p-7">
      <div className="career-evolution-header">
        <div>
          <p className="mono text-sm text-[var(--accent)]">career.evolution</p>
          <h1>Premium career timeline.</h1>
          <p>
            A concise public path from software engineering, into quality engineering, then current
            full-stack ownership.
          </p>
        </div>
        <Badge tone="success">Full Stack is current</Badge>
      </div>

      <div className="career-evolution-thesis" aria-label="Career thesis">
        <article>
          <Building2 aria-hidden="true" size={20} />
          <h2>Build foundation</h2>
          <p>Software engineering created the base: backend, APIs, SQL, and production support.</p>
        </article>
        <ArrowRight aria-hidden="true" className="career-evolution-arrow" size={22} />
        <article>
          <CheckCircle2 aria-hidden="true" size={20} />
          <h2>Quality instinct</h2>
          <p>
            SDET work added failure analysis, automation, performance, reports, and gate thinking.
          </p>
        </article>
      </div>

      <ol className="career-timeline" aria-label="Career timeline">
        {timelineItems.map(({ milestone, role }, index) => {
          const isCurrent = role.id === "jasa-marga-full-stack";

          return (
            <li key={role.id}>
              {index > 0 ? <span aria-hidden="true" className="career-timeline-connector" /> : null}
              <article className={cn("career-timeline-card", isCurrent && "is-current")}>
                <div className="career-timeline-card-top">
                  <span>{milestone.year}</span>
                  {isCurrent ? <Badge tone="success">Current</Badge> : null}
                </div>
                <p className="career-timeline-stage">{milestone.stage}</p>
                <h2>{role.role}</h2>
                <p className="career-timeline-company">{role.company}</p>
                <p className="career-timeline-period">{role.period}</p>
                <p className="career-timeline-story">{milestone.story}</p>
                <div>
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
        <section className="role-evolution" aria-label="Role evolution at Jasa Marga">
          <div>
            <p className="mono text-sm text-[var(--accent)]">jasa_marga.role_evolution</p>
            <h2>One company, broader ownership.</h2>
            <p>
              Same enterprise context, expanded from quality systems into current product delivery.
            </p>
          </div>
          <div className="role-evolution-grid">
            <RoleEvolutionCard role={sdetRole} label="Quality systems" />
            <div className="role-evolution-bridge">
              <ArrowRight aria-hidden="true" size={22} />
              <span>role growth</span>
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
    <article className={cn("role-evolution-card", isCurrent && "is-current")}>
      <div>
        <Badge tone={isCurrent ? "success" : "info"}>{label}</Badge>
        {isCurrent ? <Badge tone="success">Current</Badge> : null}
      </div>
      <h3>{role.role}</h3>
      <p className="role-evolution-period">{role.period}</p>
      <p>{role.impact[0]}</p>
    </article>
  );
}
