'use client';

import { ArrowLeft, Code2, Database, ExternalLink, FlaskConical, GitBranch, UserRound } from 'lucide-react';
import { useEffect } from 'react';
import { capabilities } from '@/data/capabilities';
import { profile } from '@/data/profile';
import { skillGroups } from '@/data/skills';
import type { EngineeringDomain } from '@/data/types';
import { withPortfolio3dBasePath } from '../asset-url';
import { useEmbeddedScreenScrollSession } from '../hooks/useEmbeddedScreenScrollSession';
import { usePortfolio3dState } from '../state/Portfolio3dState';

const domainIcon = {
  build: Code2,
  quality: FlaskConical,
  data: Database,
  delivery: GitBranch
} as const;

const publicSignalByDomain: Readonly<Record<EngineeringDomain, string>> = {
  build: 'Product screens, APIs, backend boundaries, and maintainable application flow.',
  quality: 'Automation thinking, API checks, regression coverage, and release confidence.',
  data: 'Data modeling, SQL validation, integrity checks, and reporting-friendly structures.',
  delivery: 'CI/CD discipline, Dockerized execution, quality gates, and deploy-readiness signals.'
};

export function ProfileArtworkScreen({ interactive }: Readonly<{ interactive: boolean }>): React.ReactElement {
  const { scrollRef: contentRef, onScroll } = useEmbeddedScreenScrollSession(interactive);

  useEffect(() => {
    if (interactive) contentRef.current?.focus({ preventScroll: true });
  }, [contentRef, interactive]);

  return (
    <section className="profile-artwork-screen" aria-label="Profile">
      <header className="profile-artwork-heading">
        <UserRound size={22} aria-hidden="true" />
        <span>Profile</span>
        <span className="profile-artwork-heading-label">Full Stack x SDET</span>
      </header>
      <div
        ref={contentRef}
        className="profile-artwork-content"
        tabIndex={interactive ? 0 : -1}
        onWheel={(event) => event.stopPropagation()}
        onScroll={onScroll}
      >
        <section className="profile-frame-identity" aria-labelledby="profile-frame-name">
          <p className="profile-frame-kicker">whoami</p>
          <h2 id="profile-frame-name">{profile.name}</h2>
          <p className="profile-frame-headline">{profile.headline}</p>
          <p className="profile-frame-tagline">{profile.tagline}</p>
          <p className="profile-frame-summary">{profile.summary}</p>
          <dl className="profile-frame-facts">
            <div>
              <dt>Experience</dt>
              <dd>{profile.yearsOfExperience}</dd>
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
        </section>

        <section className="profile-frame-public-note" aria-labelledby="profile-frame-public-note-title">
          <p id="profile-frame-public-note-title">Public profile summary</p>
          <span>Portfolio keeps personal history concise. Education, exact work timeline, and deeper responsibility detail are available in the downloadable CV.</span>
        </section>

        <section className="profile-frame-capabilities" aria-labelledby="profile-frame-capabilities-title">
          <header>
            <div>
              <p>capability.matrix</p>
              <h3 id="profile-frame-capabilities-title">Engineering Capability Matrix</h3>
            </div>
            <span>Concise public view</span>
          </header>
          <p className="profile-frame-capabilities-summary">High-level strengths only. Full timeline, company context, and responsibility detail stay in the downloadable CV.</p>

          <div className="profile-frame-capability-list">
            {capabilities.map((capability) => {
              const Icon = domainIcon[capability.domain];
              const skillGroup = skillGroups.find((group) => group.id === capability.domain);

              return (
                <article key={capability.id} className="profile-frame-capability">
                  <header>
                    <Icon aria-hidden="true" size={20} />
                    <div>
                      <p>{capability.domain}</p>
                      <h4>{capability.title}</h4>
                    </div>
                  </header>
                  <p className="profile-frame-capability-description">{capability.description}</p>
                  <div className="profile-frame-capability-signal">
                    <span>Public signal</span>
                    <p>{publicSignalByDomain[capability.domain]}</p>
                  </div>
                  {skillGroup ? (
                    <div className="profile-frame-skill-list" aria-label={`${capability.title} focus areas`}>
                      {skillGroup.skills.map((skill) => <span key={skill.name}>{skill.name}</span>)}
                    </div>
                  ) : null}
                  <details className="profile-frame-stack">
                    <summary>Stack · {capability.technologies.length}</summary>
                    <div>
                      {capability.technologies.map((technology) => <span key={technology}>{technology}</span>)}
                    </div>
                  </details>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
}

export function ProfileArtworkControls(): React.ReactElement {
  const { setActiveSection } = usePortfolio3dState();

  return (
    <nav className="arcade-focus-controls" aria-label="Profile view controls">
      <button type="button" className="button-base button-secondary" onClick={() => setActiveSection('overview')}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Room
      </button>
      <a className="button-base button-secondary" href={withPortfolio3dBasePath('/profile')}>
        <ExternalLink size={18} aria-hidden="true" />
        Full Page
      </a>
    </nav>
  );
}
