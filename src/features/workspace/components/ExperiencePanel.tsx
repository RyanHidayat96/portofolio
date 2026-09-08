import { professionalExperience } from "@/data/professional-summary";
import { ProfessionalContactActions } from "@/features/workspace/components/ProfessionalContactActions";
import { TechnologyList } from "@/features/workspace/components/TechnologyList";

export function ExperiencePanel(): React.ReactElement {
  return (
    <div className="professional-page">
      <header className="professional-section-heading professional-experience-intro">
        <div>
          <h1>Work Experience</h1>
          <p className="professional-lead">
            Software development, test automation, and enterprise delivery.
          </p>
        </div>
        <ProfessionalContactActions />
      </header>
      <ol className="professional-history" aria-label="Work experience, most recent first">
        {professionalExperience.map((role) => (
          <li key={role.id}>
            <article className="professional-job" aria-labelledby={`experience-${role.id}`}>
              <div className="professional-job-meta">
                <p>{role.period}</p>
                <p>{role.location}</p>
              </div>
              <div className="professional-job-content">
                <h2 id={`experience-${role.id}`}>{role.role}</h2>
                <p className="professional-company">{role.company}</p>
                <p>{role.summary}</p>
                <ul className="professional-contributions">
                  {role.contributions.map((contribution) => (
                    <li key={contribution}>{contribution}</li>
                  ))}
                </ul>
                {role.outcome ? (
                  <p className="professional-outcome">
                    <strong>Contribution:</strong> {role.outcome}
                  </p>
                ) : null}
                <TechnologyList
                  technologies={role.technologies}
                  label={`${role.role} technologies`}
                />
              </div>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
