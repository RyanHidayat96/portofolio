"use client";

import { ArrowLeft, Cpu, ExternalLink, GitBranch, Radio } from "lucide-react";
import { useEffect, useRef } from "react";
import { PipelineSimulatorPanel } from "@/features/pipeline/components/PipelineSimulatorPanel";
import { usePortfolio3dState } from "../state/Portfolio3dState";
import { withPortfolio3dBasePath } from "../asset-url";
import { useEmbeddedScreenScrollSession } from "../hooks/useEmbeddedScreenScrollSession";

export function ArcadePipelineScreen({ interactive }: Readonly<{ interactive: boolean }>): React.ReactElement {
  const containerRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const { scrollRef, onScroll } = useEmbeddedScreenScrollSession(interactive);

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
      el.style.setProperty("--glass-x", `${x}%`);
      el.style.setProperty("--glass-y", `${y}%`);
    }
  };

  return (
    <section
      ref={containerRef}
      className="arcade-pipeline-screen"
      aria-label="Arcade pipeline simulator"
      onPointerMove={interactive ? onPointerMove : undefined}
    >
      {/* CRT Glass Faceplate Optical Layers (Look like inside a heavy CRT monitor glass) */}
      <div className="arcade-crt-phosphor-mesh" aria-hidden="true" />
      <div className="arcade-crt-glass-depth" aria-hidden="true" />
      <div className="arcade-crt-glass-glare" aria-hidden="true" />

      <header className="arcade-pipeline-heading">
        <div className="flex items-center gap-2">
          <span className="text-[var(--accent)] font-bold text-base mono">╔═</span>
          <GitBranch size={20} aria-hidden="true" className="text-[var(--accent)]" />
          <h2 ref={headingRef} tabIndex={-1} className="mono uppercase tracking-wider text-base font-bold">
            CI/CD Delivery Pipeline Telemetry
          </h2>
        </div>
        <div className="arcade-simulation-meta flex items-center gap-3 mono text-xs">
          <span className="flex items-center gap-1 text-[var(--accent)]">
            <Radio size={12} className={interactive ? "animate-pulse" : ""} />
            <span>ONLINE // 60Hz</span>
          </span>
          <span className="arcade-simulation-label uppercase text-[var(--accent-secondary)]">
            [ SIMULATION MODE ] ═╗
          </span>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="arcade-pipeline-scroll"
        tabIndex={interactive ? 0 : -1}
        aria-label="Pipeline controls and results"
        onScroll={onScroll}
      >
        <PipelineSimulatorPanel variant="screen" interactive={interactive} />
      </div>

      {/* CRT Monitor Bottom Status Trim */}
      <footer
        className="arcade-crt-screen-footer mono text-[11px] text-[var(--text-muted)] flex items-center justify-between px-4 py-1.5 border-t border-[var(--border-strong)] bg-[var(--surface-raised)]"
        aria-hidden="true"
      >
        <span>╚══[ RASTER APERTURE: P3 AMBER ]</span>
        <span>BEAM CURRENT: 120µA</span>
        <span>FRAME: 1000x638 ══╝</span>
      </footer>
    </section>
  );
}

export function ArcadePipelineControls(): React.ReactElement {
  const { setActiveSection } = usePortfolio3dState();
  return (
    <nav className="arcade-focus-controls" aria-label="Pipeline view controls">
      <button type="button" className="button-base button-secondary" onClick={() => setActiveSection("overview")}>
        <ArrowLeft size={18} aria-hidden="true" />
        Back to Room
      </button>
      <a className="button-base button-secondary" href={withPortfolio3dBasePath("/labs/pipeline")}>
        <ExternalLink size={18} aria-hidden="true" />
        Full Page
      </a>
    </nav>
  );
}
