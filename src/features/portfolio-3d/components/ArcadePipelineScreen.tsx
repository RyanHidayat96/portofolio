'use client';

import { PipelineSimulatorPanel } from '@/features/pipeline/components/PipelineSimulatorPanel';
import { usePortfolio3dState } from '../state/Portfolio3dState';
import { ChevronLeft, Gamepad2, Monitor, ExternalLink } from 'lucide-react';
import { withPortfolio3dBasePath } from '../asset-url';

export function ArcadePipelineScreen(): React.ReactElement {
  const { setActiveSection } = usePortfolio3dState();

  return (
    <div className="relative flex flex-col items-center justify-center p-2 sm:p-4 w-full h-full animate-in fade-in zoom-in-95 duration-500">
      {/* Outer Arcade Screen Bezel Container with Edge Margins */}
      <div className="relative w-full max-w-4xl mx-auto rounded-2xl border-4 border-[#39d353]/70 bg-[#080d14]/95 p-3 sm:p-5 shadow-[0_0_60px_rgba(57,211,83,0.35)] backdrop-blur-md overflow-hidden transition-all duration-300">
        
        {/* Subtle Arcade Scanline Overlay */}
        <div 
          className="pointer-events-none absolute inset-0 z-30 opacity-15 mix-blend-overlay"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, #000, #000 2px, transparent 2px, transparent 4px)'
          }}
        />

        {/* Arcade Marquee Header Bar */}
        <div className="relative z-40 mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#39d353]/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#39d353]/50 bg-[#39d353]/15 text-[#39d353] shadow-[0_0_12px_rgba(57,211,83,0.4)]">
              <Gamepad2 size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="mono text-[10px] uppercase tracking-[0.22em] text-[#39d353]">
                  MOHIT Arcade Cabinet
                </span>
                <span className="mono animate-pulse rounded-full bg-[#39d353]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#39d353]">
                  LIVE CI/CD
                </span>
              </div>
              <h2 className="text-sm font-semibold text-white sm:text-base">
                Software Delivery Pipeline Simulator
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={withPortfolio3dBasePath('/labs/pipeline')}
              target="_blank"
              rel="noopener noreferrer"
              className="mono inline-flex items-center gap-1.5 rounded-lg border border-[rgba(85,215,255,0.3)] bg-[rgba(15,23,34,0.8)] px-2.5 py-1.5 text-xs text-[#55d7ff] hover:bg-[#55d7ff]/10 transition-colors"
            >
              <ExternalLink size={13} />
              <span>Full Page</span>
            </a>
            <button
              type="button"
              onClick={() => setActiveSection('overview')}
              className="mono inline-flex items-center gap-1 rounded-lg border border-[#39d353]/40 bg-[#39d353]/10 px-3 py-1.5 text-xs font-semibold text-[#39d353] hover:bg-[#39d353]/25 transition-all"
            >
              <ChevronLeft size={14} />
              <span>Back to Room</span>
            </button>
          </div>
        </div>

        {/* Embedded Interactive Pipeline Simulator */}
        <div className="relative z-40 max-h-[68dvh] overflow-y-auto pr-1 custom-scrollbar">
          <PipelineSimulatorPanel />
        </div>
      </div>
    </div>
  );
}
