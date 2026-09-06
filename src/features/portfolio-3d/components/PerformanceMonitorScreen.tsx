'use client';

import { ArrowLeft, ExternalLink, Gauge } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { PerformanceLab } from '@/features/performance-lab/components/PerformanceLab';
import { withPortfolio3dBasePath } from '../asset-url';
import { useEmbeddedScreenScrollSession } from '../hooks/useEmbeddedScreenScrollSession';
import { usePortfolio3dState } from '../state/Portfolio3dState';

export function PerformanceMonitorScreen({ interactive }: Readonly<{ interactive: boolean }>): React.ReactElement {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const { scrollRef, onScroll } = useEmbeddedScreenScrollSession(interactive);

  useEffect(() => {
    if (interactive) headingRef.current?.focus({ preventScroll: true });
  }, [interactive]);

  return (
    <section className="monitor-performance-screen" aria-label="Performance lab monitor">
      <header className="monitor-performance-heading">
        <Gauge size={22} aria-hidden="true" />
        <h2 ref={headingRef} tabIndex={-1}>Performance lab</h2>
        <span className="monitor-performance-label">Simulation</span>
      </header>
      <div
        ref={scrollRef}
        className="monitor-performance-scroll"
        tabIndex={interactive ? 0 : -1}
        aria-label="Performance controls and results"
        onScroll={onScroll}
      >
        <PerformanceLab variant="screen" />
      </div>
    </section>
  );
}

export function PerformanceMonitorControls(): React.ReactElement {
  const { setActiveSection } = usePortfolio3dState();

  return (
    <nav className="arcade-focus-controls" aria-label="Performance view controls">
      <button type="button" className="button-base button-secondary" onClick={() => setActiveSection('overview')}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Room
      </button>
      <a className="button-base button-secondary" href={withPortfolio3dBasePath('/labs/performance')}>
        <ExternalLink size={18} aria-hidden="true" />
        Full Page
      </a>
    </nav>
  );
}
