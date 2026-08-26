import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { profile } from "@/data/profile";
import { publicExperience } from "@/data/public-experience";
import { CareerEvolution } from "@/features/workspace/components/CareerEvolution";
import { EngineeringDNA } from "@/features/workspace/components/EngineeringDNA";
import { cn } from "@/lib/cn";
import { isPortfolioValueConfigured } from "@/lib/portfolio-values";
import { Download } from "lucide-react";

export function ExperiencePanel(): React.ReactElement {
  const cv = profile.contact.cv;

  return (
    <div className="experience-page">
      <CareerEvolution />
      <EngineeringDNA />

      <Panel className="experience-history p-5 sm:p-7">
        <div className="experience-history-header">
          <div>
            <p className="mono text-sm text-[var(--accent)]">experience.summary</p>
            <h2>Work history, short version.</h2>
            <p>Full responsibilities and project detail stay in CV.</p>
          </div>
          {isPortfolioValueConfigured(cv.href) ? (
            <a className="button-base button-primary" href={cv.href} download="cv.pdf">
              <Download aria-hidden="true" size={18} />
              <span>Download CV</span>
            </a>
          ) : (
            <Badge tone="success">verified career data</Badge>
          )}
        </div>

        <div className="experience-history-list">
          {publicExperience.map((role) => {
            const isCurrent = role.id === "jasa-marga-full-stack";

            return (
              <article
                key={role.id}
                className={cn("experience-history-card", isCurrent && "is-current")}
              >
                <div className="experience-history-card-top">
                  <div>
                    <div className="experience-history-title-row">
                      <h3>{role.role}</h3>
                      {isCurrent ? <Badge tone="success">Current</Badge> : null}
                    </div>
                    <p>{role.company}</p>
                  </div>
                  <span>{role.period}</span>
                </div>

                <p className="experience-history-summary">{role.summary}</p>

                <div className="experience-history-stack">
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
