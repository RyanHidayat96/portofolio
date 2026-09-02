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
  instructionHintSlot,
  assetProgress
}: Readonly<{
  webglStatus: WebGLSupportStatus;
  canvasSlot: React.ReactNode;
  fallbackSlot: React.ReactNode;
  navigationSlot: React.ReactNode;
  sectionPanelSlot: React.ReactNode;
  instructionHintSlot?: React.ReactNode;
  assetProgress?: Portfolio3dLoadingProgress;
}>): React.ReactElement {
  const isLoadingCritical =
    webglStatus === 'supported' && assetProgress ? !assetProgress.isCriticalComplete : false;
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
      className="portfolio-3d-shell min-h-screen bg-[var(--background)] text-[var(--text-primary)]"
      style={{ minHeight: '100dvh' }}
    >
      <a href="#portfolio-3d-panel" className="skip-link">
        Skip to portfolio controls
      </a>

      <section
        id="portfolio-3d-content"
        className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 sm:px-6 lg:px-8"
        style={{
          minHeight: '100dvh',
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'
        }}
        aria-busy={isWaitingForRuntime}
      >
        <header className="grid gap-3 border-b border-[var(--border)] pb-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div>
            <p className="mono text-xs uppercase tracking-[0.24em] text-[var(--accent)]">
              RyanOS 3D Foundation
            </p>
            <h1 id="portfolio-3d-scene-title" className="mt-2 text-2xl font-semibold sm:text-3xl">
              Interactive portfolio runtime
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <a className="button-base button-secondary w-fit" href={withPortfolio3dBasePath('/workspace')}>
              Standard portfolio
            </a>
            <a
              className="button-base button-secondary w-fit"
              href={withPortfolio3dBasePath('/?section=contact')}
            >
              Contact
            </a>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]">
          <div
            className="relative h-[58svh] min-h-[420px] overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-deep-92)] lg:h-auto lg:min-h-[560px]"
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
            {isWaitingForRuntime ? (
              <div className="absolute inset-0 grid place-items-center bg-[var(--surface-deep-96)]/85 px-6 text-center">
                <div id="portfolio-3d-loading-status" role="status" aria-live="polite" aria-atomic="true">
                  <p className="mono text-xs uppercase tracking-[0.24em] text-[var(--accent)]">
                    {loadingLabel}
                  </p>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">{loadingDetail}</p>
                </div>
              </div>
            ) : hasCriticalAssetFailure ? (
              <div className="absolute bottom-4 left-4 right-4 z-10 rounded-[var(--radius-button)] border border-[var(--warning)] bg-[var(--surface-elevated)]/92 p-3 shadow-[var(--shadow-soft)] backdrop-blur sm:right-auto sm:max-w-[340px]">
                <p className="text-xs leading-5 text-[var(--text-muted)]">
                  Some room assets failed. Use the controls panel or open the HTML portfolio view.
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
                    href={withPortfolio3dBasePath('/workspace')}
                  >
                    HTML portfolio
                  </a>
                </div>
              </div>
            ) : (
              instructionHintSlot
            )}
          </div>

          <aside
            id="portfolio-3d-panel"
            className="flex min-h-0 max-h-[78svh] scroll-mt-4 flex-col gap-4 overflow-y-auto pr-1 lg:max-h-[calc(100dvh-8rem)]"
            aria-label="3D portfolio controls and section content"
          >
            {navigationSlot}
            {sectionPanelSlot}
          </aside>
        </div>
      </section>
    </main>
  );
}