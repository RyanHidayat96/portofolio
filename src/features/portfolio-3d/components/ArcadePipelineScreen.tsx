"use client";

import { ArrowLeft, Cpu, ExternalLink, GitBranch, Radio } from "lucide-react";
import { useEffect, useRef } from "react";
import { PipelineSimulatorPanel } from "@/features/pipeline/components/PipelineSimulatorPanel";
import { usePortfolio3dState } from "../state/Portfolio3dState";
import { withPortfolio3dBasePath } from "../asset-url";
import { useEmbeddedScreenScrollSession } from "../hooks/useEmbeddedScreenScrollSession";

export function ArcadePipelineScreen({ interactive }: Readonly<{ interactive: boolean }>): React.ReactElement {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const { scrollRef, onScroll } = useEmbeddedScreenScrollSession(interactive);

  useEffect(() => {
    if (interactive) headingRef.current?.focus({ preventScroll: true });
  }, [interactive]);

  return (
    <div className="arcade-crt-physical-enclosure" aria-label="Physical CRT Monitor Chassis">
      {/* Molded Outer Bezel Top Chassis */}
      <div className="arcade-crt-chassis-top" aria-hidden="true">
        <div className="arcade-crt-corner-screw">[+]</div>
        <div className="arcade-crt-vent-cluster">
          <span className="arcade-crt-vent-slot" />
          <span className="arcade-crt-vent-slot" />
          <span className="arcade-crt-vent-slot" />
          <span className="arcade-crt-vent-slot" />
          <span className="arcade-crt-vent-slot" />
        </div>
        <div className="arcade-crt-nameplate">
          <span className="arcade-crt-power-led" />
          <span className="mono">RYAN-OS // CRT MONITOR MODEL-84 // AMBER PHOSPHOR // 60Hz</span>
        </div>
        <div className="arcade-crt-hardware-knobs">
          <div className="arcade-crt-knob-group">
            <span className="arcade-crt-knob" title="BRIGHTNESS" />
            <span className="arcade-crt-knob-label">BRT</span>
          </div>
          <div className="arcade-crt-knob-group">
            <span className="arcade-crt-knob" title="CONTRAST" />
            <span className="arcade-crt-knob-label">CON</span>
          </div>
        </div>
        <div className="arcade-crt-corner-screw">[+]</div>
      </div>

      {/* Recessed Curved CRT Glass Tube Viewport */}
      <div className="arcade-crt-tube-viewport">
        {/* Specular glass reflection & raster mesh overlays */}
        <div className="arcade-crt-glass-glare" aria-hidden="true" />
        <div className="arcade-crt-raster-scanlines" aria-hidden="true" />
        <div className="arcade-crt-tube-vignette" aria-hidden="true" />

        <section className="arcade-pipeline-screen" aria-label="Arcade pipeline simulator">
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
                <Radio size={12} className="animate-pulse" />
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
            <PipelineSimulatorPanel variant="screen" />
          </div>

          {/* CRT Monitor Bottom Status Trim */}
          <footer className="arcade-crt-screen-footer mono text-[11px] text-[var(--text-muted)] flex items-center justify-between px-4 py-1.5 border-t border-[var(--border-strong)] bg-[var(--surface-raised)]" aria-hidden="true">
            <span>╚══[ RASTER APERTURE: P3 AMBER ]</span>
            <span>BEAM CURRENT: 120µA</span>
            <span>FRAME: 1000x638 ══╝</span>
          </footer>
        </section>
      </div>

      {/* Molded Outer Bezel Bottom Chassis */}
      <div className="arcade-crt-chassis-bottom" aria-hidden="true">
        <div className="arcade-crt-corner-screw">[+]</div>
        <div className="mono text-[10px] text-[var(--text-subtle)] uppercase">
          HEAVY DUTY CATHODE RAY TUBE ENCLOSURE // HIGH VOLTAGE WARNING // MODEL-84
        </div>
        <div className="arcade-crt-corner-screw">[+]</div>
      </div>
    </div>
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
