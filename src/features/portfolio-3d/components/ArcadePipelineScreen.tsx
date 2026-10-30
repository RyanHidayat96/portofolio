"use client";

import { ArrowLeft, Cpu, ExternalLink, GitBranch, Radio } from "lucide-react";
import { useEffect, useRef } from "react";
import { PipelineSimulatorPanel } from "@/features/pipeline/components/PipelineSimulatorPanel";
import { usePortfolio3dState } from "../state/Portfolio3dState";
import { withPortfolio3dBasePath } from "../asset-url";
import { useEmbeddedScreenScrollSession } from "../hooks/useEmbeddedScreenScrollSession";
import { prepareMobileRoomPreview } from "./ArcadeScreenSurface";

export function ArcadePipelineScreen({ interactive }: Readonly<{ interactive: boolean }>): React.ReactElement {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const { scrollRef, onScroll } = useEmbeddedScreenScrollSession(interactive);

  useEffect(() => {
    if (interactive) headingRef.current?.focus({ preventScroll: true });
  }, [interactive]);

  return (
    <section
      className="arcade-pipeline-screen"
      aria-label="Arcade pipeline simulator"
    >
      {/* CRT Glass Faceplate Optical Layers (Phosphor mesh and inner bezel depth shadow) */}
      <div className="arcade-crt-phosphor-mesh" aria-hidden="true" />
      <div className="arcade-crt-glass-depth" aria-hidden="true" />

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
        onScroll={(event) => {
          onScroll(event);
          event.currentTarget.dataset.scrollTop = String(event.currentTarget.scrollTop);
        }}
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

  const returnToRoom = async (): Promise<void> => {
    // Mobile CSS3D can go black when Chromium reparents it into room layer.
    // Capture while focused, before that reparent happens.
    await prepareMobileRoomPreview("pipeline");
    setActiveSection("overview");
  };

  return (
    <nav className="arcade-focus-controls" aria-label="Pipeline view controls">
      <button type="button" className="button-base button-secondary" onClick={() => void returnToRoom()}>
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
