import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { capabilities } from "@/data/capabilities";
import { skillGroups } from "@/data/skills";
import type { Capability, EngineeringDomain } from "@/data/types";
import { cn } from "@/lib/cn";

const publicSignalByDomain: Readonly<Record<EngineeringDomain, string>> = {
  build: "Product screens, APIs, backend boundaries, and maintainable application flow.",
  quality: "Automation thinking, API checks, regression coverage, and release confidence.",
  data: "Data modeling, SQL validation, integrity checks, and reporting-friendly structures.",
  delivery: "CI/CD discipline, Dockerized execution, quality gates, and deploy-readiness signals."
};

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
        <Badge tone="info">Concise public view</Badge>
      </div>
      <p className="mt-4 max-w-3xl text-base leading-7 text-[#b7c2d2]">
        High-level strengths only. Full timeline, company context, and responsibility detail stay in
        the downloadable CV.
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
  const visibleTechnologies = capability.technologies.slice(0, 6);
  const hiddenTechnologyCount = capability.technologies.length - visibleTechnologies.length;
  const visibleSkills = skillGroup?.skills.slice(0, 3) ?? [];

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
            Used for
          </dt>
          <dd className="mt-2 leading-6 text-[#c8d4e6]">{capability.description}</dd>
        </div>

        <div>
          <dt className="font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Public signal
          </dt>
          <dd className="mt-2 leading-6 text-[#c8d4e6]">
            {publicSignalByDomain[capability.domain]}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-2" aria-label={`${capability.title} focus areas`}>
        {visibleSkills.map((skill) => (
          <Badge key={skill.name} tone={getDomainTone(capability.domain)}>
            {skill.name}
          </Badge>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {visibleTechnologies.map((technology) => (
          <Badge key={technology}>{technology}</Badge>
        ))}
        {hiddenTechnologyCount > 0 ? <Badge tone="info">+{hiddenTechnologyCount} more</Badge> : null}
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