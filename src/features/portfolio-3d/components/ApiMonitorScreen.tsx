'use client';

import { ArrowLeft, ExternalLink, Radio, Send } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ApiPlayground } from '@/features/api-playground/components/ApiPlayground';
import { withPortfolio3dBasePath } from '../asset-url';
import { useEmbeddedScreenScrollSession } from '../hooks/useEmbeddedScreenScrollSession';
import { usePortfolio3dState } from '../state/Portfolio3dState';

export function ApiMonitorScreen({ interactive }: Readonly<{ interactive: boolean }>): React.ReactElement {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const { scrollRef, onScroll } = useEmbeddedScreenScrollSession(interactive);

  useEffect(() => {
    if (interactive) headingRef.current?.focus({ preventScroll: true });
  }, [interactive]);

  return (
    <section
      className="monitor-api-screen"
      aria-label="API playground monitor"
    >
      {/* CRT Glass Faceplate Optical Layers (Phosphor mesh and inner bezel depth shadow) */}
      <div className="arcade-crt-phosphor-mesh" aria-hidden="true" />
      <div className="arcade-crt-glass-depth" aria-hidden="true" />

      <header className="monitor-api-heading">
        <div className="flex items-center gap-2">
          <span className="text-[var(--accent)] font-bold text-base mono">╔═</span>
          <Send size={20} aria-hidden="true" className="text-[var(--accent)]" />
          <h2 ref={headingRef} tabIndex={-1} className="mono uppercase tracking-wider text-base font-bold">
            API Playground // Route Engine
          </h2>
        </div>
        <div className="arcade-simulation-meta flex items-center gap-3 mono text-xs">
          <span className="flex items-center gap-1 text-[var(--accent)]">
            <Radio size={12} className={interactive ? "animate-pulse" : ""} />
            <span>ONLINE // 60Hz</span>
          </span>
          <span className="arcade-simulation-label uppercase text-[var(--accent-secondary)]">
            [ LIVE ROUTES ] ═╗
          </span>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="monitor-api-scroll"
        tabIndex={interactive ? 0 : -1}
        aria-label="API controls and results"
        onScroll={onScroll}
      >
        <ApiPlayground variant="screen" interactive={interactive} />
      </div>

      {/* CRT Monitor Bottom Status Trim */}
      <footer
        className="arcade-crt-screen-footer mono text-[11px] text-[var(--text-muted)] flex items-center justify-between px-4 py-1.5 border-t border-[var(--border-strong)] bg-[var(--surface-raised)]"
        aria-hidden="true"
      >
        <span>╚══[ RASTER APERTURE: P3 AMBER ]</span>
        <span>PROTOCOL: HTTP/1.1 REST</span>
        <span>FRAME: 1000x638 ══╝</span>
      </footer>
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
      <a className="button-base button-secondary" href={withPortfolio3dBasePath('/labs/api')}>
        <ExternalLink size={18} aria-hidden="true" />
        Full Page
      </a>
    </nav>
  );
}
