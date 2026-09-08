"use client";

import {
  ArrowLeft,
  Code2,
  Database,
  ExternalLink,
  FlaskConical,
  GitBranch,
  GraduationCap,
  UserRound
} from "lucide-react";
import { useEffect } from "react";
import { capabilities } from "@/data/capabilities";
import { education } from "@/data/education";
import { professionalExperience, skillApplications } from "@/data/professional-summary";
import { profile } from "@/data/profile";
import { ProfessionalContactActions } from "@/features/workspace/components/ProfessionalContactActions";
import { TechnologyList } from "@/features/workspace/components/TechnologyList";
import { isPortfolioValueConfigured } from "@/lib/portfolio-values";
import { withPortfolio3dBasePath } from "../asset-url";
import { useEmbeddedScreenScrollSession } from "../hooks/useEmbeddedScreenScrollSession";
import { usePortfolio3dState } from "../state/Portfolio3dState";

const domainIcon = {
  build: Code2,
  quality: FlaskConical,
  data: Database,
  delivery: GitBranch
} as const;

export function ProfileArtworkScreen({
  interactive
}: Readonly<{ interactive: boolean }>): React.ReactElement {
  const { scrollRef: contentRef, onScroll } = useEmbeddedScreenScrollSession(interactive);

  useEffect(() => {
    if (interactive) contentRef.current?.focus({ preventScroll: true });
  }, [contentRef, interactive]);

  return (
    <section className="profile-artwork-screen" aria-label="Profile">
      <header className="profile-artwork-heading">
        <UserRound size={22} aria-hidden="true" />
        <span>Profile</span>
        <span className="profile-artwork-heading-label">{profile.role}</span>
      </header>
      <div
        ref={contentRef}
        className="profile-artwork-content"
        tabIndex={interactive ? 0 : -1}
        onWheel={(event) => event.stopPropagation()}
        onScroll={onScroll}
      >
        <section className="profile-frame-identity" aria-labelledby="profile-frame-title">
          <p className="profile-frame-kicker">{profile.name}</p>
          <h2 id="profile-frame-title">Professional Profile</h2>
          <p className="profile-frame-headline">Development With a Quality Background</p>
          <p className="profile-frame-tagline">
            My experience spans financial applications, enterprise workflows, and software testing.
            I started in software engineering with Java and backend systems, then worked in manual
            testing, automation, and SDET roles before moving into full-stack development.
          </p>
          <p className="profile-frame-summary">
            Today, I work across application screens, APIs, and data workflows. That testing
            background shapes how I approach validation, access control, failure cases, and release
            readiness alongside feature development.
          </p>
          <dl className="profile-frame-facts">
            <div>
              <dt>Experience</dt>
              <dd>{profile.yearsOfExperience} in development &amp; quality</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{profile.location}</dd>
            </div>
            <div>
              <dt>Target</dt>
              <dd>{profile.availability}</dd>
            </div>
          </dl>
          <div className="profile-frame-actions">
            <ProfessionalContactActions />
            {isPortfolioValueConfigured(profile.contact.linkedIn.href) ? (
              <a
                className="profile-frame-text-link"
                href={profile.contact.linkedIn.href}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn profile <ExternalLink size={15} aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </section>

        <section
          className="profile-frame-capabilities"
          aria-labelledby="profile-frame-capabilities-title"
        >
          <header>
            <div>
              <p>core.skills</p>
              <h3 id="profile-frame-capabilities-title">Core Skills</h3>
            </div>
            <span>{capabilities.length} areas</span>
          </header>

          <div className="profile-frame-capability-list">
            {capabilities.map((capability) => {
              const Icon = domainIcon[capability.domain];
              const application = skillApplications[capability.domain];
              const role = professionalExperience.find(
                (item) => item.id === application.experienceId
              );

              return (
                <article key={capability.id} className="profile-frame-capability">
                  <header>
                    <Icon aria-hidden="true" size={20} />
                    <div>
                      <p>{capability.domain}</p>
                      <h4>{application.title}</h4>
                    </div>
                  </header>
                  <p className="profile-frame-capability-description">{application.example}</p>
                  {role ? (
                    <div className="profile-frame-capability-signal">
                      <span>Applied in</span>
                      <p>
                        {role.role} at {role.company}
                      </p>
                    </div>
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

        <section
          className="profile-frame-education"
          aria-labelledby="profile-frame-education-title"
        >
          <h3 id="profile-frame-education-title">
            <GraduationCap size={20} aria-hidden="true" />
            Education
          </h3>
          {education.map((credential) => (
            <div key={`${credential.institution}-${credential.degree}`}>
              <h4>{credential.degree}</h4>
              <p>{credential.institution}</p>
              <span>{credential.period}</span>
              <span>{credential.location}</span>
              <strong>GPA {credential.gpa}</strong>
            </div>
          ))}
        </section>
      </div>
    </section>
  );
}

export function ProfileArtworkControls(): React.ReactElement {
  const { setActiveSection } = usePortfolio3dState();

  return (
    <nav className="arcade-focus-controls" aria-label="Profile view controls">
      <button
        type="button"
        className="button-base button-secondary"
        onClick={() => setActiveSection("overview")}
      >
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Room
      </button>
      <a className="button-base button-secondary" href={withPortfolio3dBasePath("/profile")}>
        <ExternalLink size={18} aria-hidden="true" />
        Full Page
      </a>
    </nav>
  );
}
