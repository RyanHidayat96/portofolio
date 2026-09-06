'use client';

import { ArrowLeft, ExternalLink, Send } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ApiPlayground } from '@/features/api-playground/components/ApiPlayground';
import { withPortfolio3dBasePath } from '../asset-url';
import { usePortfolio3dState } from '../state/Portfolio3dState';

export function ApiMonitorScreen({ interactive }: Readonly<{ interactive: boolean }>): React.ReactElement {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (interactive) headingRef.current?.focus({ preventScroll: true });
  }, [interactive]);

  return (
    <section className="monitor-api-screen" aria-label="API playground monitor">
      <header className="monitor-api-heading">
        <Send size={22} aria-hidden="true" />
        <h2 ref={headingRef} tabIndex={-1}>API playground</h2>
        <span className="monitor-api-label">Live routes</span>
      </header>
      <div className="monitor-api-scroll" tabIndex={interactive ? 0 : -1} aria-label="API controls and results">
        <ApiPlayground variant="screen" />
      </div>
    </section>
  );
}

export function ApiMonitorControls(): React.ReactElement {
  const { setActiveSection } = usePortfolio3dState();

  return (
    <nav className="arcade-focus-controls" aria-label="API view controls">
      <button type="button" className="button-base button-secondary" onClick={() => setActiveSection('overview')}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Room
      </button>
      <a className="button-base button-secondary" href={withPortfolio3dBasePath('/workspace?section=api')} target="_blank" rel="noopener noreferrer">
        <ExternalLink size={18} aria-hidden="true" />
        Full Page
      </a>
    </nav>
  );
}
