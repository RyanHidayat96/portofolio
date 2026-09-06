'use client';

import { ArrowLeft, ArrowRight, Briefcase, Building2, CheckCircle2, Code2, Database, ExternalLink, FlaskConical, GitBranch } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { capabilities } from '@/data/capabilities';
import { publicCareerEvolution } from '@/data/career-evolution';
import { publicExperience } from '@/data/public-experience';
import { withPortfolio3dBasePath } from '../asset-url';
import { usePortfolio3dState } from '../state/Portfolio3dState';

const domainIcon = {
  build: Code2,
  quality: FlaskConical,
  data: Database,
  delivery: GitBranch
} as const;

const operatingPrinciples = [
  'Build features with clear frontend, API, service, and data boundaries.',
  'Use quality signals to reduce release risk, not to create noise.',
  'Keep public portfolio details concise; CV carries deeper role detail.'
] as const;

export function ExperienceArtworkScreen({ interactive }: Readonly<{ interactive: boolean }>): React.ReactElement {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
    if (interactive) headingRef.current?.focus({ preventScroll: true });
  }, [interactive]);

  return (
    <section className={`experience-artwork-screen ${interactive ? 'experience-artwork-screen--focused' : 'experience-artwork-screen--ambient'}`} aria-label="Experience">
      <>
          <header className="experience-artwork-heading">
            <Briefcase size={22} aria-hidden="true" />
            <span>Experience</span>
            <span className="experience-artwork-heading-label">{publicCareerEvolution.badge}</span>
          </header>
          <div ref={contentRef} className="experience-artwork-content" tabIndex={0} onWheel={(event) => event.stopPropagation()}>
            <p className="experience-artwork-kicker">{publicCareerEvolution.kicker}</p>
            <h2 ref={headingRef} tabIndex={-1}>{publicCareerEvolution.title}</h2>
            <p className="experience-artwork-summary">{publicCareerEvolution.summary}</p>

            <div className="experience-artwork-thesis" aria-label="Career thesis">
              <article>
                <Building2 aria-hidden="true" size={20} />
                <div>
                  <h3>{publicCareerEvolution.thesis.build.title}</h3>
                  <p>{publicCareerEvolution.thesis.build.summary}</p>
                </div>
              </article>
              <ArrowRight aria-hidden="true" size={22} />
              <article>
                <CheckCircle2 aria-hidden="true" size={20} />
                <div>
                  <h3>{publicCareerEvolution.thesis.quality.title}</h3>
                  <p>{publicCareerEvolution.thesis.quality.summary}</p>
                </div>
              </article>
            </div>

            <ol className="experience-artwork-timeline" aria-label="Career capability timeline">
              {publicCareerEvolution.milestones.map((milestone, index) => (
                <li key={milestone.stage}>
                  {index > 0 ? <span aria-hidden="true" className="experience-artwork-timeline-connector" /> : null}
                  <article>
                    <span className="experience-artwork-timeline-index">{milestone.label}</span>
                    <p>Public capability path</p>
                    <h3>{milestone.stage}</h3>
                    <span className="experience-artwork-timeline-story">{milestone.story}</span>
                    <div>
                      {milestone.domains.map((domain) => <span key={domain}>{domain}</span>)}
                    </div>
                  </article>
                </li>
              ))}
            </ol>

            <section className="experience-artwork-section experience-artwork-dna" aria-labelledby="experience-artwork-dna-title">
              <header>
                <div>
                  <p>engineering.dna</p>
                  <h3 id="experience-artwork-dna-title">How Ryan works.</h3>
                  <span>Full-stack delivery shaped by quality engineering discipline.</span>
                </div>
                <strong>Build / Quality / Ship</strong>
              </header>
              <div className="experience-artwork-dna-grid">
                {capabilities.map((capability) => {
                  const Icon = domainIcon[capability.domain];

                  return (
                    <article key={capability.id}>
                      <Icon aria-hidden="true" size={18} />
                      <h4>{capability.title}</h4>
                      <p>{capability.description}</p>
                      <div>
                        {capability.technologies.slice(0, 4).map((technology) => <span key={technology}>{technology}</span>)}
                      </div>
                    </article>
                  );
                })}
              </div>
              <ol className="experience-artwork-principles">
                {operatingPrinciples.map((principle, index) => (
                  <li key={principle}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <p>{principle}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="experience-artwork-section experience-artwork-history" aria-labelledby="experience-artwork-history-title">
              <header>
                <div>
                  <p>experience.summary</p>
                  <h3 id="experience-artwork-history-title">Experience, public version.</h3>
                  <span>Portfolio shows capability direction. CV carries exact companies, dates, and detail.</span>
                </div>
              </header>
              <div className="experience-artwork-history-list">
                {publicExperience.map((role) => (
                  <article key={role.id}>
                    <div>
                      <h4>{role.role}</h4>
                      <span>CV has detail</span>
                    </div>
                    <p>{role.summary}</p>
                    <div>
                      {role.technologies.map((technology) => <span key={technology}>{technology}</span>)}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
      </>
    </section>
  );
}

export function ExperienceArtworkControls(): React.ReactElement {
  const { setActiveSection } = usePortfolio3dState();

  return (
    <nav className="arcade-focus-controls" aria-label="Experience view controls">
      <button type="button" className="button-base button-secondary" onClick={() => setActiveSection('overview')}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Room
      </button>
      <a className="button-base button-secondary" href={withPortfolio3dBasePath('/experience')}>
        <ExternalLink size={18} aria-hidden="true" />
        Full Page
      </a>
    </nav>
  );
}
