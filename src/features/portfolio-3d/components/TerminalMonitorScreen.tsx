'use client';

import { ArrowLeft, ExternalLink, Radio, Terminal } from 'lucide-react';
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
  const containerRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const { scrollRef: terminalOutputScrollRef, onScroll: onTerminalOutputScroll } = useEmbeddedScreenScrollSession(interactive);
  const { setActiveSection } = usePortfolio3dState();

  useEffect(() => {
    if (interactive) headingRef.current?.focus({ preventScroll: true });
  }, [interactive]);

  const onPointerMove = (event: React.PointerEvent<HTMLElement>): void => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const x = Math.round(((event.clientX - rect.left) / rect.width) * 100);
      const y = Math.round(((event.clientY - rect.top) / rect.height) * 100);
      el.style.setProperty('--glass-x', `${x}%`);
      el.style.setProperty('--glass-y', `${y}%`);
    }
  };

  return (
    <section
      ref={containerRef}
      className="monitor-terminal-screen"
      aria-label="Terminal monitor"
      onPointerMove={interactive ? onPointerMove : undefined}
    >
      {/* CRT Glass Faceplate Optical Layers (Look like inside a heavy CRT monitor glass) */}
      <div className="arcade-crt-phosphor-mesh" aria-hidden="true" />
      <div className="arcade-crt-glass-depth" aria-hidden="true" />
      <div className="arcade-crt-glass-glare" aria-hidden="true" />

      <header className="monitor-terminal-heading">
        <div className="flex items-center gap-2">
          <span className="text-[var(--accent)] font-bold text-base mono">╔═</span>
          <Terminal size={20} aria-hidden="true" className="text-[var(--accent)]" />
          <h2 ref={headingRef} tabIndex={-1} className="mono uppercase tracking-wider text-base font-bold">
            DEC VT220 // Command Subsystem
          </h2>
        </div>
        <div className="arcade-simulation-meta flex items-center gap-3 mono text-xs">
          <span className="flex items-center gap-1 text-[var(--accent)]">
            <Radio size={12} className={interactive ? "animate-pulse" : ""} />
            <span>ONLINE // 60Hz</span>
          </span>
          <span className="arcade-simulation-label uppercase text-[var(--accent-secondary)]">
            [ INTERACTIVE SHELL ] ═╗
          </span>
        </div>
      </header>

      <div
        className="monitor-terminal-scroll"
        tabIndex={interactive ? 0 : -1}
        aria-label="Terminal commands and output"
      >
        <TerminalPanel
          variant="screen"
          interactive={interactive}
          terminalOutputRef={terminalOutputScrollRef}
          onTerminalOutputScroll={onTerminalOutputScroll}
          onNavigate={(section) => setActiveSection(terminalNavigationTargets[section] ?? 'overview')}
        />
      </div>

      {/* CRT Monitor Bottom Status Trim */}
      <footer
        className="arcade-crt-screen-footer mono text-[11px] text-[var(--text-muted)] flex items-center justify-between px-4 py-1.5 border-t border-[var(--border-strong)] bg-[var(--surface-raised)]"
        aria-hidden="true"
      >
        <span>╚══[ RASTER APERTURE: P3 AMBER ]</span>
        <span>BAUD: 9600 // VT220</span>
        <span>FRAME: 1000x638 ══╝</span>
      </footer>
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
