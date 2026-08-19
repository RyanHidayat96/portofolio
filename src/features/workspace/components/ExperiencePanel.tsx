import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { experience } from "@/data/experience";

export function ExperiencePanel(): React.ReactElement {
  return (
    <Panel className="p-5 sm:p-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mono text-sm text-[var(--accent)]">experience.timeline</p>
          <h1 className="mt-2 text-3xl font-semibold">Professional Timeline</h1>
        </div>
        <Badge tone="warning">verified data needed</Badge>
      </div>

      <div className="mt-7 space-y-5">
        {experience.map((role) => (
          <article
            key={role.id}
            className="border-l-2 border-[var(--accent)] bg-[var(--surface)] p-5"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{role.role}</h2>
                <p className="mt-1 text-[var(--text-muted)]">
                  {role.company} • {role.location}
                </p>
              </div>
              <p className="mono text-sm text-[var(--accent)]">{role.period}</p>
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Responsibilities
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-[#c8d4e6]">
                  {role.responsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Impact
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-[#c8d4e6]">
                  {role.impact.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {role.technologies.map((technology) => (
                <Badge key={technology}>{technology}</Badge>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}
