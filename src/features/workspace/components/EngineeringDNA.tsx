import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { capabilities } from "@/data/capabilities";
import type { EngineeringDomain } from "@/data/types";
import { Code2, Database, FlaskConical, GitBranch } from "lucide-react";

const domainIcon: Record<EngineeringDomain, typeof Code2> = {
  build: Code2,
  quality: FlaskConical,
  data: Database,
  delivery: GitBranch
};

const operatingPrinciples: readonly string[] = [
  "Build features with clear frontend, API, service, and data boundaries.",
  "Use quality signals to reduce release risk, not to create noise.",
  "Keep public portfolio details concise; CV carries deeper role detail."
];

export function EngineeringDNA(): React.ReactElement {
  return (
    <Panel className="engineering-dna p-5 sm:p-7">
      <div className="engineering-dna-header">
        <div>
          <p className="mono text-sm text-[var(--accent)]">engineering.dna</p>
          <h2>How Ryan works.</h2>
          <p>Full-stack delivery shaped by quality engineering discipline.</p>
        </div>
        <Badge tone="info">Build / Quality / Ship</Badge>
      </div>

      <div className="engineering-dna-grid">
        {capabilities.map((capability) => {
          const Icon = domainIcon[capability.domain];
          return (
            <article key={capability.id}>
              <Icon aria-hidden="true" size={20} />
              <h3>{capability.title}</h3>
              <p>{capability.description}</p>
              <div>
                {capability.technologies.slice(0, 4).map((technology) => (
                  <Badge key={technology}>{technology}</Badge>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      <section className="engineering-dna-principles" aria-label="Operating principles">
        <h3>Operating principles</h3>
        <ol>
          {operatingPrinciples.map((principle, index) => (
            <li key={principle}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{principle}</p>
            </li>
          ))}
        </ol>
      </section>
    </Panel>
  );
}
