'use client';

import { ArrowLeft, ExternalLink, GitBranch } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { PipelineSimulatorPanel } from '@/features/pipeline/components/PipelineSimulatorPanel';
import { usePortfolio3dState } from '../state/Portfolio3dState';
import { withPortfolio3dBasePath } from '../asset-url';
import { useEmbeddedScreenScrollSession } from '../hooks/useEmbeddedScreenScrollSession';

export function ArcadePipelineScreen({ interactive }: Readonly<{ interactive: boolean }>): React.ReactElement {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const { scrollRef, onScroll } = useEmbeddedScreenScrollSession(interactive);

  useEffect(() => {
    if (interactive) headingRef.current?.focus({ preventScroll: true });
  }, [interactive]);

  return (
    <section className="arcade-pipeline-screen" aria-label="Arcade pipeline simulator">
      <header className="arcade-pipeline-heading">
        <GitBranch size={22} aria-hidden="true" />
        <h2 ref={headingRef} tabIndex={-1}>Delivery pipeline</h2>
        <span className="arcade-simulation-label">Simulation</span>
      </header>
      <div
        ref={scrollRef}
        className="arcade-pipeline-scroll"
        tabIndex={interactive ? 0 : -1}
        aria-label="Pipeline controls and results"
        onScroll={onScroll}
      >
        <PipelineSimulatorPanel variant="screen" />
      </div>
    </section>
  );
}

export function ArcadePipelineControls(): React.ReactElement {
  const { setActiveSection } = usePortfolio3dState();
  return (
    <nav className="arcade-focus-controls" aria-label="Pipeline view controls">
      <button type="button" className="button-base button-secondary" onClick={() => setActiveSection('overview')}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Room
      </button>
      <a className="button-base button-secondary" href={withPortfolio3dBasePath('/labs/pipeline')}>
        <ExternalLink size={18} aria-hidden="true" />
        Full Page
      </a>
    </nav>
  );
}
