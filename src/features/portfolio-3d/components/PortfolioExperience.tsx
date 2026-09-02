'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { ExternalLink } from 'lucide-react';
import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { withPortfolio3dBasePath } from '../asset-url';
import { shouldUsePortfolio3dMediumDefault } from '../runtime-capabilities';
import type {
  Portfolio3dHotspotDefinition,
  Portfolio3dHotspotId,
  Portfolio3dLoadingProgress,
  Portfolio3dQualityTier
} from '../types';
import {
  configurePortfolio3dRenderer,
  getInitialPortfolio3dDpr,
  portfolio3dDefaultCamera,
  portfolio3dRendererOptions,
  portfolio3dRendererPerformance
} from '../renderer-config';
import {
  createPortfolio3dLocationPath,
  isPortfolio3dRouteQueryValue,
  portfolio3dSectionQueryParam,
  resolvePortfolio3dSectionFromLocation
} from '../route-map';
import { portfolio3dHotspots } from '../scene-manifest';
import { portfolio3dSectionContracts } from '../section-contracts';
import {
  getPortfolio3dPanelContent,
  isPortfolio3dSafeHref,
  type Portfolio3dPanelBlock
} from '../screen-content';
import { ExperienceShell } from './ExperienceShell';
import { Portfolio3dHtmlFallback } from './Portfolio3dHtmlFallback';
import { useDocumentVisibility } from '../hooks/useDocumentVisibility';
import { useWebGLSupport } from '../hooks/useWebGLSupport';
import { Portfolio3dProvider, usePortfolio3dState } from '../state/Portfolio3dState';
import { RoomShellStage } from './RoomShellStage';

interface Portfolio3dErrorBoundaryState {
  readonly hasError: boolean;
}

const roomControlHotspotIds = [
  'window',
  'door',
  'room-lighting',
  'ceiling-lights',
  'desk-lamp'
] as const satisfies readonly Portfolio3dHotspotId[];
const qualityTiers = ['low', 'medium', 'high'] as const satisfies readonly Portfolio3dQualityTier[];

export function PortfolioExperience(): React.ReactElement {
  const fallback = <Portfolio3dHtmlFallback />;

  return (
    <Portfolio3dErrorBoundary fallback={fallback}>
      <Portfolio3dProvider>
        <PortfolioExperienceContent fallback={fallback} />
      </Portfolio3dProvider>
    </Portfolio3dErrorBoundary>
  );
}

function PortfolioExperienceContent({
  fallback
}: Readonly<{
  fallback: React.ReactNode;
}>): React.ReactElement {
  const webglStatus = useWebGLSupport();
  const { state, setQualityTier } = usePortfolio3dState();
  const [assetProgress, setAssetProgress] = useState<Portfolio3dLoadingProgress>();
  const responsiveDefaultsAppliedRef = useRef(false);

  useEffect(() => {
    if (responsiveDefaultsAppliedRef.current || typeof window === 'undefined') {
      return;
    }

    responsiveDefaultsAppliedRef.current = true;
    if (shouldUsePortfolio3dMediumDefault()) {
      setQualityTier('medium');
    }
  }, [setQualityTier]);

  return (
    <>
      <Portfolio3dRouteController />
      <ExperienceShell
        webglStatus={webglStatus}
        fallbackSlot={fallback}
        canvasSlot={
          webglStatus === 'supported' ? (
            <FoundationCanvas
              qualityTier={state.qualityTier}
              onCriticalProgressChange={setAssetProgress}
            />
          ) : null
        }
        navigationSlot={<Portfolio3dNavigation />}
        sectionPanelSlot={<Portfolio3dSectionPanel />}
        instructionHintSlot={<Portfolio3dInstructionHint />}
        assetProgress={assetProgress}
      />
    </>
  );
}

function Portfolio3dRouteController(): null {
  const { state, setActiveSection } = usePortfolio3dState();
  const initialLocationSyncedRef = useRef(false);
  const historySyncRef = useRef(false);

  useEffect(() => {
    const syncFromLocation = (): void => {
      const searchParams = new URLSearchParams(window.location.search);
      const queryValue = searchParams.get(portfolio3dSectionQueryParam)?.trim();
      const hashValue = window.location.hash.replace(/^#/, '').trim();

      if (!queryValue && hashValue && !isPortfolio3dRouteQueryValue(hashValue)) {
        return;
      }

      const sectionId = resolvePortfolio3dSectionFromLocation(window.location.search, window.location.hash);
      historySyncRef.current = true;
      setActiveSection(sectionId);
      window.setTimeout(() => {
        historySyncRef.current = false;
      }, 0);
    };

    syncFromLocation();
    window.queueMicrotask(() => {
      initialLocationSyncedRef.current = true;
    });

    window.addEventListener('popstate', syncFromLocation);
    window.addEventListener('hashchange', syncFromLocation);

    return () => {
      window.removeEventListener('popstate', syncFromLocation);
      window.removeEventListener('hashchange', syncFromLocation);
    };
  }, [setActiveSection]);

  useEffect(() => {
    if (!initialLocationSyncedRef.current) {
      return;
    }

    const nextPath = createPortfolio3dLocationPath(
      state.activeSectionId,
      window.location.pathname,
      window.location.search
    );
    const currentPath = `${window.location.pathname}${window.location.search}`;

    if (nextPath === currentPath && !window.location.hash) {
      return;
    }

    const nextState = {
      ...(window.history.state ?? {}),
      portfolio3dSection: state.activeSectionId
    };
    const method = historySyncRef.current ? 'replaceState' : 'pushState';
    window.history[method](nextState, '', nextPath);
    historySyncRef.current = false;
  }, [state.activeSectionId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape' || state.activeSectionId === 'overview') {
        return;
      }

      event.preventDefault();
      setActiveSection('overview');
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setActiveSection, state.activeSectionId]);

  return null;
}

function FoundationCanvas({
  qualityTier,
  onCriticalProgressChange
}: Readonly<{
  qualityTier: Portfolio3dQualityTier;
  onCriticalProgressChange?: (progress: Portfolio3dLoadingProgress) => void;
}>): React.ReactElement {
  const isDocumentVisible = useDocumentVisibility();
  const dpr = useMemo(() => getInitialPortfolio3dDpr(qualityTier), [qualityTier]);

  return (
    <Canvas
      className="absolute inset-0 h-full w-full"
      dpr={dpr}
      frameloop={isDocumentVisible ? 'demand' : 'never'}
      camera={portfolio3dDefaultCamera}
      gl={portfolio3dRendererOptions}
      performance={portfolio3dRendererPerformance}
      resize={{ scroll: false }}
      onCreated={({ gl }) => {
        configurePortfolio3dRenderer(gl);
        gl.domElement.setAttribute('aria-hidden', 'true');
        gl.domElement.tabIndex = -1;
      }}
    >
      <CanvasVisibilityInvalidator isVisible={isDocumentVisible} qualityTier={qualityTier} />
      <Suspense fallback={null}>
        <FoundationScene
          qualityTier={qualityTier}
          onCriticalProgressChange={onCriticalProgressChange}
        />
      </Suspense>
    </Canvas>
  );
}

function CanvasVisibilityInvalidator({
  isVisible,
  qualityTier
}: Readonly<{
  isVisible: boolean;
  qualityTier: Portfolio3dQualityTier;
}>): null {
  const { invalidate } = useThree();

  useEffect(() => {
    if (isVisible) {
      invalidate();
    }
  }, [invalidate, isVisible, qualityTier]);

  return null;
}

function FoundationScene({
  qualityTier,
  onCriticalProgressChange
}: Readonly<{
  qualityTier: Portfolio3dQualityTier;
  onCriticalProgressChange?: (progress: Portfolio3dLoadingProgress) => void;
}>): React.ReactElement {
  return (
    <RoomShellStage
      qualityTier={qualityTier}
      onCriticalProgressChange={onCriticalProgressChange}
    />
  );
}

function Portfolio3dNavigation(): React.ReactElement {
  const {
    state,
    setActiveSection,
    setFocusedHotspot,
    activateHotspot
  } = usePortfolio3dState();
  const isTransitioning = state.navigationState === 'focusing' || state.navigationState === 'returning';

  return (
    <nav
      className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-elevated)] p-3"
      aria-label="3D portfolio sections"
    >
      <p className="mono mb-3 text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
        sections
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
        {portfolio3dSectionContracts.map((contract) => {
          const isActive = state.activeSectionId === contract.id;
          const isLocked = isTransitioning && !isActive && contract.id !== 'overview';
          const hotspot = getHotspotById(contract.hotspotId);

          return (
            <button
              key={contract.id}
              type="button"
              className="button-base button-secondary min-h-11 justify-start text-left text-xs sm:text-sm"
              data-active={isActive}
              aria-pressed={isActive}
              disabled={isLocked}
              onFocus={() => setFocusedHotspot(hotspot?.id, 'keyboard')}
              onBlur={() => setFocusedHotspot(undefined)}
              onClick={() => {
                if (isLocked) {
                  return;
                }

                if (hotspot) {
                  activateHotspot(hotspot, 'keyboard');
                  return;
                }

                setActiveSection(contract.id);
              }}
            >
              {contract.label}
            </button>
          );
        })}
      </div>

      <Portfolio3dQualityControl />
      <Portfolio3dRoomControls />
    </nav>
  );
}

function Portfolio3dQualityControl(): React.ReactElement {
  const { state, setQualityTier } = usePortfolio3dState();

  return (
    <section
      className="mt-4 border-t border-[var(--border)] pt-4"
      aria-labelledby="portfolio-3d-quality-label"
    >
      <p
        id="portfolio-3d-quality-label"
        className="mono mb-3 text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
      >
        quality
      </p>
      <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="portfolio-3d-quality-label">
        {qualityTiers.map((tier) => (
          <button
            key={tier}
            type="button"
            className="button-base button-secondary min-h-11 justify-center text-xs capitalize"
            data-active={state.qualityTier === tier}
            aria-pressed={state.qualityTier === tier}
            aria-label={`Use ${tier} render quality`}
            onClick={() => setQualityTier(tier)}
          >
            {tier}
          </button>
        ))}
      </div>
    </section>
  );
}

function Portfolio3dRoomControls(): React.ReactElement {
  const {
    state,
    setFocusedHotspot,
    activateHotspot
  } = usePortfolio3dState();

  return (
    <section className="mt-4 border-t border-[var(--border)] pt-4" aria-label="Room controls">
      <p className="mono mb-3 text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
        room
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
        {roomControlHotspotIds.map((hotspotId) => {
          const hotspot = getHotspotById(hotspotId);
          if (!hotspot) {
            return null;
          }

          return (
            <button
              key={hotspot.id}
              type="button"
              className="button-base button-secondary min-h-11 justify-between text-left text-xs"
              data-active={isRoomControlActive(hotspot.id, state)}
              aria-pressed={isRoomControlActive(hotspot.id, state)}
              onFocus={() => setFocusedHotspot(hotspot.id, 'keyboard')}
              onBlur={() => setFocusedHotspot(undefined)}
              onClick={() => activateHotspot(hotspot, 'keyboard')}
            >
              <span>{hotspot.label}</span>
              <span className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-subtle)]">
                {getRoomControlStatus(hotspot.id, state)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Portfolio3dInstructionHint(): React.ReactElement | null {
  const { state, setInstructionHintDismissed } = usePortfolio3dState();

  if (state.isInstructionHintDismissed) {
    return null;
  }

  return (
    <div className="absolute bottom-4 left-4 right-4 z-10 max-w-[320px] rounded-[var(--radius-button)] border border-[var(--accent-border)] bg-[var(--surface-elevated)]/92 p-3 shadow-[var(--shadow-soft)] backdrop-blur sm:right-auto">
      <p className="text-xs leading-5 text-[var(--text-muted)]">
        Tap room markers or use section buttons. Camera stays guided.
      </p>
      <button
        type="button"
        className="button-base button-ghost mt-2 min-h-10 px-0 py-0 text-[10px] uppercase tracking-[0.18em] text-[var(--accent)]"
        aria-label="Dismiss 3D portfolio hint"
        onClick={() => setInstructionHintDismissed(true)}
      >
        Dismiss
      </button>
    </div>
  );
}

function Portfolio3dSectionPanel(): React.ReactElement {
  const { state, setActiveSection } = usePortfolio3dState();
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const activeContract =
    portfolio3dSectionContracts.find((contract) => contract.id === state.activeSectionId) ??
    portfolio3dSectionContracts[0];
  const content =
    getPortfolio3dPanelContent(state.activeSectionId) ?? getPortfolio3dPanelContent('overview');
  const isOverview = state.activeSectionId === 'overview';

  useEffect(() => {
    const handle = window.setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 0);
    return () => window.clearTimeout(handle);
  }, [state.activeSectionId]);

  if (!content) {
    return (
      <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
        <p className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
          content
        </p>
        <h2 className="mt-2 text-xl font-semibold">Content unavailable</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
          No public portfolio data is mapped for this section yet.
        </p>
      </section>
    );
  }

  return (
    <section
      className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-elevated)] p-4"
      aria-labelledby="portfolio-3d-panel-heading"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
          {content.eyebrow}
        </p>
        <span className="mono rounded-full border border-[var(--border)] px-2 py-1 text-[9px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">
          {activeContract.label}
        </span>
      </div>

      <h2
        id="portfolio-3d-panel-heading"
        ref={headingRef}
        tabIndex={-1}
        className="mt-2 text-xl font-semibold leading-tight"
      >
        {content.title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{content.summary}</p>

      {content.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Related tags">
          {content.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[var(--border)] bg-[var(--surface-base)] px-2 py-1 text-[11px] font-semibold text-[var(--text-muted)]"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-xs text-[var(--text-subtle)]">{content.emptyLabel}</p>
      )}

      <div className="mt-5 grid gap-3">
        {content.blocks.length > 0 ? (
          content.blocks.map((block) => <Portfolio3dContentBlock key={block.heading} block={block} />)
        ) : (
          <p className="text-sm text-[var(--text-muted)]">{content.emptyLabel}</p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {isPortfolio3dSafeHref(activeContract.routePath) ? (
          <a
            className="button-base button-secondary justify-center text-xs"
            href={getPortfolio3dPanelHref(activeContract.routePath)}
          >
            Open HTML view
          </a>
        ) : null}
        {content.links.map((link) => (
          <a
            key={link.label + '-' + link.href}
            className="button-base button-secondary justify-center text-xs"
            href={getPortfolio3dPanelHref(link.href)}
            {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            <ExternalLink aria-hidden="true" size={14} />
            {link.label}
          </a>
        ))}
      </div>

      {!isOverview ? (
        <button
          type="button"
          className="button-base button-secondary mt-4 w-full justify-center"
          onClick={() => setActiveSection('overview')}
        >
          Back to overview
        </button>
      ) : null}
    </section>
  );
}

function Portfolio3dContentBlock({
  block
}: Readonly<{
  block: Portfolio3dPanelBlock;
}>): React.ReactElement {
  return (
    <article className="rounded-[var(--radius-button)] border border-[var(--border)] bg-[var(--surface-base)] p-3">
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{block.heading}</h3>
      {block.body ? (
        <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{block.body}</p>
      ) : null}
      {block.items && block.items.length > 0 ? (
        <ul className="mt-3 grid gap-2">
          {block.items.map((item) => (
            <li key={item} className="flex gap-2 text-xs leading-5 text-[var(--text-muted)]">
              <span
                className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function getPortfolio3dPanelHref(href: string): string {
  return href.startsWith('/') ? withPortfolio3dBasePath(href) : href;
}

function getHotspotById(hotspotId: Portfolio3dHotspotId | undefined): Portfolio3dHotspotDefinition | undefined {
  return hotspotId ? portfolio3dHotspots.find((hotspot) => hotspot.id === hotspotId) : undefined;
}

function isRoomControlActive(hotspotId: Portfolio3dHotspotId, state: ReturnType<typeof usePortfolio3dState>['state']): boolean {
  if (hotspotId === 'door') {
    return state.isDoorOpen;
  }

  if (hotspotId === 'window') {
    return state.environmentVariant !== 'studio';
  }

  if (hotspotId === 'ceiling-lights') {
    return state.ceilingLightingLevel > 0;
  }

  if (hotspotId === 'desk-lamp') {
    return state.deskTaskLightingLevel > 0;
  }

  if (hotspotId === 'room-lighting') {
    return state.lightingMode !== 'studio';
  }

  return false;
}

function getRoomControlStatus(hotspotId: Portfolio3dHotspotId, state: ReturnType<typeof usePortfolio3dState>['state']): string {
  if (hotspotId === 'door') {
    return state.isDoorOpen ? 'open' : 'closed';
  }

  if (hotspotId === 'window') {
    return state.environmentVariant;
  }

  if (hotspotId === 'ceiling-lights') {
    return `${formatLightLevel(state.ceilingLightingLevel)} / ${state.ceilingLightAim}`;
  }

  if (hotspotId === 'desk-lamp') {
    return state.deskTaskLightingLevel > 0 ? 'on' : 'off';
  }

  if (hotspotId === 'room-lighting') {
    return state.lightingMode;
  }

  return '';
}

function formatLightLevel(level: number): string {
  if (level <= 0) {
    return 'off';
  }

  return level < 0.7 ? 'dim' : 'full';
}

class Portfolio3dErrorBoundary extends Component<
  Readonly<{ children: React.ReactNode; fallback: React.ReactNode }>,
  Portfolio3dErrorBoundaryState
> {
  readonly state: Portfolio3dErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): Portfolio3dErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[portfolio-3d] Runtime failed. Rendering HTML portfolio fallback.', error);
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}