import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { capabilities } from "@/data/capabilities";
import { experience } from "@/data/experience";
import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import type { Capability, EngineeringDomain } from "@/data/types";
import { cn } from "@/lib/cn";

type BadgeTone = "info" | "success" | "warning";

export function CapabilityMatrix({
  className
}: Readonly<{ className?: string }> = {}): React.ReactElement {
  return (
    <Panel className={cn("p-5 sm:p-7", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mono text-sm text-[var(--accent)]">capability.matrix</p>
          <h2 className="mt-2 text-3xl font-semibold">Engineering Capability Matrix</h2>
        </div>
        <Badge tone="info">No ratings, evidence only</Badge>
      </div>
      <p className="mt-4 max-w-4xl text-base leading-7 text-[#b7c2d2]">
        Skills grouped by how Ryan works: build product, connect data, protect quality, and ship
        reliably.
      </p>

      <div className="mt-7 grid gap-4 2xl:grid-cols-2">
        {capabilities.map((capability) => (
          <CapabilityCard key={capability.id} capability={capability} />
        ))}
      </div>
    </Panel>
  );
}

function CapabilityCard({ capability }: Readonly<{ capability: Capability }>): React.ReactElement {
  const skillGroup = skillGroups.find((group) => group.id === capability.domain);
  const relatedRoles = experience.filter((role) => capability.relatedExperience.includes(role.id));
  const relatedProjects = projects.filter((project) =>
    capability.relatedProjects.includes(project.slug)
  );
  const visibleTechnologies = capability.technologies.slice(0, 5);
  const hiddenTechnologyCount = capability.technologies.length - visibleTechnologies.length;
  const visibleSkills = skillGroup?.skills.slice(0, 2) ?? [];

  return (
    <article className="min-h-full border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge tone={getDomainTone(capability.domain)}>{capability.domain}</Badge>
          <h3 className="mt-3 text-2xl font-semibold">{capability.title}</h3>
        </div>
      </div>

      <dl className="mt-5 grid gap-4 text-sm">
        <div>
          <dt className="font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Used For
          </dt>
          <dd className="mt-2 leading-6 text-[#c8d4e6]">{capability.description}</dd>
        </div>

        <div>
          <dt className="font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Project Signal
          </dt>
          <dd className="mt-2 flex flex-wrap gap-2">
            {relatedProjects.slice(0, 2).map((project) => (
              <Badge key={project.slug} tone="info">
                {project.title}
              </Badge>
            ))}
          </dd>
        </div>
      </dl>

      <details className="mt-5 border border-[var(--border)] bg-[#0b1018] p-3">
        <summary className="cursor-pointer text-sm font-semibold text-[var(--accent)]">
          Show evidence
        </summary>
        <div className="mt-4 grid gap-3">
          {relatedRoles.slice(0, 2).map((role) => (
            <article
              key={role.id}
              className="border border-[var(--border)] bg-[var(--surface)] p-3"
            >
              <h4 className="font-semibold">{role.role}</h4>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{role.company}</p>
              <p className="mono mt-2 text-xs text-[var(--accent)]">{role.period}</p>
            </article>
          ))}
          {visibleSkills.map((skill) => (
            <article
              key={skill.name}
              className="border border-[var(--border)] bg-[var(--surface)] p-3"
            >
              <h4 className="font-semibold">{skill.name}</h4>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{skill.purpose}</p>
            </article>
          ))}
        </div>
      </details>

      <div className="mt-5 flex flex-wrap gap-2">
        {visibleTechnologies.map((technology) => (
          <Badge key={technology}>{technology}</Badge>
        ))}
        {hiddenTechnologyCount > 0 ? (
          <Badge tone="info">+{hiddenTechnologyCount} more</Badge>
        ) : null}
      </div>
    </article>
  );
}

function getDomainTone(domain: EngineeringDomain): BadgeTone {
  if (domain === "quality") {
    return "success";
  }

  if (domain === "delivery") {
    return "warning";
  }

  return "info";
}
