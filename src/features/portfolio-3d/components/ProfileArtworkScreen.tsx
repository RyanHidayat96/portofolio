'use client';

import { ArrowLeft, Download, ExternalLink, Mail, UserRound } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { profile } from '@/data/profile';
import { withPortfolio3dBasePath } from '../asset-url';
import { usePortfolio3dState } from '../state/Portfolio3dState';

export function ProfileArtworkScreen({ interactive }: Readonly<{ interactive: boolean }>): React.ReactElement {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (interactive) headingRef.current?.focus({ preventScroll: true });
  }, [interactive]);

  return (
    <section className="profile-artwork-screen" aria-label="About Ryan Hidayat">
      <header className="profile-artwork-heading">
        <UserRound size={22} aria-hidden="true" />
        <span>About Me</span>
        <span className="profile-artwork-heading-label">Profile</span>
      </header>
      <div className="profile-artwork-content" tabIndex={interactive ? 0 : -1}>
        <p className="profile-artwork-kicker">Full Stack x SDET</p>
        <h2 ref={headingRef} tabIndex={-1}>{profile.name}</h2>
        <p className="profile-artwork-role">{profile.role} with SDET depth.</p>
        <p className="profile-artwork-summary">{profile.summary}</p>
        <div className="profile-artwork-tags" aria-label="Focus areas">
          {profile.focusAreas.slice(0, 4).map((focusArea) => <span key={focusArea}>{focusArea}</span>)}
        </div>
        <p className="profile-artwork-note">
          Career detail stays in the CV. This space keeps the engineering profile clear.
        </p>
        <div className="profile-artwork-actions">
          <a href={withPortfolio3dBasePath(profile.contact.cv.href)} target="_blank" rel="noopener noreferrer">
            <Download size={17} aria-hidden="true" />
            CV
          </a>
          <a href={profile.contact.email.href}>
            <Mail size={17} aria-hidden="true" />
            Contact
          </a>
        </div>
      </div>
    </section>
  );
}

export function ProfileArtworkControls(): React.ReactElement {
  const { setActiveSection } = usePortfolio3dState();

  return (
    <nav className="arcade-focus-controls" aria-label="About Me view controls">
      <button type="button" className="button-base button-secondary" onClick={() => setActiveSection('overview')}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Room
      </button>
      <a className="button-base button-secondary" href={withPortfolio3dBasePath('/workspace?section=profile')} target="_blank" rel="noopener noreferrer">
        <ExternalLink size={18} aria-hidden="true" />
        Full Page
      </a>
    </nav>
  );
}
