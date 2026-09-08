import { capabilities } from "@/data/capabilities";
import { professionalExperience, skillApplications } from "@/data/professional-summary";
import { TechnologyList } from "@/features/workspace/components/TechnologyList";
import { cn } from "@/lib/cn";
import { Code2, Database, FlaskConical, GitBranch } from "lucide-react";

const domainIcons = { build: Code2, quality: FlaskConical, data: Database, delivery: GitBranch };

export function CapabilityMatrix({
  className
}: Readonly<{ className?: string }> = {}): React.ReactElement {
  return (
    <section className={cn("professional-section", className)} aria-labelledby="profile-skills">
      <h2 id="profile-skills">Core Skills</h2>
      <div className="professional-skill-grid">
        {capabilities.map((capability) => {
          const application = skillApplications[capability.domain];
          const role = professionalExperience.find((item) => item.id === application.experienceId);
          const Icon = domainIcons[capability.domain];
          return (
            <article
              key={capability.id}
              className="professional-skill"
              data-domain={capability.domain}
            >
              <h3>
                <Icon size={20} aria-hidden="true" />
                {application.title}
              </h3>
              <p>{application.example}</p>
              {role ? (
                <p className="professional-context">
                  {role.role} at {role.company}
                </p>
              ) : null}
              <TechnologyList
                technologies={capability.technologies}
                label={`${application.title} technologies`}
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}
