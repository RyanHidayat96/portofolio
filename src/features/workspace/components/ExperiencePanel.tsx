import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { profile } from "@/data/profile";
import { publicExperience } from "@/data/public-experience";
import { CareerEvolution } from "@/features/workspace/components/CareerEvolution";
import { EngineeringDNA } from "@/features/workspace/components/EngineeringDNA";
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
            <h2>Experience, public version.</h2>
            <p>Portfolio shows capability direction. CV carries exact companies, dates, and detail.</p>
          </div>
          {isPortfolioValueConfigured(cv.href) ? (
            <a className="button-base button-primary" href={cv.href} download="cv.pdf">
              <Download aria-hidden="true" size={18} />
              <span>Download CV</span>
            </a>
          ) : (
            <Badge tone="success">concise profile</Badge>
          )}
        </div>

        <div className="experience-history-list">
          {publicExperience.map((role) => (
            <article key={role.id} className="experience-history-card">
              <div className="experience-history-card-top">
                <div>
                  <div className="experience-history-title-row">
                    <h3>{role.role}</h3>
                  </div>
                  <p>High-level public summary</p>
                </div>
                <span>CV has detail</span>
              </div>

              <p className="experience-history-summary">{role.summary}</p>

              <div className="experience-history-stack">
                {role.technologies.map((technology) => (
                  <Badge key={technology}>{technology}</Badge>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}