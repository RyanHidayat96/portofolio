import { education } from "@/data/education";
import { profile } from "@/data/profile";
import { CapabilityMatrix } from "@/features/workspace/components/CapabilityMatrix";
import { ProfessionalContactActions } from "@/features/workspace/components/ProfessionalContactActions";
import { isPortfolioValueConfigured } from "@/lib/portfolio-values";
import { ExternalLink, GraduationCap } from "lucide-react";

export function ProfilePanel(): React.ReactElement {
  return (
    <div className="professional-page">
      <section className="professional-section" aria-labelledby="profile-title">
        <div className="professional-section-heading">
          <div>
            <p className="professional-eyebrow">{profile.name}</p>
            <h1 id="profile-title">Professional Profile</h1>
          </div>
          <ProfessionalContactActions />
        </div>
        <div className="professional-profile-grid">
          <div className="professional-about">
            <h2>Development With a Quality Background</h2>
            <p>
              My experience spans financial applications, enterprise workflows, and software
              testing. I started in software engineering with Java and backend systems, then worked
              in manual testing, automation, and SDET roles before moving into full-stack
              development.
            </p>
            <p>
              Today, I work across application screens, APIs, and data workflows. That testing
              background shapes how I approach validation, access control, failure cases, and
              release readiness alongside feature development.
            </p>
            {isPortfolioValueConfigured(profile.contact.linkedIn.href) ? (
              <a
                className="professional-text-link"
                href={profile.contact.linkedIn.href}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn profile <ExternalLink size={16} aria-hidden="true" />
              </a>
            ) : null}
          </div>
          <section className="professional-education" aria-labelledby="profile-education">
            <h2 id="profile-education">
              <GraduationCap size={22} aria-hidden="true" /> Education
            </h2>
            {education.map((credential) => (
              <div key={`${credential.institution}-${credential.degree}`}>
                <h3>{credential.degree}</h3>
                <p>{credential.institution}</p>
                <p className="professional-context">{credential.period}</p>
                <p className="professional-context">{credential.location}</p>
                <p className="professional-gpa">GPA {credential.gpa}</p>
              </div>
            ))}
          </section>
        </div>
      </section>
      <CapabilityMatrix />
    </div>
  );
}
