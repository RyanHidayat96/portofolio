'use client';

import { ArrowLeft, ExternalLink, GitBranch } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { PipelineSimulatorPanel } from '@/features/pipeline/components/PipelineSimulatorPanel';
import { usePortfolio3dState } from '../state/Portfolio3dState';
import { withPortfolio3dBasePath } from '../asset-url';

export function ArcadePipelineScreen({ interactive }: Readonly<{ interactive: boolean }>): React.ReactElement {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lastScrollTopRef = useRef(0);

  useEffect(() => {
    if (interactive) headingRef.current?.focus({ preventScroll: true });
  }, [interactive]);

  useLayoutEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const restoreScroll = (): void => {
      const maxScrollTop = Math.max(0, scrollContainer.scrollHeight - scrollContainer.clientHeight);
      scrollContainer.scrollTop = Math.min(lastScrollTopRef.current, maxScrollTop);
    };

    // CSS3D reparents the screen once after each layout switch. Restore across
    // several frames so room view and focused view show the same last position.
    let framesRemaining = 4;
    let animationFrame = 0;
    const restoreAcrossFrames = (): void => {
      restoreScroll();
      framesRemaining -= 1;
      if (framesRemaining > 0) {
        animationFrame = window.requestAnimationFrame(restoreAcrossFrames);
      }
    };

    restoreAcrossFrames();
    return () => {
      if (interactive) {
        lastScrollTopRef.current = scrollContainer.scrollTop;
      }
      window.cancelAnimationFrame(animationFrame);
    };
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
        onScroll={(event) => {
          if (interactive) {
            lastScrollTopRef.current = event.currentTarget.scrollTop;
          }
        }}
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
