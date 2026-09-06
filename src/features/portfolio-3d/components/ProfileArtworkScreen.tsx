'use client';

import { ArrowLeft, ExternalLink, UserRound } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ProfilePanel } from '@/features/workspace/components/ProfilePanel';
import { withPortfolio3dBasePath } from '../asset-url';
import { usePortfolio3dState } from '../state/Portfolio3dState';

export function ProfileArtworkScreen({ interactive }: Readonly<{ interactive: boolean }>): React.ReactElement {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (interactive) headingRef.current?.focus({ preventScroll: true });
  }, [interactive]);

  return (
    <section className="profile-artwork-screen" aria-label="Profile">
      <header className="profile-artwork-heading">
        <UserRound size={22} aria-hidden="true" />
        <span>Profile</span>
        <span className="profile-artwork-heading-label">Full Stack x SDET</span>
      </header>
      <div
        className="profile-artwork-content"
        tabIndex={interactive ? 0 : -1}
        onWheel={(event) => event.stopPropagation()}
      >
        <h2 ref={headingRef} className="sr-only" tabIndex={-1}>Profile</h2>
        <ProfilePanel />
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
