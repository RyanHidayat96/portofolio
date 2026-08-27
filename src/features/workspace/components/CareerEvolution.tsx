import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { ArrowRight, Building2, CheckCircle2 } from "lucide-react";

interface CareerMilestone {
  readonly label: string;
  readonly stage: string;
  readonly domains: readonly string[];
  readonly story: string;
}

const careerMilestones: readonly CareerMilestone[] = [
  {
    label: "01",
    stage: "Software Engineering Foundation",
    domains: ["Build", "Backend", "Data"],
    story: "Application development foundation across backend, APIs, data, and production-minded troubleshooting."
  },
  {
    label: "02",
    stage: "Quality Engineering Depth",
    domains: ["Automation", "API", "Performance"],
    story: "Testing discipline evolved into automation, failure analysis, reporting, and release confidence."
  },
  {
    label: "03",
    stage: "Full-Cycle Ownership",
    domains: ["Full Stack", "Quality", "Delivery"],
    story: "This layer combines product build, data integrity, automation mindset, and delivery discipline."
  }
];

export function CareerEvolution(): React.ReactElement {
  return (
    <Panel className="career-evolution p-5 sm:p-7">
      <div className="career-evolution-header">
        <div>
          <p className="mono text-sm text-[var(--accent)]">career.evolution</p>
          <h1>Career shape, not resume detail.</h1>
          <p>
            Public portfolio keeps the path simple. Exact companies, dates, and responsibilities stay
            in the CV.
          </p>
        </div>
        <Badge tone="success">Full Stack x SDET</Badge>
      </div>

      <div className="career-evolution-thesis" aria-label="Career thesis">
        <article>
          <Building2 aria-hidden="true" size={20} />
          <h2>Build foundation</h2>
          <p>Application engineering, API thinking, backend work, and data flow.</p>
        </article>
        <ArrowRight aria-hidden="true" className="career-evolution-arrow" size={22} />
        <article>
          <CheckCircle2 aria-hidden="true" size={20} />
          <h2>Quality instinct</h2>
          <p>Automation, release confidence, failure analysis, and delivery gates.</p>
        </article>
      </div>

      <ol className="career-timeline" aria-label="Career capability timeline">
        {careerMilestones.map((milestone, index) => (
          <li key={milestone.stage}>
            {index > 0 ? <span aria-hidden="true" className="career-timeline-connector" /> : null}
            <article className="career-timeline-card">
              <div className="career-timeline-card-top">
                <span>{milestone.label}</span>
              </div>
              <p className="career-timeline-stage">Public capability path</p>
              <h2>{milestone.stage}</h2>
              <p className="career-timeline-story">{milestone.story}</p>
              <div>
                {milestone.domains.map((domain) => (
                  <Badge key={domain} tone="info">
                    {domain}
                  </Badge>
                ))}
              </div>
            </article>
          </li>
        ))}
      </ol>
    </Panel>
  );
}