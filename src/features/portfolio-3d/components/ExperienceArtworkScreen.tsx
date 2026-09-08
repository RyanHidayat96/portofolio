"use client";

import { ArrowLeft, Briefcase, Building2, ExternalLink } from "lucide-react";
import { useEffect } from "react";
import { professionalExperience } from "@/data/professional-summary";
import { ProfessionalContactActions } from "@/features/workspace/components/ProfessionalContactActions";
import { TechnologyList } from "@/features/workspace/components/TechnologyList";
import { withPortfolio3dBasePath } from "../asset-url";
import { useEmbeddedScreenScrollSession } from "../hooks/useEmbeddedScreenScrollSession";
import { usePortfolio3dState } from "../state/Portfolio3dState";

export function ExperienceArtworkScreen({
  interactive
}: Readonly<{ interactive: boolean }>): React.ReactElement {
  const { scrollRef: contentRef, onScroll } = useEmbeddedScreenScrollSession(interactive);

  useEffect(() => {
    if (interactive) contentRef.current?.focus({ preventScroll: true });
  }, [contentRef, interactive]);

  return (
    <section
      className={`experience-artwork-screen ${
        interactive ? "experience-artwork-screen--focused" : "experience-artwork-screen--ambient"
      }`}
      aria-label="Experience"
    >
      <header className="experience-artwork-heading">
        <Briefcase size={22} aria-hidden="true" />
        <h2>Experience</h2>
        <span className="experience-artwork-heading-label">Most recent first</span>
      </header>
      <div
        ref={contentRef}
        className="experience-artwork-content"
        tabIndex={interactive ? 0 : -1}
        onWheel={(event) => event.stopPropagation()}
        onScroll={onScroll}
      >
        <p className="experience-artwork-kicker">Professional Experience</p>
        <h2>Work Experience</h2>
        <p className="experience-artwork-summary">
          Software development, test automation, and enterprise delivery.
        </p>
        <div className="experience-frame-actions">
          <ProfessionalContactActions />
        </div>

        <ol
          className="experience-artwork-role-list"
          aria-label="Work experience, most recent first"
        >
          {professionalExperience.map((role) => (
            <li key={role.id}>
              <article
                className="experience-artwork-role"
                aria-labelledby={`room-experience-${role.id}`}
              >
                <div className="experience-artwork-role-meta">
                  <span>{role.period}</span>
                  <span>{role.location}</span>
                </div>
                <div className="experience-artwork-role-body">
                  <h3 id={`room-experience-${role.id}`}>{role.role}</h3>
                  <p className="experience-artwork-company">
                    <Building2 size={16} aria-hidden="true" />
                    {role.company}
                  </p>
                  <p>{role.summary}</p>
                  <ul className="experience-artwork-contributions">
                    {role.contributions.map((contribution) => (
                      <li key={contribution}>{contribution}</li>
                    ))}
                  </ul>
                  {role.outcome ? (
                    <p className="experience-artwork-outcome">
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
    </section>
  );
}

export function ExperienceArtworkControls(): React.ReactElement {
  const { setActiveSection } = usePortfolio3dState();

  return (
    <nav className="arcade-focus-controls" aria-label="Experience view controls">
      <button
        type="button"
        className="button-base button-secondary"
        onClick={() => setActiveSection("overview")}
      >
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Room
      </button>
      <a className="button-base button-secondary" href={withPortfolio3dBasePath("/experience")}>
        <ExternalLink size={18} aria-hidden="true" />
        Full Page
      </a>
    </nav>
  );
}
