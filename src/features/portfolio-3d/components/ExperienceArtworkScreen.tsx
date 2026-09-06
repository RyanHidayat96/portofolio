'use client';

import { ArrowLeft, Briefcase, Download, ExternalLink } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { profile } from '@/data/profile';
import { publicExperience } from '@/data/public-experience';
import { withPortfolio3dBasePath } from '../asset-url';
import { usePortfolio3dState } from '../state/Portfolio3dState';

export function ExperienceArtworkScreen({ interactive }: Readonly<{ interactive: boolean }>): React.ReactElement {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (interactive) headingRef.current?.focus({ preventScroll: true });
  }, [interactive]);

  return (
    <section className={`experience-artwork-screen ${interactive ? 'experience-artwork-screen--focused' : 'experience-artwork-screen--ambient'}`} aria-label="Experience">
      {interactive ? (
        <>
          <header className="experience-artwork-heading">
            <Briefcase size={22} aria-hidden="true" />
            <span>Experience</span>
            <span className="experience-artwork-heading-label">Career shape</span>
          </header>
          <div className="experience-artwork-content" tabIndex={0}>
            <p className="experience-artwork-kicker">Full Stack x SDET</p>
            <h2 ref={headingRef} tabIndex={-1}>Built across the full cycle.</h2>
            <p className="experience-artwork-summary">
              A public view of the engineering capabilities that connect product delivery, quality, and release confidence.
            </p>
            <ol className="experience-artwork-path" aria-label="Public experience path">
              {publicExperience.map((entry, index) => (
                <li key={entry.id}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <strong>{entry.role}</strong>
                    <p>{entry.summary}</p>
                    <small>{entry.technologies.slice(0, 3).join('  /  ')}</small>
                  </div>
                </li>
              ))}
            </ol>
            <p className="experience-artwork-note">
              Employers, dates, and role-by-role detail remain in the CV.
            </p>
            <a className="experience-artwork-cv" href={withPortfolio3dBasePath(profile.contact.cv.href)} target="_blank" rel="noopener noreferrer">
              <Download size={17} aria-hidden="true" />
              View CV
            </a>
          </div>
        </>
      ) : (
        <div className="experience-artwork-ambient" aria-hidden="true">
          <div className="experience-artwork-ambient-meta">
            <span>Experience</span>
            <strong>01 - 03</strong>
          </div>
          <h2><span>Build.</span><span>Quality.</span><span>Ship.</span></h2>
          <div className="experience-artwork-ambient-path">
            {publicExperience.map((entry, index) => (
              <span key={entry.id}><small>{String(index + 1).padStart(2, '0')}</small>{entry.role}</span>
            ))}
          </div>
          <p>Career shape</p>
        </div>
      )}
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
      <a className="button-base button-secondary" href={withPortfolio3dBasePath('/workspace?section=experience')} target="_blank" rel="noopener noreferrer">
        <ExternalLink size={18} aria-hidden="true" />
        Full Page
      </a>
    </nav>
  );
}
