'use client';

import { ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { AutomationLab } from '@/features/automation-lab/components/AutomationLab';
import { withPortfolio3dBasePath } from '../asset-url';
import { usePortfolio3dState } from '../state/Portfolio3dState';

export function AutomationMonitorScreen({ interactive }: Readonly<{ interactive: boolean }>): React.ReactElement {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (interactive) headingRef.current?.focus({ preventScroll: true });
  }, [interactive]);

  return (
    <section className="monitor-automation-screen" aria-label="Automation lab monitor">
      <header className="monitor-automation-heading">
        <ShieldCheck size={22} aria-hidden="true" />
        <h2 ref={headingRef} tabIndex={-1}>Automation lab</h2>
        <span className="monitor-automation-label">Simulation</span>
      </header>
      <div className="monitor-automation-scroll" tabIndex={interactive ? 0 : -1} aria-label="Automation controls and results">
        <AutomationLab variant="screen" />
      </div>
    </section>
  );
}

export function AutomationMonitorControls(): React.ReactElement {
  const { setActiveSection } = usePortfolio3dState();

  return (
    <nav className="arcade-focus-controls" aria-label="Automation view controls">
      <button type="button" className="button-base button-secondary" onClick={() => setActiveSection('overview')}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Room
      </button>
      <a className="button-base button-secondary" href={withPortfolio3dBasePath('/labs/automation')}>
        <ExternalLink size={18} aria-hidden="true" />
        Full Page
      </a>
    </nav>
  );
}
