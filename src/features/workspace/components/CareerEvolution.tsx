import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { publicCareerEvolution } from "@/data/career-evolution";
import { ArrowRight, Building2, CheckCircle2 } from "lucide-react";

export function CareerEvolution(): React.ReactElement {
  return (
    <Panel className="career-evolution p-5 sm:p-7">
      <div className="career-evolution-header">
        <div>
          <p className="mono text-sm text-[var(--accent)]">{publicCareerEvolution.kicker}</p>
          <h1>{publicCareerEvolution.title}</h1>
          <p>{publicCareerEvolution.summary}</p>
        </div>
        <Badge tone="success">{publicCareerEvolution.badge}</Badge>
      </div>

      <div className="career-evolution-thesis" aria-label="Career thesis">
        <article>
          <Building2 aria-hidden="true" size={20} />
          <h2>{publicCareerEvolution.thesis.build.title}</h2>
          <p>{publicCareerEvolution.thesis.build.summary}</p>
        </article>
        <ArrowRight aria-hidden="true" className="career-evolution-arrow" size={22} />
        <article>
          <CheckCircle2 aria-hidden="true" size={20} />
          <h2>{publicCareerEvolution.thesis.quality.title}</h2>
          <p>{publicCareerEvolution.thesis.quality.summary}</p>
        </article>
      </div>

      <ol className="career-timeline" aria-label="Career capability timeline">
        {publicCareerEvolution.milestones.map((milestone, index) => (
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
