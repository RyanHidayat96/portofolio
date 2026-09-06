'use client';

import { withPortfolio3dBasePath } from '../asset-url';
import type { WebGLSupportStatus } from '../hooks/useWebGLSupport';
import type { Portfolio3dLoadingProgress } from '../types';

export function ExperienceShell({
  webglStatus,
  canvasSlot,
  fallbackSlot,
  navigationSlot,
  sectionPanelSlot,
  focusControlsSlot,
  assetProgress,
  isScreenFocusView = false
}: Readonly<{
  webglStatus: WebGLSupportStatus;
  canvasSlot: React.ReactNode;
  fallbackSlot: React.ReactNode;
  navigationSlot: React.ReactNode;
  sectionPanelSlot?: React.ReactNode;
  focusControlsSlot?: React.ReactNode;
  assetProgress?: Portfolio3dLoadingProgress;
  isScreenFocusView?: boolean;
}>): React.ReactElement {
  const isLoadingCritical =
    webglStatus === 'supported' ? (!assetProgress || !assetProgress.isCriticalComplete) : false;
  const isWaitingForRuntime = webglStatus === 'checking' || isLoadingCritical;
  const hasCriticalAssetFailure = Boolean(
    assetProgress && assetProgress.isCriticalComplete && assetProgress.failedCriticalAssets > 0
  );
  const loadingLabel = webglStatus === 'checking' ? 'checking webgl' : 'loading critical assets';
  const loadingDetail = assetProgress
    ? `${assetProgress.loadedCriticalAssets}/${assetProgress.totalCriticalAssets} critical assets ready${
        assetProgress.failedCriticalAssets > 0 ? `, ${assetProgress.failedCriticalAssets} failed` : ''
      }.`
    : 'Preparing the progressive 3D runtime.';

  if (webglStatus === 'unsupported') {
    return <>{fallbackSlot}</>;
  }

  return (
    <main
      className="portfolio-3d-shell relative min-h-screen overflow-x-hidden bg-[#03060a] text-[var(--text-primary)]"
      style={{ minHeight: '100dvh' }}
    >
      <a href="#portfolio-3d-panel" className="skip-link">
        Skip to portfolio controls
      </a>

      <section
        id="portfolio-3d-content"
        className="relative min-h-screen overflow-x-hidden"
        style={{ minHeight: '100dvh' }}
        aria-busy={isWaitingForRuntime}
      >
        <div
          className="absolute inset-0 z-0 bg-[#03060a]"
          aria-labelledby="portfolio-3d-scene-title"
          aria-describedby={
            isWaitingForRuntime
              ? 'portfolio-3d-canvas-description portfolio-3d-loading-status'
              : 'portfolio-3d-canvas-description'
          }
        >
          <p id="portfolio-3d-canvas-description" className="sr-only">
            The 3D canvas is visual navigation. Equivalent keyboard controls and readable content are available in the portfolio controls panel.
          </p>
          {canvasSlot}
          <div className="portfolio-3d-cinematic-vignette pointer-events-none absolute inset-0" />
          <div className="portfolio-3d-city-glow pointer-events-none absolute inset-y-0 left-0 w-[42vw]" />

          {isWaitingForRuntime ? (
            <div className="absolute inset-0 z-30 grid place-items-center bg-[rgba(3,6,10,0.66)] px-6 text-center backdrop-blur-sm">
              <div id="portfolio-3d-loading-status" role="status" aria-live="polite" aria-atomic="true">
                <p className="mono text-xs uppercase tracking-[0.24em] text-[var(--accent)]">
                  {loadingLabel}
                </p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{loadingDetail}</p>
              </div>
            </div>
          ) : hasCriticalAssetFailure ? (
            <div className="absolute bottom-5 right-5 z-30 max-w-[340px] rounded-[var(--radius-panel)] border border-[var(--warning)] bg-[var(--surface-elevated)]/88 p-3 shadow-[var(--shadow-soft)] backdrop-blur-md">
              <p className="text-xs leading-5 text-[var(--text-muted)]">
                Some room assets failed. Use controls or open the HTML portfolio view.
              </p>
              <div className="mt-2 flex flex-wrap gap-3">
                <a
                  className="mono inline-flex text-[10px] uppercase tracking-[0.18em] text-[var(--accent)]"
                  href="#portfolio-3d-panel"
                >
                  Open controls
                </a>
                <a
                  className="mono inline-flex text-[10px] uppercase tracking-[0.18em] text-[var(--accent)]"
                  href={withPortfolio3dBasePath('/overview')}
                >
                  HTML portfolio
                </a>
              </div>
            </div>
          ) : null}
        </div>

        <header inert={isScreenFocusView} aria-hidden={isScreenFocusView} className={`pointer-events-none absolute left-0 top-0 z-20 w-full px-5 pt-6 sm:px-8 sm:pt-8 lg:px-10 lg:pt-10 transition-opacity duration-500 ${isScreenFocusView ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-[390px]">
              <p
                id="portfolio-3d-scene-title"
                className="text-4xl font-semibold uppercase leading-none tracking-[0.01em] text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.62)] sm:text-5xl lg:text-6xl"
              >
                RyanOS
              </p>
              <p className="mt-3 text-base uppercase tracking-[0.12em] text-[rgba(168,213,238,0.94)] sm:text-xl">
                3D Workspace Concept
              </p>
            </div>

            <div className="portfolio-3d-top-actions pointer-events-auto hidden flex-wrap justify-end gap-2 sm:flex">
              <a
                className="button-base button-secondary bg-[rgba(14,23,35,0.72)] backdrop-blur-md"
                href={withPortfolio3dBasePath('/overview')}
              >
                Standard portfolio
              </a>
            </div>
          </div>
        </header>

        <aside
          id="portfolio-3d-panel"
          inert={isScreenFocusView}
          aria-hidden={isScreenFocusView}
          className={`portfolio-3d-glass-panel pointer-events-auto absolute bottom-5 left-5 z-20 max-h-[50dvh] w-[min(19rem,calc(100vw-2.5rem))] overflow-y-auto p-3 sm:bottom-8 sm:left-8 sm:max-h-[56dvh] sm:w-[19rem] lg:left-10 transition-all duration-500 ${isScreenFocusView ? 'opacity-0 pointer-events-none -translate-x-10' : 'opacity-100 translate-x-0'}`}
          aria-label="3D portfolio controls and section content"
        >
          {navigationSlot}
        </aside>

        {focusControlsSlot}

        {sectionPanelSlot ? (
            <section className="portfolio-3d-section-popover pointer-events-auto relative z-20 mx-4 mt-[100dvh] p-4 lg:absolute lg:bottom-5 lg:right-5 lg:mx-0 lg:mt-0 lg:max-h-[42dvh] lg:w-[min(28rem,calc(100vw-2.5rem))] lg:overflow-y-auto">
              {sectionPanelSlot}
            </section>
        ) : null}
      </section>
    </main>
  );
}
