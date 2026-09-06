'use client';

import { ArrowLeft, ExternalLink, Terminal } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { TerminalPanel } from '@/features/terminal/components/TerminalPanel';
import type { WorkspaceSection } from '@/features/workspace/types';
import { withPortfolio3dBasePath } from '../asset-url';
import { useEmbeddedScreenScrollSession } from '../hooks/useEmbeddedScreenScrollSession';
import { usePortfolio3dState } from '../state/Portfolio3dState';
import type { Portfolio3dSectionId } from '../types';

const terminalNavigationTargets = {
  overview: 'overview',
  profile: 'profile',
  experience: 'experience',
  projects: 'projects',
  automation: 'automation',
  pipeline: 'pipeline',
  performance: 'performance',
  api: 'backend',
  architecture: 'architecture',
  terminal: 'terminal',
  challenge: 'overview',
  contact: 'contact'
} satisfies Partial<Record<WorkspaceSection, Portfolio3dSectionId>>;

export function TerminalMonitorScreen({ interactive }: Readonly<{ interactive: boolean }>): React.ReactElement {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const { scrollRef, onScroll } = useEmbeddedScreenScrollSession(interactive);
  const { setActiveSection } = usePortfolio3dState();

  useEffect(() => {
    if (interactive) headingRef.current?.focus({ preventScroll: true });
  }, [interactive]);

  return (
    <section className="monitor-terminal-screen" aria-label="Terminal monitor">
      <header className="monitor-terminal-heading">
        <Terminal size={22} aria-hidden="true" />
        <h2 ref={headingRef} tabIndex={-1}>Terminal</h2>
        <span className="monitor-terminal-label">Command interface</span>
      </header>
      <div
        ref={scrollRef}
        className="monitor-terminal-scroll"
        tabIndex={interactive ? 0 : -1}
        aria-label="Terminal commands and output"
        onScroll={onScroll}
      >
        <TerminalPanel
          variant="screen"
          onNavigate={(section) => setActiveSection(terminalNavigationTargets[section] ?? 'overview')}
        />
      </div>
    </section>
  );
}

export function TerminalMonitorControls(): React.ReactElement {
  const { setActiveSection } = usePortfolio3dState();

  return (
    <nav className="arcade-focus-controls" aria-label="Terminal view controls">
      <button type="button" className="button-base button-secondary" onClick={() => setActiveSection('overview')}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Room
      </button>
      <a className="button-base button-secondary" href={withPortfolio3dBasePath('/terminal')}>
        <ExternalLink size={18} aria-hidden="true" />
        Full Page
      </a>
    </nav>
  );
}
